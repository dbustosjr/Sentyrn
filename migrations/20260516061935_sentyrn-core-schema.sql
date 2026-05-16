-- Sentyrn core schema (Phase 2): tenancy, sessions, governance, audit, rate limits

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TYPE public.workspace_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE public.session_review_status AS ENUM ('approved', 'needs_review', 'risk_accepted');
CREATE TYPE public.approval_state AS ENUM ('approved', 'needs_review', 'risk_accepted');
CREATE TYPE public.finding_severity AS ENUM ('low', 'medium', 'high');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  privacy_mode TEXT NOT NULL DEFAULT 'safe'
    CHECK (privacy_mode IN ('safe', 'standard', 'full')),
  retention_days INTEGER NOT NULL DEFAULT 90 CHECK (retention_days >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workspaces_slug ON public.workspaces(slug) WHERE deleted_at IS NULL;

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Membership
CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);

-- Repos
CREATE TABLE public.repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  remote_url TEXT,
  name TEXT NOT NULL,
  default_branch TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repos_workspace ON public.repos(workspace_id);

CREATE TRIGGER repos_updated_at
  BEFORE UPDATE ON public.repos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Devices & CLI tokens
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  os TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_workspace ON public.devices(workspace_id);

CREATE TABLE public.cli_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  token_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['ingest:write'],
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cli_tokens_workspace ON public.cli_tokens(workspace_id);
CREATE INDEX idx_cli_tokens_hash ON public.cli_tokens(token_hash) WHERE revoked_at IS NULL;

-- Coding sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES public.repos(id) ON DELETE SET NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  branch TEXT,
  model_provider TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  review_status public.session_review_status NOT NULL DEFAULT 'needs_review',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  findings_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_workspace_started ON public.sessions(workspace_id, started_at DESC);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  sequence BIGINT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  UNIQUE (session_id, sequence)
);

CREATE INDEX idx_session_events_session ON public.session_events(session_id, sequence);

CREATE TABLE public.session_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  severity public.finding_severity NOT NULL DEFAULT 'medium',
  detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_findings_session ON public.session_findings(session_id);

CREATE TABLE public.session_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  state public.approval_state NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_approvals_session ON public.session_approvals(session_id, created_at DESC);

-- Policies
CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  definition JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_workspace ON public.policies(workspace_id);

CREATE TRIGGER policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.policy_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_violations_workspace ON public.policy_violations(workspace_id);

-- Audit & ingestion ops
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_workspace_created ON public.audit_logs(workspace_id, created_at DESC);

CREATE TABLE public.ingestion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  batch_id TEXT,
  outcome TEXT NOT NULL,
  error_code TEXT,
  event_count INTEGER NOT NULL DEFAULT 0,
  payload_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ingestion_events_workspace ON public.ingestion_events(workspace_id, created_at DESC);

-- Rate limiting (server-side buckets)
CREATE TABLE public.rate_limit_buckets (
  bucket_key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);

-- RLS helpers (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND w.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND wm.role = 'admin'
      AND w.deleted_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.session_workspace_id(p_session_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.workspace_id FROM public.sessions s WHERE s.id = p_session_id LIMIT 1;
$$;

-- Rate limit check (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_bucket_key TEXT,
  p_window_seconds INTEGER DEFAULT 60,
  p_max_requests INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_count INTEGER;
BEGIN
  v_window := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO public.rate_limit_buckets (bucket_key, window_start, request_count)
  VALUES (p_bucket_key, v_window, 1)
  ON CONFLICT (bucket_key, window_start)
  DO UPDATE SET request_count = rate_limit_buckets.request_count + 1
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$;

-- Soft-delete workspace data (admin only via RLS on calling path)
CREATE OR REPLACE FUNCTION public.mark_workspace_deleted(p_workspace_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_workspace_admin(p_workspace_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.workspaces
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_workspace_id AND deleted_at IS NULL;
END;
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cli_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- workspaces
CREATE POLICY workspaces_select_member ON public.workspaces
  FOR SELECT USING (public.is_workspace_member(id));
CREATE POLICY workspaces_insert_authenticated ON public.workspaces
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY workspaces_update_admin ON public.workspaces
  FOR UPDATE USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

-- workspace_members
CREATE POLICY workspace_members_select ON public.workspace_members
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY workspace_members_insert_admin ON public.workspace_members
  FOR INSERT WITH CHECK (public.is_workspace_admin(workspace_id));
CREATE POLICY workspace_members_update_admin ON public.workspace_members
  FOR UPDATE USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));
CREATE POLICY workspace_members_delete_admin ON public.workspace_members
  FOR DELETE USING (public.is_workspace_admin(workspace_id));
CREATE POLICY workspace_members_insert_self_bootstrap ON public.workspace_members
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
    )
  );

-- repos
CREATE POLICY repos_all_member ON public.repos
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- devices
CREATE POLICY devices_all_member ON public.devices
  FOR ALL
  USING (public.is_workspace_member(workspace_id) AND user_id = (SELECT auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id) AND user_id = (SELECT auth.uid()));

-- cli_tokens
CREATE POLICY cli_tokens_select_member ON public.cli_tokens
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY cli_tokens_insert_member ON public.cli_tokens
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) AND user_id = (SELECT auth.uid()));
CREATE POLICY cli_tokens_update_owner ON public.cli_tokens
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- sessions
CREATE POLICY sessions_all_member ON public.sessions
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- session_events
CREATE POLICY session_events_all_member ON public.session_events
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- session_findings
CREATE POLICY session_findings_all_member ON public.session_findings
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- session_approvals
CREATE POLICY session_approvals_all_member ON public.session_approvals
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- policies
CREATE POLICY policies_select_member ON public.policies
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY policies_write_admin ON public.policies
  FOR ALL
  USING (public.is_workspace_admin(workspace_id))
  WITH CHECK (public.is_workspace_admin(workspace_id));

-- policy_violations
CREATE POLICY policy_violations_all_member ON public.policy_violations
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- audit_logs (append by members; read by members)
CREATE POLICY audit_logs_select_member ON public.audit_logs
  FOR SELECT USING (
    workspace_id IS NULL OR public.is_workspace_member(workspace_id)
  );
CREATE POLICY audit_logs_insert_member ON public.audit_logs
  FOR INSERT WITH CHECK (
    workspace_id IS NULL OR public.is_workspace_member(workspace_id)
  );

-- ingestion_events
CREATE POLICY ingestion_events_all_member ON public.ingestion_events
  FOR ALL
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

-- rate_limit_buckets: no direct client access
CREATE POLICY rate_limit_buckets_deny_all ON public.rate_limit_buckets
  FOR ALL USING (false);

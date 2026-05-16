import { createInsForgeServerClient } from "@/lib/insforge/server";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import type { AuthUser } from "@/lib/auth/session";
import { getAccessToken } from "@/lib/insforge/cookies";

export async function getWorkspaceContext(user: AuthUser) {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const bootstrap = await ensureUserBootstrap(user, accessToken);

  const client = createInsForgeServerClient(accessToken);
  const { data: workspace } = await client.database
    .from("workspaces")
    .select("id, name, slug, privacy_mode, retention_days")
    .eq("id", bootstrap.workspaceId)
    .limit(1);

  const row = workspace?.[0] as
    | {
        id: string;
        name: string;
        slug: string;
        privacy_mode: string;
        retention_days: number;
      }
    | undefined;

  return {
    user,
    bootstrap,
    workspace: row ?? {
      id: bootstrap.workspaceId,
      name: bootstrap.workspaceName,
      slug: bootstrap.workspaceSlug,
      privacy_mode: "safe",
      retention_days: 90,
    },
  };
}

import { createInsForgeServerClient } from "@/lib/insforge/server";
import { writeAuditLog } from "@/lib/audit";
import type { AuthUser } from "@/lib/auth/session";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "workspace";
}

export type UserBootstrap = {
  profileId: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

/** Ensures profile + default workspace exist for the signed-in user. */
export async function ensureUserBootstrap(
  user: AuthUser,
  accessToken: string,
  options?: { workspaceName?: string },
): Promise<UserBootstrap> {
  const client = createInsForgeServerClient(accessToken);

  const { data: existingMembers } = await client.database
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);

  const memberRow = existingMembers?.[0] as { workspace_id: string } | undefined;

  if (memberRow?.workspace_id) {
    const { data: workspaces } = await client.database
      .from("workspaces")
      .select("id, name, slug")
      .eq("id", memberRow.workspace_id)
      .limit(1);

    const workspace = workspaces?.[0] as { id: string; name: string; slug: string } | undefined;
    if (workspace) {
      return {
        profileId: user.id,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
      };
    }
  }

  const displayName = user.name ?? user.email?.split("@")[0] ?? "User";

  const { data: existingProfile } = await client.database
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .limit(1);

  if (!existingProfile?.length) {
    await client.database.from("profiles").insert([
      {
        id: user.id,
        display_name: displayName,
      },
    ]);
  }

  const workspaceName = options?.workspaceName?.trim() || `${displayName}'s workspace`;
  const slug = `${slugify(displayName)}-${user.id.slice(0, 8)}`;

  const { data: workspaceRows, error: workspaceError } = await client.database
    .from("workspaces")
    .insert([
      {
        name: workspaceName,
        slug,
        privacy_mode: "safe",
        retention_days: 90,
      },
    ])
    .select("id, name, slug");

  if (workspaceError || !workspaceRows?.[0]) {
    throw new Error(workspaceError?.message ?? "Failed to create workspace");
  }

  const workspace = workspaceRows[0] as { id: string; name: string; slug: string };

  const { error: memberError } = await client.database.from("workspace_members").insert([
    {
      workspace_id: workspace.id,
      user_id: user.id,
      role: "admin",
      joined_at: new Date().toISOString(),
    },
  ]);

  if (memberError) {
    throw new Error(memberError.message);
  }

  await writeAuditLog(client, {
    workspaceId: workspace.id,
    actorUserId: user.id,
    action: "workspace.created",
    resourceType: "workspace",
    resourceId: workspace.id,
    metadata: { slug: workspace.slug },
  });

  return {
    profileId: user.id,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
  };
}

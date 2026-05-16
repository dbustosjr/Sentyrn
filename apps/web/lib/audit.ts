import type { createClient } from "@insforge/sdk";

type InsForgeClient = ReturnType<typeof createClient>;

export async function writeAuditLog(
  client: InsForgeClient,
  input: {
    workspaceId?: string | null;
    actorUserId?: string | null;
    action: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.database.from("audit_logs").insert([
    {
      workspace_id: input.workspaceId ?? null,
      actor_user_id: input.actorUserId ?? null,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      metadata: input.metadata ?? {},
    },
  ]);
}

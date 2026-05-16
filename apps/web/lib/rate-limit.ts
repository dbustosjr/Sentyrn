import { createInsForgeServerClient } from "@/lib/insforge/server";

export async function checkRateLimit(
  bucketKey: string,
  options?: { windowSeconds?: number; maxRequests?: number },
): Promise<boolean> {
  const client = createInsForgeServerClient();
  const { data, error } = await client.database.rpc("check_rate_limit", {
    p_bucket_key: bucketKey,
    p_window_seconds: options?.windowSeconds ?? 60,
    p_max_requests: options?.maxRequests ?? 30,
  });

  if (error) {
    console.error("rate_limit_check_failed", error.message);
    return true;
  }

  return Boolean(data);
}

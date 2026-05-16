import { NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { clearAuthCookies, getRefreshToken, setAuthCookies } from "@/lib/insforge/cookies";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ error: "no_refresh_token" }, { status: 401 });
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.refreshSession({ refreshToken });

  if (error || !data?.accessToken) {
    await clearAuthCookies();
    return NextResponse.json({ error: error?.message ?? "refresh_failed" }, { status: 401 });
  }

  await setAuthCookies(data.accessToken, data.refreshToken);
  return NextResponse.json({ ok: true });
}

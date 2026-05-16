import { NextRequest, NextResponse } from "next/server";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  clearAuthCookies,
  consumeOAuthVerifier,
  setAuthCookies,
} from "@/lib/insforge/cookies";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { mapInsForgeUser } from "@/lib/auth/user";
import { getAppUrl, safeRedirectPath } from "@/lib/auth/redirect";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("insforge_code");
  const oauthError = params.get("error");
  const next = safeRedirectPath(params.get("next"));

  if (oauthError || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError ?? "oauth_failed")}`, getAppUrl()),
    );
  }

  const codeVerifier = await consumeOAuthVerifier();
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=missing_verifier", getAppUrl()));
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.exchangeOAuthCode(code, codeVerifier);

  if (error || !data?.accessToken) {
    await clearAuthCookies();
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error?.message ?? "exchange_failed")}`,
        getAppUrl(),
      ),
    );
  }

  await setAuthCookies(data.accessToken, data.refreshToken);

  const authed = createInsForgeServerClient(data.accessToken);
  const { data: userData, error: userError } = await authed.auth.getCurrentUser();
  if (userError || !userData?.user) {
    await clearAuthCookies();
    return NextResponse.redirect(new URL("/login?error=session_failed", getAppUrl()));
  }

  await ensureUserBootstrap(mapInsForgeUser(userData.user), data.accessToken);

  return NextResponse.redirect(new URL(next, getAppUrl()));
}

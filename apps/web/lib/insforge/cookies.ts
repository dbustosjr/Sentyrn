import { cookies } from "next/headers";

export const ACCESS_COOKIE = "insforge_access_token";
export const REFRESH_COOKIE = "insforge_refresh_token";
export const OAUTH_VERIFIER_COOKIE = "insforge_code_verifier";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function setAuthCookies(accessToken: string, refreshToken?: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...authCookieOptions, maxAge: 60 * 15 });
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, { ...authCookieOptions, maxAge: 60 * 60 * 24 * 7 });
  }
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  store.delete(OAUTH_VERIFIER_COOKIE);
}

export async function setOAuthVerifier(codeVerifier: string) {
  const store = await cookies();
  store.set(OAUTH_VERIFIER_COOKIE, codeVerifier, { ...authCookieOptions, maxAge: 600 });
}

export async function consumeOAuthVerifier(): Promise<string | undefined> {
  const store = await cookies();
  const value = store.get(OAUTH_VERIFIER_COOKIE)?.value;
  if (value) store.delete(OAUTH_VERIFIER_COOKIE);
  return value;
}

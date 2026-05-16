import { createInsForgeServerClient } from "@/lib/insforge/server";
import { getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/insforge/cookies";
import { mapInsForgeUser } from "@/lib/auth/user";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  let accessToken = await getAccessToken();
  if (!accessToken) return null;

  const client = createInsForgeServerClient(accessToken);
  let { data, error } = await client.auth.getCurrentUser();

  if ((error || !data?.user) && (await getRefreshToken())) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    const refreshClient = createInsForgeServerClient();
    const refreshed = await refreshClient.auth.refreshSession({ refreshToken });
    if (refreshed.data?.accessToken) {
      await setAuthCookies(refreshed.data.accessToken, refreshed.data.refreshToken);
      accessToken = refreshed.data.accessToken;
      const retry = createInsForgeServerClient(accessToken);
      ({ data, error } = await retry.auth.getCurrentUser());
    }
  }

  if (error || !data?.user) return null;

  return mapInsForgeUser(data.user);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

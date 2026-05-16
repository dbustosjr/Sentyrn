"use server";

import { redirect } from "next/navigation";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  clearAuthCookies,
  getAccessToken,
  setAuthCookies,
  setOAuthVerifier,
} from "@/lib/insforge/cookies";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { mapInsForgeUser } from "@/lib/auth/user";
import { getAppUrl, safeRedirectPath } from "@/lib/auth/redirect";
import { checkRateLimit } from "@/lib/rate-limit";

export type AuthActionState = {
  error?: string;
  requireEmailVerification?: boolean;
  email?: string;
};

async function completeSignIn(
  accessToken: string,
  refreshToken?: string,
  options?: { workspaceName?: string },
) {
  await setAuthCookies(accessToken, refreshToken);
  const client = createInsForgeServerClient(accessToken);
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) {
    await clearAuthCookies();
    return { error: error?.message ?? "Could not load user session." };
  }
  await ensureUserBootstrap(mapInsForgeUser(data.user), accessToken, {
    workspaceName: options?.workspaceName,
  });
  return { success: true as const };
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const allowed = await checkRateLimit(`auth:sign-in:${email.toLowerCase()}`, {
    maxRequests: 10,
    windowSeconds: 300,
  });
  if (!allowed) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message ?? "Sign in failed." };
  }

  if (!data?.accessToken) {
    return { error: "Sign in did not return a session." };
  }

  const result = await completeSignIn(data.accessToken, data.refreshToken);
  if ("error" in result && result.error) {
    return { error: result.error };
  }

  redirect(next);
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const allowed = await checkRateLimit(`auth:sign-up:${email.toLowerCase()}`, {
    maxRequests: 5,
    windowSeconds: 600,
  });
  if (!allowed) {
    return { error: "Too many sign-up attempts. Try again later." };
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    name: workspaceName || email.split("@")[0],
    redirectTo: `${getAppUrl()}/login`,
  });

  if (error) {
    return { error: error.message ?? "Sign up failed." };
  }

  if (data?.requireEmailVerification) {
    return { requireEmailVerification: true, email };
  }

  if (data?.accessToken) {
    const result = await completeSignIn(data.accessToken, data.refreshToken, {
      workspaceName: workspaceName || undefined,
    });
    if ("error" in result && result.error) {
      return { error: result.error };
    }
    redirect("/dashboard");
  }

  return { error: "Sign up could not be completed." };
}

export async function verifyEmailAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !otp) {
    return { error: "Email and verification code are required." };
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.verifyEmail({ email, otp });

  if (error) {
    return { error: error.message ?? "Verification failed." };
  }

  if (!data?.accessToken) {
    return { error: "Verification succeeded but no session was issued. Sign in instead." };
  }

  const result = await completeSignIn(data.accessToken, data.refreshToken);
  if ("error" in result && result.error) {
    return { error: result.error };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const accessToken = await getAccessToken();
  if (accessToken) {
    const client = createInsForgeServerClient(accessToken);
    await client.auth.signOut();
  }
  await clearAuthCookies();
  redirect("/login");
}

export async function initiateGithubOAuthAction() {
  return initiateOAuthAction("github");
}

export async function initiateGoogleOAuthAction() {
  return initiateOAuthAction("google");
}

export async function initiateOAuthAction(provider: "github" | "google") {
  const allowed = await checkRateLimit(`auth:oauth:${provider}`, {
    maxRequests: 20,
    windowSeconds: 300,
  });
  if (!allowed) {
    redirect("/login?error=rate_limited");
  }

  const client = createInsForgeServerClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    redirectTo: `${getAppUrl()}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
  }

  await setOAuthVerifier(data.codeVerifier);
  redirect(data.url);
}

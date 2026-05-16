import { createClient } from "@insforge/sdk";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getInsForgePublicConfig() {
  return {
    baseUrl: requireEnv("NEXT_PUBLIC_INSFORGE_URL"),
    anonKey:
      process.env.INSFORGE_ANON_KEY ??
      requireEnv("NEXT_PUBLIC_INSFORGE_ANON_KEY"),
  };
}

/** Server-only InsForge client (SSR / route handlers / server actions). */
export function createInsForgeServerClient(accessToken?: string) {
  const { baseUrl, anonKey } = getInsForgePublicConfig();
  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
    edgeFunctionToken: accessToken,
  });
}

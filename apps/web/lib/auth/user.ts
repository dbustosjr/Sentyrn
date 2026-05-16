import type { AuthUser } from "@/lib/auth/session";

type InsForgeUser = {
  id: string;
  email?: string;
  profile?: { name?: string } | null;
};

export function mapInsForgeUser(user: InsForgeUser): AuthUser {
  const profile = user.profile as { name?: string } | null | undefined;
  return {
    id: user.id,
    email: user.email,
    name: profile?.name,
  };
}

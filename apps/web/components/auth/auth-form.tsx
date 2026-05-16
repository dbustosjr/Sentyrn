"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/app/actions/auth";
import { initiateGithubOAuthAction, initiateGoogleOAuthAction } from "@/app/actions/auth";

type Props = {
  mode: "login" | "signup";
  signInAction: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  signUpAction: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  next?: string;
};

export function AuthForm({ mode, signInAction, signUpAction, next }: Props) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, {});

  if (state.requireEmailVerification && state.email) {
    return (
      <div className="space-y-4 text-sm text-frost">
        <p>
          We sent a verification code to <span className="text-ink">{state.email}</span>.
        </p>
        <Button asChild className="w-full">
          <Link href={`/verify-email?email=${encodeURIComponent(state.email)}`}>
            Enter verification code
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.error ? (
        <p className="rounded-md border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace name</Label>
            <Input id="workspaceName" name="workspaceName" placeholder="Acme Engineering" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card/90 px-2 text-frost">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <form action={initiateGithubOAuthAction}>
          <Button type="submit" variant="outline" className="w-full border-border">
            GitHub
          </Button>
        </form>
        <form action={initiateGoogleOAuthAction}>
          <Button type="submit" variant="outline" className="w-full border-border">
            Google
          </Button>
        </form>
      </div>
    </div>
  );
}

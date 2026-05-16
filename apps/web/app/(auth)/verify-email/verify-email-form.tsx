"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verifyEmailAction, type AuthActionState } from "@/app/actions/auth";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") ?? "";
  const [state, formAction, pending] = useActionState(verifyEmailAction, {} as AuthActionState);

  return (
    <Card className="w-full max-w-md border-border bg-card/90 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-ink">Verify email</CardTitle>
        <CardDescription className="text-frost">
          Enter the 6-digit code sent to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error ? (
          <p className="mb-4 rounded-md border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson">
            {state.error}
          </p>
        ) : null}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultEmail}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification code</Label>
            <Input id="otp" name="otp" inputMode="numeric" required placeholder="123456" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-frost">
          <Link href="/login" className="text-ink underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

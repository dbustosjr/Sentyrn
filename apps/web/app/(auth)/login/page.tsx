"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md border-border bg-card/90 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-ink">Log in</CardTitle>
        <CardDescription className="text-frost">
          Authentication connects to InsForge in Phase 2. This screen is UI-only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" disabled />
          </div>
          <Button type="submit" className="w-full" disabled>
            Continue
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-frost">
          No account?{" "}
          <Link href="/signup" className="text-ink underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

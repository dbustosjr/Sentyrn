"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md border-border bg-card/90 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-ink">Create workspace</CardTitle>
        <CardDescription className="text-frost">
          Sign-up flows through InsForge Auth in Phase 2. Fields are disabled in this shell.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="org">Workspace name</Label>
            <Input id="org" placeholder="acme-corp" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" disabled />
          </div>
          <Button type="submit" className="w-full" disabled>
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-frost">
          Already have access?{" "}
          <Link href="/login" className="text-ink underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

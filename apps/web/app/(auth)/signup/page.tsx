import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction, signUpAction } from "@/app/actions/auth";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md border-border bg-card/90 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-ink">Create workspace</CardTitle>
        <CardDescription className="text-frost">
          Start with a personal workspace. Email verification may be required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForm mode="signup" signInAction={signInAction} signUpAction={signUpAction} />
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

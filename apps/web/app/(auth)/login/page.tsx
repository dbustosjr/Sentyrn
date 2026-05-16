import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction, signUpAction } from "@/app/actions/auth";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next;
  const error = params.error;

  return (
    <Card className="w-full max-w-md border-border bg-card/90 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-ink">Log in</CardTitle>
        <CardDescription className="text-frost">
          Sign in with email or OAuth. Sessions are stored in httpOnly cookies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="mb-4 rounded-md border border-crimson/40 bg-crimson/10 px-3 py-2 text-sm text-crimson">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <AuthForm mode="login" signInAction={signInAction} signUpAction={signUpAction} next={next} />
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

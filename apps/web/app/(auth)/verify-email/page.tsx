import { Suspense } from "react";
import VerifyEmailForm from "./verify-email-form";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-sm text-frost">Loading…</p>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

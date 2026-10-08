import { AuthShell } from "@/components/auth-shell";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn />
    </AuthShell>
  );
}

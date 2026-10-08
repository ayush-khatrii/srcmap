import { AuthShell } from "@/components/auth-shell";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp />
    </AuthShell>
  );
}

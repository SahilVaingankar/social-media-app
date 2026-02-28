import AuthForm from "@/components/auth/AuthForm";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="w-full">
      <AuthFormWrapper
        footer={
          <p className="text-sm text-white text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline text-green-500">
              Log In
            </Link>
          </p>
        }>
        <header>
          <h1 className="text-2xl font-semibold mb-4">Create a new account</h1>
        </header>
        <AuthForm type="signup" />
      </AuthFormWrapper>
    </div>
  );
}

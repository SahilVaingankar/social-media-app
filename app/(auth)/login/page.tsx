import AuthForm from "@/components/auth/AuthForm";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full">
      <AuthFormWrapper
        footer={
          <p className="text-sm text-white text-center">
            Don't have an account?{" "}
            <Link href="/signup" className="underline text-green-500">
              Log In
            </Link>
          </p>
        }>
        <header>
          <h1 className="text-2xl font-semibold mb-4">
            Log In to your account
          </h1>
        </header>
        <AuthForm type="login" />
      </AuthFormWrapper>
    </div>
  );
}

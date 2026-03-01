import AuthForm from "@/components/auth/AuthForm";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthFormWrapper
      footer={
        <p className="text-sm text-white text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="underline text-green-500">
            Sign Up
          </Link>
        </p>
      }>
      <header>
        <h1 className="text-2xl font-semibold text-center mb-2">Login Form</h1>
      </header>
      <p className="text-center mb-4 text-md">login to your account</p>
      <AuthForm type="login" />
    </AuthFormWrapper>
  );
}

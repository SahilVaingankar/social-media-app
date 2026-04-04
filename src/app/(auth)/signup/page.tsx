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
            <Link
              href="/login"
              className="underline text-green-500 hover:text-green-300">
              Log In
            </Link>
          </p>
        }>
        <header>
          <h1 className="text-2xl font-semibold text-center mb-2">
            Signup Form
          </h1>
        </header>
        <p className="text-center mb-4 text-md">Create a new account</p>
        <AuthForm type="signup" />
      </AuthFormWrapper>
    </div>
  );
}

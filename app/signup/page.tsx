import AuthForm from "../../components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold mb-4">Create a new account</h1>
        <AuthForm type="signup" />
      </div>
    </main>
  );
}

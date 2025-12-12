"use client";

import { Activity, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

type Type = "login" | "signup";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^[^'"%\\;]+$/,
      "Password contains forbidden characters (^,',\",%,\\,;,$) — these characters are not allowed"
    ),
});

const loginSchema = signupSchema.pick({ email: true, password: true });

type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;

export default function AuthForm({ type = "login" }: { type?: Type }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState } = useForm<SignupData | LoginData>(
    {
      resolver: zodResolver(type === "login" ? loginSchema : signupSchema),
    }
  );

  const onSubmit = async (data: SignupData | LoginData) => {
    setServerError(null);
    setLoading(true);
    try {
      const endpoint =
        type === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Request failed");
      router.push("/");
    } catch (err: any) {
      setServerError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="max-w-md mx-auto space-y-4"
      aria-live="polite">
      <Activity
        mode={type === "signup" ? "visible" : "hidden"}
        children={
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              {...register("name" as const)}
              name="name"
              type="text"
              className="mt-1 block w-full rounded border px-3 py-2"
            />
            <Activity
              mode={
                formState.errors && "name" in formState.errors
                  ? "visible"
                  : "hidden"
              }
              children={
                <p className="mt-1 text-sm text-red-600">
                  {(formState.errors as any).name?.message}
                </p>
              }
            />
          </div>
        }
      />
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          {...register("email" as const)}
          name="email"
          type="email"
          className="mt-1 block w-full rounded border px-3 py-2"
        />
        <Activity
          mode={
            formState.errors && "email" in formState.errors
              ? "visible"
              : "hidden"
          }
          children={
            <p className="mt-1 text-sm text-red-600">
              {(formState.errors as any).email?.message}
            </p>
          }
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium">Password</label>
        <input
          {...register("password" as const)}
          name="password"
          type={showPassword ? "text" : "password"}
          className="mt-1 block w-full rounded border px-3 py-2 pr-10"
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2 top-7.5 p-1 text-slate-500">
          {showPassword ? (
            <Eye className="h-5 w-5 " />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>
        <Activity
          mode={
            formState.errors && "password" in formState.errors
              ? "visible"
              : "hidden"
          }
          children={
            <p className="mt-1 text-sm text-red-600">
              {(formState.errors as any).password?.message}
            </p>
          }
        />
      </div>
      <Activity
        mode={serverError ? "visible" : "hidden"}
        children={<div className="text-sm text-red-600">{serverError}</div>}
      />

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white px-4 py-2 rounded">
          {loading
            ? type === "login"
              ? "Signing in..."
              : "Creating account..."
            : type === "login"
            ? "Sign in"
            : "Sign up"}
        </button>
      </div>
    </form>
  );
}

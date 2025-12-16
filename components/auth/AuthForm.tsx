"use client";

import { Activity, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "react-toastify";
import fetcher from "@/lib/api/fetcher";

type Type = "login" | "signup";

// Username: letters, numbers, underscores, dots; 3-30 chars
const usernamePattern = /^[a-zA-Z0-9_.]+$/;

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      usernamePattern,
      "Username can only contain letters, numbers, underscores, and dots"
    ),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupData = z.infer<typeof signupSchema>;
type LoginData = z.infer<typeof loginSchema>;

export default function AuthForm({ type = "login" }: { type?: Type }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { register, handleSubmit, formState } = useForm<SignupData | LoginData>(
    {
      resolver: zodResolver(type === "login" ? loginSchema : signupSchema),
    }
  );

  const onSubmit = async (data: SignupData | LoginData) => {
    setLoading(true);
    try {
      const endpoint =
        type === "login" ? "/api/auth/login" : "/api/auth/signup";
      const result = await fetcher(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.push("/");
      toast.success(
        type === "login"
          ? "Logged in successfully!"
          : "Account created successfully!"
      );
    } catch (err: any) {
      setServerError(true);
      toast.error(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg ">
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
                {...register("username" as const)}
                name="username"
                type="text"
                className="mt-1 block w-full rounded border border-green-700 px-3 py-2 focus:outline outline-green-500"
              />
              <Activity
                mode={
                  formState.errors && "name" in formState.errors
                    ? "visible"
                    : "hidden"
                }
                children={
                  <p className="mt-1 text-sm text-red-300">
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
            className="mt-1 block w-full rounded border border-green-700 px-3 py-2 focus:outline outline-green-500"
          />
          <Activity
            mode={
              formState.errors && "email" in formState.errors
                ? "visible"
                : "hidden"
            }
            children={
              <p className="mt-1 text-sm text-red-300">
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
            className="mt-1 block w-full rounded border border-green-700 px-3 py-2 pr-10 focus:outline outline-green-500"
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
              <p className="mt-1 text-sm text-red-300">
                {(formState.errors as any).password?.message}
              </p>
            }
          />
        </div>
        <Activity
          mode={serverError ? "visible" : "hidden"}
          children={<div className="text-sm text-red-300">{serverError}</div>}
        />

        <div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-green-700 text-black text-lg px-4 py-2 rounded cursor-pointer hover:bg-green-500 focus:bg-green-500 disabled:bg-green-300 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="h-5 w-5 text-gray-900 animate-spin" />
                <span className="text-gray-900">
                  {type === "login" ? "Logging in..." : "Creating account..."}
                </span>
              </span>
            ) : type === "login" ? (
              "Log in"
            ) : (
              "Sign up"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

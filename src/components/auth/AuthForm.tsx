"use client";

import { Activity, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "react-toastify";
import {
  LoginData,
  loginSchema,
  SignupData,
  signupSchema,
} from "@/lib/validators/auth";
import { loginAction } from "@/app/actions/auth/loginAction";
import { signupAction } from "@/app/actions/auth/signupAction";
import { UploadProfilePic } from "../profile/UploadProfilePic";
import Link from "next/link";
// import { ProfilePic } from "../ui/ProfilePic;

type Type = "login" | "signup";

export default function AuthForm({ type = "login" }: { type?: Type }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null); // ✅ changed to string
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [bioWords, setBioWords] = useState<number>(0);

  // steps
  const [currentStep, setCurrentStep] = useState<number>(1);

  const nextStep = () => setCurrentStep((s) => s + 1);
  const prevStep = () => setCurrentStep((s) => s - 1);

  const [blobUrl, setBlobUrl] = useState<string>("");

  const onImageSelect = async (file: File) => {
    const url = URL.createObjectURL(file);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return url;
  };

  const methods = useForm<SignupData | LoginData>({
    resolver: zodResolver(type === "login" ? loginSchema : signupSchema),
    shouldUnregister: false, // ✅ keep form data across steps
  });

  const handleNext = async () => {
    let fields: (keyof SignupData)[] = [];

    if (currentStep === 1) {
      fields = ["name", "email", "password"];
    }

    if (currentStep === 2) {
      fields = ["username"];
    }

    // if (currentStep === 3) {
    //   fields = ["bio"];
    // }

    const valid = await methods.trigger(fields);

    if (valid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError(null); // ✅ reset error
    try {
      let result;
      if (type === "login") {
        result = await loginAction(data); // ✅ call Server Action
      } else {
        // if (currentStep < 3) {
        //   nextStep();
        //   return;
        //     }
        console.log("Submitting with data:", data);
        console.log("avatarUrl File:", data.avatarUrl);

        result = await signupAction(data); // ✅ call Server Action
      }

      if (!result.success) {
        setServerError(result.message); // ✅ display server error from action
        toast.error(result.message);
        return;
      }

      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      router.push("/");
      toast.success(
        type === "login"
          ? "Logged in successfully!"
          : "Account created successfully!",
      );
    } catch (err: any) {
      setServerError(err?.message || "An error occurred"); // ✅ keep catch
      toast.error(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg ">
      <FormProvider {...methods}>
        {" "}
        <form
          onSubmit={methods.handleSubmit(onSubmit, (errors) =>
            console.log("Validation errors:", errors),
          )}
          noValidate
          className="max-w-md mx-auto space-y-4"
          aria-live="polite">
          {currentStep === 1 && (
            <>
              <Activity
                mode={type === "signup" ? "visible" : "hidden"}
                children={
                  <div>
                    <label className="block text-sm font-semibold">Name</label>
                    <input
                      {...methods.register("name" as const)}
                      placeholder="Enter name"
                      name="name"
                      type="text"
                      className="mt-1 block w-full rounded border border-green-700 px-3 py-2 focus:outline outline-green-500"
                    />
                    <Activity
                      mode={
                        methods.formState.errors &&
                        "name" in methods.formState.errors
                          ? "visible"
                          : "hidden"
                      }
                      children={
                        <p className="mt-1 text-sm text-red-300">
                          {(methods.formState.errors as any).name?.message}
                        </p>
                      }
                    />
                  </div>
                }
              />
              <div>
                <label className="block text-sm font-semibold">Email</label>
                <input
                  placeholder="Enter email"
                  {...methods.register("email" as const)}
                  name="email"
                  type="email"
                  className="mt-1 block w-full rounded border border-green-700 px-3 py-2 focus:outline outline-green-500"
                />
                <Activity
                  mode={
                    methods.formState.errors &&
                    "email" in methods.formState.errors
                      ? "visible"
                      : "hidden"
                  }
                  children={
                    <p className="mt-1 text-sm text-red-300">
                      {(methods.formState.errors as any).email?.message}
                    </p>
                  }
                />
              </div>
              <div className="relative">
                <label className="text-sm font-semibold">Password</label>
                <input
                  {...methods.register("password" as const)}
                  placeholder="Enter password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 block w-full rounded border border-green-700 px-3 py-2 pr-10 focus:outline outline-green-500"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-8.5 p-1 text-slate-500">
                  {showPassword ? (
                    <Eye className="h-5 w-5 " />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
                <Activity
                  mode={
                    methods.formState.errors &&
                    "password" in methods.formState.errors
                      ? "visible"
                      : "hidden"
                  }
                  children={
                    <p className="mt-1 text-sm text-red-300">
                      {(methods.formState.errors as any).password?.message}
                    </p>
                  }
                />
              </div>
            </>
          )}

          {currentStep === 2 && type === "signup" && (
            <>
              <label className="block text-sm font-semibold">Username</label>
              <input
                {...methods.register("username" as const)}
                placeholder="Enter username"
                name="username"
                type="text"
                className="mt-1 block w-full rounded border border-green-700 px-3 py-2 pr-10 focus:outline outline-green-500"
              />
            </>
          )}

          {currentStep >= 3 && type === "signup" && (
            <>
              <div className="w-full flex flex-col justify-center items-center my-4">
                <p className="font-semibold">App Profile</p>
                <UploadProfilePic
                  onImageSelect={onImageSelect}
                  // register={methods.register}
                />
              </div>
              {/* Bio Field */}
              <div className="relative">
                <textarea
                  {...methods.register("bio" as const)}
                  placeholder="Enter bio ...."
                  name="bio"
                  rows={4}
                  maxLength={125}
                  onChange={(e) => setBioWords(e.currentTarget.value.length)}
                  className="peer w-full rounded-md border border-green-700 bg-transparent px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />

                <label className="absolute -top-3 left-1.5 font-bold px-1 bg-black">
                  Bio
                </label>

                <p className="text-right text-xs text-gray-400 mt-2">
                  {bioWords}/125
                </p>
              </div>{" "}
            </>
          )}
          <Activity mode={type === "login" ? "visible" : "hidden"}>
            <Link
              href="/forgot-password"
              className="text-md text-green-500 hover:text-green-300">
              Forgot Password?
            </Link>
          </Activity>

          <Activity
            mode={serverError ? "visible" : "hidden"}
            children={<div className="text-sm text-red-300">{serverError}</div>}
          />

          <div className="mt-4">
            <button
              // type="submit"
              type={currentStep === 4 ? "submit" : "button"}
              onClick={currentStep < 4 ? handleNext : undefined}
              // onClick={() => nextStep()}
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-green-500 text-black text-lg px-4 py-2 rounded cursor-pointer hover:bg-green-600 focus:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-5 w-5 text-gray-900 animate-spin" />
                  <span className="text-gray-900">
                    {type === "login" ? "Logging in..." : "Creating account..."}
                  </span>
                </span>
              ) : type === "login" ? (
                "Log in"
              ) : currentStep < 3 ? (
                "Next"
              ) : (
                "Finish"
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

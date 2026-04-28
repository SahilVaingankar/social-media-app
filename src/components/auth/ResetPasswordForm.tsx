// "use client"

import { Eye, EyeOff, Form } from "lucide-react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordData, resetPasswordSchema } from "@/lib/validators/auth";
import { register } from "next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup";
import { resetPasswordAction } from "@/app/actions/auth/password/resetPasswordAction";
import { toast } from "react-toastify";
import router from "next/dist/shared/lib/router/router";
import { useRouter } from "next/dist/client/components/navigation";

const ResetPasswordForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  }); // const emailInput = register("email" as const, {
  // const passwordInput = register("newPassword" as const);
  const onSubmitNewPassword = async (data: ResetPasswordData) => {
    try {
      setLoading(true);
      const res = await resetPasswordAction(data);

      if (res.success) {
        router.push("/login");
        toast.success("Password reset successfully");
      } else {
        // show error (toast or state)
        toast.error(res.message);
      }
    } catch (error: any) {
      if (!navigator.onLine) {
        toast.error("You're offline. Check your internet connection.");
      } else if (error?.message?.toLowerCase().includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else {
        // toast.error("Something went wrong. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  return (
    <form onSubmit={handleSubmit(onSubmitNewPassword)}>
      <h1 className="text-2xl font-bold mb-4 text-center">New Password</h1>
      <p className="text-center mb-6 text-indigo-300">
        Enter your new password below.
      </p>
      <div className="space-y-4 px-4">
        <div className="relative flex gap-2 items-center w-full px-2 rounded border border-green-700 text-green-600 focus-within:text-green-400 focus-within:outline outline-green-500">
          <Lock className="" />
          <input
            {...register("newPassword")}
            type={showPassword ? "text" : "password"}
            className="w-full h-full py-2 pl-2 pr-8 text-white text-lg outline-none bg-transparent"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 p-1 text-slate-500 bg-black">
            {showPassword ? (
              <Eye className="h-5 w-5 " />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* <button
                type="submit"
                className="w-full bg-green-500 text-black text-lg px-4 py-2 rounded hover:bg-green-600 focus:bg-green-600">
                Send Validation Link
            </button> */}
        <FormButton
          isLastStep={true}
          isStepChange={false}
          loading={loading}
          label="Reset Password"
          loadingLabel="Resetting Password..."
        />
      </div>
    </form>
  );
};

export default ResetPasswordForm;

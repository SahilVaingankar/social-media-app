import { Eye, EyeOff, Form } from "lucide-react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const ResetPasswordForm = () => {
  const { register, setValue } = useFormContext();
  const passwordInput = register("newPassword" as const);

  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-center">New Password</h1>
      <p className="text-center mb-6 text-indigo-300">
        Enter your new password below.
      </p>
      <div className="space-y-4 px-4">
        <div className="relative flex gap-2 items-center w-full px-2 rounded border border-green-700 text-green-600 focus-within:text-green-400 focus-within:outline outline-green-500">
          <Lock className="" />
          <input
            {...passwordInput}
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
        {/* <FormButton
          isLastStep={true}
          isStepChange={false}
          loading={false}
          label="Reset Password"
          loadingLabel="Sending..."
        /> */}
      </div>
    </>
  );
};

export default ResetPasswordForm;

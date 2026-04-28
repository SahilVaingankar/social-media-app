// "use client";

import { Form } from "lucide-react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { Mail } from "lucide-react";
import { useForm, useFormContext } from "react-hook-form";
import { RequestOtpData, requestOtpSchema } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestOtpAction } from "@/app/actions/auth/otp/requestOtpAction";
import { toast } from "react-toastify";
import { useState } from "react";

interface ValidateEmailFormProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const ValidateEmailForm = ({
  setCurrentStep,
  setEmail,
}: ValidateEmailFormProps) => {
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RequestOtpData>({
    resolver: zodResolver(requestOtpSchema),
  }); // const emailInput = register("email" as const, {
  //   validate: (value) => {
  //     const result = requestOtpSchema.safeParse({ email: value });
  //     return result.success || result.error.issues[0].message;
  //   },
  // });
  const onSubmit = async (data: RequestOtpData) => {
    console.log("onSubmit running with data:", data);
    setLoading(true);
    try {
      const res = await requestOtpAction(data);

      if (res.success) {
        setLoading(false);
        setEmail(data.email);
        toast.success("OTP sent to your email");
        setCurrentStep(2);
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
    } finally {
      setLoading(false);
    }
  };
  return (
    // <AuthFormWrapper>
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Validate Your Email
      </h1>
      <p className="text-center mb-6 text-indigo-300">
        Enter your email to receive OTP.
      </p>
      <div className="space-y-4 px-4">
        <div className="flex gap-2 items-center w-full px-2 rounded border border-green-700 text-green-600 focus-within:text-green-400 focus-within:outline outline-green-500">
          <Mail className="" />
          <input
            {...register("email")}
            type="email"
            className="w-full h-full py-2 pl-2 text-white text-lg outline-none bg-transparent"
            placeholder="Enter your email"
            required
          />
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
          label="Request OTP"
          loadingLabel="Sending..."
        /> */}
      </div>
      <p className="mt-3 px-4 text-sm text-red-300">{errors.email?.message}</p>
      <div className="px-4 mt-6">
        <FormButton
          isLastStep={true}
          isStepChange={false}
          loading={loading}
          label="Reset Password"
          loadingLabel="Resetting..."
        />
      </div>
    </form>
  );
};

export default ValidateEmailForm;

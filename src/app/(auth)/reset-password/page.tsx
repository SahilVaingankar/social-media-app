"use client";
import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import { FormButton } from "@/components/auth/FormButton";
import OtpForm from "@/components/auth/OtpForm";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import ValidateEmailForm from "@/components/auth/ValidateEmailForm";
import { ResetPasswordData, resetPasswordSchema } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const ResetPasswordPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const methods = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    shouldUnregister: false, // ✅ keep form data across steps
  });

  const handleNext = async () => {
    console.log("onNext running");

    let fields: (keyof ResetPasswordData)[] = [];

    if (currentStep === 1) {
      fields = ["email"];
      console.log("checking first step");
    }

    if (currentStep === 2) {
      fields = ["otp"];
    }

    // if (currentStep === 3) {
    //   fields = ["newPassword"];
    // }

    const valid = await methods.trigger(fields);

    if (!valid) {
      await new Promise((r) => setTimeout(r, 0));
      console.log(methods.formState.errors);
    }

    if (valid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setServerError("Please fix the errors above before proceeding.");
      // console.log("Validation failed for step:", currentStep);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <form className="">
          <AuthFormWrapper>
            {/* <button className="absolute left-1/2 transform -translate-x-1/2 font-bold text-3xl top-25">
        {"<<< PREVIOUS"}
      </button> */}
            <Activity mode={currentStep === 1 ? "visible" : "hidden"}>
              <ValidateEmailForm />
              <p className="mt-3 px-4 text-sm text-red-300">
                {(methods.formState.errors as any).email?.message}
              </p>
            </Activity>
            <Activity mode={currentStep === 2 ? "visible" : "hidden"}>
              <OtpForm />
              <p className="mt-3 px-4 text-sm text-red-300">
                {(methods.formState.errors as any).otp?.message}
              </p>
            </Activity>
            <Activity mode={currentStep >= 3 ? "visible" : "hidden"}>
              <ResetPasswordForm />
              <Activity
                mode={
                  methods.formState.errors &&
                  "newPassword" in methods.formState.errors
                    ? "visible"
                    : "hidden"
                }>
                <p className="mt-3 px-4 text-sm text-red-300">
                  {(methods.formState.errors as any).newPassword?.message}
                </p>
              </Activity>
            </Activity>
            {/* <Activity mode={serverError ? "visible" : "hidden"}>
          <p className="text-sm text-red-300">{serverError}</p>
        </Activity> */}

            {/* {currentStep === 1 && <ValidateEmailForm />}
        {currentStep === 2 && <OtpForm />}
        {currentStep === 3 && <ResetPasswordForm />} */}
            <div className="px-4 mt-6">
              <FormButton
                isLastStep={currentStep === 4}
                isStepChange={currentStep < 4}
                onNext={() => {
                  if (currentStep < 4) {
                    // nextStep();
                    handleNext();
                  }
                }}
                loading={false}
                label="Reset Password"
                loadingLabel="Resetting..."
              />
            </div>
          </AuthFormWrapper>
        </form>
      </FormProvider>
    </>
  );
};

export default ResetPasswordPage;

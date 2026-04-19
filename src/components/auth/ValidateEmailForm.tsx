import { Form } from "lucide-react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { Mail } from "lucide-react";
import { useFormContext } from "react-hook-form";

const ValidateEmailForm = () => {
  const { register, setValue } = useFormContext();
  const emailInput = register("email" as const);

  return (
    // <AuthFormWrapper>
    <>
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
            {...emailInput}
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
    </>
  );
};

export default ValidateEmailForm;

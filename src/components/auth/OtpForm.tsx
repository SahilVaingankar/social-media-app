// "use client"

import { useEffect, useRef, useState } from "react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { useForm, useFormContext } from "react-hook-form";
import { verifyOtpAction } from "@/app/actions/auth/otp/verifyOtpAction";
import {
  RequestOtpData,
  VerifyOtpData,
  verifyOtpSchema,
} from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { requestOtpAction } from "@/app/actions/auth/otp/requestOtpAction";

interface OtpFormProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  email: string;
}

const OtpForm = ({ setCurrentStep, email }: OtpFormProps) => {
  const [loading, setLoading] = useState(false);
  // const { handleSubmit, setValue, getValues, register } = useFormContext();
  const { handleSubmit, register, setValue } = useForm<VerifyOtpData>({
    resolver: zodResolver(verifyOtpSchema),
  }); // const emailInput = register("email" as const, {

  const [shouldStartTimer, setShouldStartTimer] = useState<boolean>(true);
  // const [otp, setOtp] = useState<string>("");
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState<number>(120);
  useEffect(() => {
    if (!shouldStartTimer) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // clearInterval(interval); // stop interval
          setShouldStartTimer(false); // reset flag
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [shouldStartTimer]);
  // const navigate = useNavigate();

  // const onSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await axios.post(backendUrl + "/auth/send-reset-otp", {
  //       email,
  //     });
  //     if (data.success) {
  //       toast.success(data.message);
  //       setShouldStartTimer(true);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   }
  // };

  const onSubmitOtp = async (data: VerifyOtpData) => {
    setLoading(true);
    try {
      // const finalData = {
      //   ...data,
      //   email,
      // };

      const res = await verifyOtpAction(email, data);
      if (res.success) {
        toast.success(res.message);
        setCurrentStep(3);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      // toast.error("An error occurred while verifying OTP:", error);

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
  // const onSubmitNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await axios.post(backendUrl + "/auth/reset-password", {
  //       email,
  //       otp,
  //       newPassword,
  //     });
  //     if (data.success) {
  //       toast.success(data.message);
  //       navigate("/login");
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   }
  // };

  const handleInput = (e: any, index: number) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");

    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // 🔥 combine all inputs
    const otpValue = inputRefs.current.map((el) => el?.value || "").join("");

    setValue("otp", otpValue, {
      shouldValidate: true,
    });
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e: any) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.slice(0, 6).forEach((char: string, index: number) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const otpValue = pasteArray.join("").slice(0, 6);
    setValue("otp", otpValue, { shouldValidate: true });
    inputRefs.current[
      Math.min(pasteArray.length, inputRefs.current.length) - 1
    ]?.focus();
  };

  const handleResendOtp = async (email: RequestOtpData) => {
    console.log("onSubmit running with data:", email);
    try {
      const res = await requestOtpAction(email);

      if (res.success) {
        inputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });
        inputRefs.current[0]?.focus();
        setValue("otp", "");
        setTimer(120); // 2 minutes
        toast.success("OTP sent to your email");
        if (!shouldStartTimer) {
          setShouldStartTimer(true);
        }
        // (true);
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitOtp, (err) => console.log(err))}
      className="">
      {/* <AuthFormWrapper> */}
      {/* <h2 className="text-2xl font-bold mb-4 text-center">Enter OTP</h2> */}
      <div className="space-y-4 px-4 ">
        {/* <label className="block text-sm font-semibold">OTP</label> */}
        {/* <div className="flex justify-between gap-2 border-2 border-green-900">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="flex-1 border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
          </div> */}
        {/* <div className="flex gap-2 border-2 border-green-900 p-2">
            {Array(6)
              .fill(null)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="flex-1 text-center border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
          </div> */}
        <h1 className="text-white text-2xl font-semibold text-center mb-4 ">
          Reset Password OTP
        </h1>
        {/* <h1 className="text-2xl font-bold mb-4 text-center">
            Reset Password OTP
          </h1> */}
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>
        <p className="text-center mb-6 text-indigo-300 text-sm">
          {timer > 0
            ? `OTP expires in ${Math.floor(timer / 60)
                .toString()
                .padStart(
                  2,
                  "0",
                )}:${(timer % 60).toString().padStart(2, "0")} minutes`
            : `OTP expired. Please click on "Resend OTP" button below to request a new OTP.`}
        </p>
        <div
          onPaste={(e) => handlePaste(e)}
          className="flex justify-between mb-8">
          {Array(6)
            .fill(0)
            .map((_, index: number) => (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                min={0}
                key={index}
                required
                className="w-12 h-12 border-2 border-green-500 outline-none text-white text-center text-xl rounded-md"
                ref={(e) => {
                  inputRefs.current[index] = e;
                }}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          <input type="hidden" {...register("otp")} />
        </div>
        {/* <button
            type="submit"
            className="w-full bg-green-500 rounded-full text-white font-medium outline-none hover:bg-green-600 focus:bg-green-600">
            Verify Email
          </button> */}
        <span
          className="text-green-500 cursor-pointer hover:text-green-400 inline-block"
          onClick={() => handleResendOtp({ email })}>
          Resend OTP
        </span>
        <FormButton
          isLastStep={true}
          isStepChange={false}
          loading={loading}
          label="Verify OTP"
          loadingLabel="Verifying..."
        />
      </div>
      {/* </AuthFormWrapper> */}
    </form>
  );
};

export default OtpForm;

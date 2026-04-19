import { useEffect, useRef, useState } from "react";
import AuthFormWrapper from "./AuthFormWrapper";
import { FormButton } from "./FormButton";
import { useFormContext } from "react-hook-form";

const OtpForm = () => {
  const { setValue, register } = useFormContext();
  const [isEmailSent, setIsEmailSent] = useState<boolean>(true);
  const [otp, setOtp] = useState<string>("");
  const [isOtpsubmited, setisOtpsubmited] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState<number>(120);
  useEffect(() => {
    if (!isEmailSent) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // clearInterval(interval); // stop interval
          setIsEmailSent(false); // reset flag
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEmailSent]);
  // const navigate = useNavigate();

  // const onSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   try {
  //     const { data } = await axios.post(backendUrl + "/auth/send-reset-otp", {
  //       email,
  //     });
  //     if (data.success) {
  //       toast.success(data.message);
  //       setIsEmailSent(true);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   }
  // };

  const onSubmitOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e?.value).join("");
    setOtp(otpArray);
    setisOtpsubmited(true);
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
    pasteArray.forEach((char: string, index: number) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    inputRefs.current[
      Math.min(pasteArray.length, inputRefs.current.length) - 1
    ]?.focus();
  };

  return (
    <div>
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
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
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
        <p className="text-green-500">Resend OTP</p>
        {/* <FormButton
          isLastStep={false}
          isStepChange={false}
          loading={false}
          label="Verify Email"
          loadingLabel="Verifying..."
        /> */}
      </div>
      {/* </AuthFormWrapper> */}
    </div>
  );
};

export default OtpForm;

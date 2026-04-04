import { Loader } from "@/components/ui/Loader";

interface FormButtonProps {
  isLastStep: boolean;
  isStepChange: boolean;
  loading: boolean;
  label: string;
  loadingLabel: string;
  onNext?: () => void;
}

export function FormButton({
  isLastStep,
  isStepChange,
  loading,
  label,
  loadingLabel,
  onNext,
}: FormButtonProps) {
  return (
    <button
      type={isLastStep ? "submit" : "button"}
      onClick={(e) => {
        if (isStepChange && onNext) {
          onNext();
        }

        e.currentTarget.blur();
      }}
      disabled={loading}
      aria-busy={loading}
      className="w-full bg-green-500 text-black text-lg px-4 py-2 rounded cursor-pointer hover:bg-green-600 focus:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed">
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader className="h-5 w-5 text-gray-900" />
          <span className="text-gray-900">{loadingLabel}</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
}

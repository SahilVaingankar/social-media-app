"use client";

import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Loader({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Loader };

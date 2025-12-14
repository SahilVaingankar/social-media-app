"use client";

import { Spinner } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="p-4 rounded-md bg-black/80">
        <Spinner className="size-3 text-black bg-black" />
      </div>
    </div>
  );
}

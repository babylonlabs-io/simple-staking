"use client";

import { useEffect } from "react";

import GenericError from "@/app/components/Error/GenericError";
import { useError } from "@/app/context/Error/ErrorProvider";
import { ErrorType } from "@/app/types/errors";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const { handleError } = useError();

  useEffect(() => {
    handleError({
      error,
      displayError: {
        errorType: ErrorType.UNKNOWN,
      },
    });
  }, [error, handleError]);

  return <GenericError />;
}

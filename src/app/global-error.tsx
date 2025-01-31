"use client";

import { useEffect } from "react";

import GenericError from "@/app/components/Error/GenericError";
import { useError } from "@/app/context/Error/ErrorProvider";
import { Error } from "@/app/types/errors";

export default function GlobalError({ error }: { error: Error }) {
  const { handleError } = useError();

  useEffect(() => {
    handleError({
      error,
    });
  }, [error, handleError]);

  return <GenericError />;
}

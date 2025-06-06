import { useEffect } from "react";

import GenericError from "@/app/components/Error/GenericError";
import { useError } from "@/app/context/Error/ErrorProvider";
import { useLogger } from "@/app/hooks/useLogger";

export default function GlobalError({ error }: { error: Error }) {
  const { handleError } = useError();
  const logger = useLogger();

  useEffect(() => {
    logger.error(error);
    handleError({
      error,
    });
  }, [error, handleError, logger]);

  return <GenericError />;
}

import { useEffect } from "react";

import GenericError from "@/ui/legacy/components/Error/GenericError";
import { useError } from "@/ui/legacy/context/Error/ErrorProvider";
import { useLogger } from "@/ui/legacy/hooks/useLogger";

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

import { getParams } from "@/app/api/getParams";
import { useAPIQuery } from "@/app/hooks/api/useApi";
import { Params } from "@/app/types/params";

export const PARAMS_KEY = "PARAMS";

export function useParams({ enabled = true }: { enabled?: boolean } = {}) {
  const data = useAPIQuery<Params>({
    queryKey: [PARAMS_KEY],
    queryFn: getParams,
    enabled,
  });

  return data;
}

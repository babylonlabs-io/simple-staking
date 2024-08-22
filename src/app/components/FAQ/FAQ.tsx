import { useEffect, useState } from "react";

import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { useBtcHeight } from "@/app/context/mempool/BtcHeightProvider";
import { getNetworkConfig } from "@/config/network.config";
import {
  getCurrentGlobalParamsVersion,
  ParamsWithContext,
} from "@/utils/globalParams";

import { questions } from "./data/questions";
import { Section } from "./Section";

interface FAQProps {}

export const FAQ: React.FC<FAQProps> = () => {
  const [paramWithCtx, setParamWithCtx] = useState<
    ParamsWithContext | undefined
  >();
  const { coinName, networkName } = getNetworkConfig();
  const btcHeight = useBtcHeight();
  const globalParams = useGlobalParams();

  useEffect(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramsWithCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    if (!paramsWithCtx) {
      return;
    }
    setParamWithCtx(paramsWithCtx);
  }, [globalParams, btcHeight]);

  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <h3 className="mb-4 font-bold">FAQ</h3>
      <div className="flex flex-col gap-4">
        {questions(
          coinName,
          networkName,
          paramWithCtx?.currentVersion?.confirmationDepth,
        ).map((question) => (
          <Section
            key={question.title}
            title={question.title}
            content={question.content}
          />
        ))}
      </div>
    </div>
  );
};

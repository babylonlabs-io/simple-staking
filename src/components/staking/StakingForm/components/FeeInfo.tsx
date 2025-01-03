import { useFormContext, useWatch } from "@babylonlabs-io/bbn-core-ui";
import { useDeferredValue } from "react";

import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";

const { coinName } = getNetworkConfigBTC();

export function FeeInfo({ custom = false }: { custom?: boolean }) {
  const { control } = useFormContext();
  const [feeRate, feeAmount] = useWatch({
    name: ["feeRate", "feeAmount"],
    control,
  });
  const deferredFeeRate = useDeferredValue(feeRate);
  const deferredFeeAmount = useDeferredValue(feeAmount);

  return (
    <div className="flex flex-col items-start mb-2">
      <p>
        {custom ? "Selected" : "Recommended"} fee rate:{" "}
        <b>{deferredFeeRate} sat/vB</b>
      </p>

      <p>
        Transaction fee amount:{" "}
        <b>
          {satoshiToBtc(deferredFeeAmount)} {coinName}
        </b>
      </p>
    </div>
  );
}

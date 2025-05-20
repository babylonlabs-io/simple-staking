import { Button, Card, Form } from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import bitcoin from "@/app/assets/bitcoin.png";
import { Section } from "@/app/components/Section/Section";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useStakingState } from "@/app/state/StakingState";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";

const { networkName } = getNetworkConfigBTC();

const MAX_FINALITY_PROVIDERS = 3;

const SubSection = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => {
  return (
    <div
      className={`flex bg-secondary-highlight text-[#12495E] p-4 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

const AmountSubsection = () => {
  return (
    <SubSection className="flex flex-col justify-between w-full content-center gap-4">
      <div className="font-normal items-center flex flex-row justify-between w-full content-center">
        <div className="flex items-center gap-2">
          <Image
            src={bitcoin}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
          />
          <div className="text-lg">Bitcoin</div>
        </div>
        <div className="text-lg">0</div>
      </div>
      <div className="flex text-sm flex-row justify-between w-full content-center">
        <div>
          Balance: <u>0.00</u> BTC
        </div>
        <div>$0.00 USD</div>
      </div>
    </SubSection>
  );
};

const StakingSubsection = () => {
  const [counter, setCounter] = useState(0);
  return (
    <SubSection>
      <div className="flex flex-col w-full" style={{ gap: "16px" }}>
        <div className="flex flex-row">
          <div className="font-normal items-center flex flex-row justify-between w-full content-center">
            View BSNs and Finality Provider
          </div>
          <div className="flex">
            {counter < MAX_FINALITY_PROVIDERS && (
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-md bg-primary-highlight border border-[#12495E] ${counter > 0 ? "rounded-r-none" : "rounded"} cursor-pointer`}
                onClick={() => setCounter(counter + 1)}
              >
                <AiOutlinePlus size={20} />
              </div>
            )}
            {counter > 0 && (
              <div
                className={`px-4 h-10 flex items-center border border-[#12495E] ${counter === MAX_FINALITY_PROVIDERS ? "rounded-md" : "border-l-0 rounded-r-md"} cursor-pointer`}
              >
                {counter}/{MAX_FINALITY_PROVIDERS}
              </div>
            )}
          </div>
        </div>
        {Array.from({ length: counter }).map((_, index) => (
          <FinalityProviderItem
            key={index}
            onRemove={() => {
              setCounter(counter - 1);
            }}
          />
        ))}
      </div>
    </SubSection>
  );
};

const FinalityProviderItem = ({ onRemove }: { onRemove: () => void }) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <div className="h-10 w-10 bg-[#cacaca]" />
        <div>
          <div className="flex flex-row gap-0.5">
            <div className="w-4 h-4 bg-[#cacaca]" />
            <div className="text-xs text-[#387085]">BSN</div>
          </div>
          <div className="text-[#12495E]">Selected FP</div>
        </div>
      </div>
      <div
        onClick={onRemove}
        className="text-[#12495E] text-xs tracking-[0.4px] bg-[#38708533] px-2 py-0.5 rounded cursor-pointer"
      >
        Remove
      </div>
    </div>
  );
};

export function MultistakingForm() {
  const { validationSchema } = useStakingState();
  const { displayPreview } = useStakingService();

  return (
    <Section title={`${networkName} Staking`}>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={displayPreview}
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <Card className="flex-1 min-w-0 flex flex-col gap-2">
            <AmountSubsection />
            <StakingSubsection />
            <Button className="w-full">Preview</Button>
          </Card>
        </div>

        <StakingModal />
      </Form>
    </Section>
  );
}

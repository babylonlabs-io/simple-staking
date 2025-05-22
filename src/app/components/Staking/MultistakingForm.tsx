import {
  Button,
  Card,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Form,
  Text,
} from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { PropsWithChildren, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import bitcoin from "@/app/assets/bitcoin.png";
import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { Section } from "@/app/components/Section/Section";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useStakingState } from "@/app/state/StakingState";
import { BBNFeeAmount } from "@/components/staking/StakingForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/components/staking/StakingForm/components/BTCFeeAmount";
import { BTCFeeRate } from "@/components/staking/StakingForm/components/BTCFeeRate";
import { Total } from "@/components/staking/StakingForm/components/Total";
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
interface ChainButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  logo?: string | JSX.Element;
  title?: string | JSX.Element;
  alt?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function ChainButton({
  className,
  disabled,
  title,
  selected,
  onClick,
}: ChainButtonProps) {
  return (
    <Text
      disabled={disabled}
      as={disabled ? "div" : "button"}
      style={{
        backgroundColor: "#F9F9F9",
        width: "100%",
        padding: "14px 24px 14px 14px",
        borderRadius: "4px",
        border: selected ? "1px solid #CE6533" : "1px solid transparent",
        opacity: disabled ? 0.5 : 1,
      }}
      className={twMerge(
        disabled ? "pointer-events-none" : "pointer-events-auto",
        disabled ? "cursor-default" : "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div
        className="flex w-full items-center"
        style={{ justifyContent: "space-between" }}
      >
        <div className="flex items-center" style={{ fontSize: "16px" }}>
          <Image
            src={bitcoin}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px]"
            style={{ marginRight: "8px" }}
          />
          {title}
        </div>
        <div style={{ fontSize: "12px" }}>TVL: 48531.13 BTC ($5.01B)</div>
      </div>
    </Text>
  );
}

const StakingSubsection = () => {
  const [counter, setCounter] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingModalPage, setStakingModalPage] = useState(0);

  const handleSelectProvider = (id: string) => {
    setCounter((prev) => prev + 1);
    setIsModalOpen(false);
  };

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
                onClick={() => {
                  setStakingModalPage(0);
                  setIsModalOpen(true);
                }}
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
      <ResponsiveDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {stakingModalPage === 0 && (
          <BSNSelectionModal
            onNext={() => setStakingModalPage(1)}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {stakingModalPage === 1 && (
          <FinalityProviderSelectionModal
            // onNext={() => setStakingModalPage(2)}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </ResponsiveDialog>
    </SubSection>
  );
};

const BSNSelectionModal = ({
  onNext,
  onClose,
}: {
  onNext: () => void;
  onClose: () => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <DialogHeader
        title="Select Available BSN"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Bitcoin Supercharged Networks (BSNs) are Proof-of-Stake chains secured
          by Bitcoin staking. Select a network to delegate your stake and earn
          rewards.
        </div>
        <div
          className="overflow-x-auto"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "40px",
          }}
        >
          <ChainButton
            title="Babylon Genesis"
            selected={selected === "babylon"}
            onClick={() => setSelected("babylon")}
          />
          <ChainButton
            title="Cosmos"
            disabled
            onClick={() => setSelected("cosmos")}
          />
          <ChainButton
            title="Ethereum"
            disabled
            onClick={() => setSelected("ethereum")}
          />
          <ChainButton
            title="Sui"
            disabled
            onClick={() => setSelected("sui")}
          />
        </div>
        <SubSection
          style={{
            fontSize: "16px",
            color: "#387085",
            gap: "12px",
            display: "flex",
            flexDirection: "row",
            marginTop: "16px",
          }}
        >
          <div>
            <MdOutlineInfo size={22} />
          </div>
          <div>
            Babylon must be the first BSN you add before selecting others. Once
            added, you can choose additional BSNs to multistake.
          </div>
        </SubSection>
      </DialogBody>
      <DialogFooter className="flex justify-end">
        <Button variant="contained" onClick={onNext} disabled={!selected}>
          Next
        </Button>
      </DialogFooter>
    </>
  );
};

const FinalityProviderSelectionModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  return <div>Finality Provider Selection Modal</div>;
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

const FeesSection = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      <BTCFeeRate defaultRate={25} />
      <BTCFeeAmount />
      <BBNFeeAmount />
      <div className="divider my-4" />
      <Total />
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
            <FeesSection />
            <Button className="w-full" style={{ marginTop: "8px" }}>
              Preview
            </Button>
          </Card>
        </div>

        <StakingModal />
      </Form>
    </Section>
  );
}

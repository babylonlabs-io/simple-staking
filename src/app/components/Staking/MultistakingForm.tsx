import {
  Button,
  Card,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Form,
  NumberField,
  Text,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/core-ui";
import Image, { StaticImageData } from "next/image";
import { PropsWithChildren, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import babylon from "@/app/assets/babylon-genesis.png";
import bitcoin from "@/app/assets/bitcoin.png";
import cosmos from "@/app/assets/cosmos.png";
import ethereum from "@/app/assets/ethereum.png";
import sui from "@/app/assets/sui.png";
import { KeybaseImage } from "@/app/components/KeybaseImage/KeybaseImage";
import { ResponsiveDialog } from "@/app/components/Modals/ResponsiveDialog";
import { Section } from "@/app/components/Section/Section";
import { BBN_FEE_AMOUNT } from "@/app/constants";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useStakingService } from "@/app/hooks/services/useStakingService";
import { useBalanceState } from "@/app/state/BalanceState";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import { useStakingState } from "@/app/state/StakingState";
import { AuthGuard } from "@/components/common/AuthGuard";
import { BBNFeeAmount } from "@/components/staking/StakingForm/components/BBNFeeAmount";
import { BTCFeeAmount } from "@/components/staking/StakingForm/components/BTCFeeAmount";
import { BTCFeeRate } from "@/components/staking/StakingForm/components/BTCFeeRate";
import { Total } from "@/components/staking/StakingForm/components/Total";
import { StakingModal } from "@/components/staking/StakingModal";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
const { networkName } = getNetworkConfigBTC();

const MAX_FINALITY_PROVIDERS = 1;

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
  const { totalBtcBalance } = useBalanceState();
  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);
  const { setValue } = useFormContext();
  const [isEditing, setIsEditing] = useState(false);

  const btcAmountValue = parseFloat(btcAmount || 0);
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });
  const formattedBalance = satoshiToBtc(totalBtcBalance);

  const handleSetMaxBalance = () => {
    setValue("amount", formattedBalance.toString());
  };

  const handleValueClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("amount", e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

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
        {isEditing ? (
          <input
            type="number"
            value={btcAmount || ""}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-lg bg-transparent text-right w-24 outline-none"
          />
        ) : (
          <div className="text-lg" onClick={handleValueClick}>
            {btcAmount || 0}
          </div>
        )}
      </div>
      <div className="sr-only">
        <NumberField name="amount" />
      </div>

      <AuthGuard>
        <div className="flex text-sm flex-row justify-between w-full content-center">
          <div>
            Balance:{" "}
            <u className="cursor-pointer" onClick={handleSetMaxBalance}>
              {maxDecimals(formattedBalance, 8)}
            </u>{" "}
            {coinSymbol}
          </div>
          <div>{btcAmountUsd} USD</div>
        </div>
      </AuthGuard>
    </SubSection>
  );
};

interface ChainButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  logo?: string | StaticImageData;
  title?: string | JSX.Element;
  alt?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function ChainButton({
  className,
  disabled,
  title,
  logo,
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
          {logo && (
            <Image
              src={logo}
              alt="bitcoin"
              className="max-w-[40px] max-h-[40px]"
              style={{ marginRight: "8px", borderRadius: "50%" }}
            />
          )}
          {title}
        </div>
        <div style={{ fontSize: "12px" }}>TVL: X BTC ($Y)</div>
      </div>
    </Text>
  );
}

const BSNSelectionModal = ({
  onNext,
  onClose,
}: {
  onNext: (selectedChain: string) => void;
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
            logo={babylon}
            title="Babylon Genesis"
            selected={selected === "babylon"}
            onClick={() => setSelected("babylon")}
          />
          <ChainButton
            logo={cosmos}
            title="Cosmos"
            disabled
            onClick={() => setSelected("cosmos")}
          />
          <ChainButton
            logo={ethereum}
            title="Ethereum"
            disabled
            onClick={() => setSelected("ethereum")}
          />
          <ChainButton
            logo={sui}
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
        <Button
          variant="contained"
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
        >
          Next
        </Button>
      </DialogFooter>
    </>
  );
};

const FinalityProviderSelectionModal = ({
  onClose,
  onAdd,
  onBack,
}: {
  onClose: () => void;
  onAdd: (selectedProviderKey: string) => void;
  onBack: () => void;
}) => {
  const selectedFinalityProvider = useWatch({
    name: "finalityProvider",
    defaultValue: "",
  });
  return (
    <>
      <DialogHeader
        title="Select Babylon Genesis Finality Provider"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div>
          Finality Providers play a key role in securing Proof-of-Stake networks
          by validating and finalising transactions. Select one to delegate your
          stake and earn rewards.
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
          <FinalityProviders />
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-between">
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => onAdd(selectedFinalityProvider)}
          disabled={!selectedFinalityProvider}
        >
          Add
        </Button>
      </DialogFooter>
    </>
  );
};

const FinalityProviderItem = ({
  provider,
  chainType,
  onRemove,
}: {
  provider: any;
  chainType: string;
  onRemove: () => void;
}) => {
  const getChainLogo = () => {
    switch (chainType) {
      case "babylon":
        return babylon;
      case "cosmos":
        return cosmos;
      case "ethereum":
        return ethereum;
      case "sui":
        return sui;
      default:
        return babylon;
    }
  };

  const getChainName = () => {
    switch (chainType) {
      case "babylon":
        return "Babylon Genesis";
      case "cosmos":
        return "Cosmos";
      case "ethereum":
        return "Ethereum";
      case "sui":
        return "Sui";
      default:
        return "BSN";
    }
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="h-10 flex flex-row gap-2">
        <KeybaseImage
          identity={provider.description?.identity}
          moniker={provider.description?.moniker}
          size="large"
        />
        <div>
          <div className="flex flex-row gap-1 items-center">
            <Image
              src={getChainLogo()}
              alt={getChainName()}
              className="w-4 h-4 rounded-[2px]"
            />
            <div className="text-xs text-[#387085]">{getChainName()}</div>
          </div>
          <div className="text-[#12495E]">
            {provider.description.moniker ||
              trim(provider.btcPk, 8) ||
              "Selected FP"}
          </div>
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
  const { stakingInfo } = useStakingState();

  return (
    <div className="flex flex-col gap-6 p-4">
      <BTCFeeRate defaultRate={stakingInfo?.defaultFeeRate} />
      <BTCFeeAmount />
      {BBN_FEE_AMOUNT && <BBNFeeAmount amount={BBN_FEE_AMOUNT} />}
      <div className="divider my-4" />
      <Total />
    </div>
  );
};

export function MultistakingForm() {
  const { validationSchema } = useStakingState();
  const { displayPreview } = useStakingService();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingModalPage, setStakingModalPage] = useState(0);
  const [selectedProviders, setSelectedProviders] = useState<Array<any>>([]);
  const [selectedChain, setSelectedChain] = useState<string>("babylon");
  const [counter, setCounter] = useState(0);
  const { finalityProviders } = useFinalityProviderState();

  const handleSelectProvider = (selectedProviderKey: string) => {
    if (selectedProviderKey) {
      const providerData = finalityProviders?.find(
        (provider) => provider.btcPk === selectedProviderKey,
      );
      if (providerData) {
        setSelectedProviders([
          ...selectedProviders,
          { ...providerData, chainType: selectedChain },
        ]);
        setCounter((prev) => prev + 1);
      }
    }
    setIsModalOpen(false);
  };

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
                {selectedProviders.map((provider, index) => (
                  <FinalityProviderItem
                    key={index}
                    provider={provider}
                    chainType={provider.chainType || selectedChain}
                    onRemove={() => {
                      const updatedProviders = [...selectedProviders];
                      updatedProviders.splice(index, 1);
                      setSelectedProviders(updatedProviders);
                      setCounter(counter - 1);
                    }}
                  />
                ))}
              </div>
            </SubSection>
            <FeesSection />
            <Button className="w-full" style={{ marginTop: "8px" }}>
              Preview
            </Button>
          </Card>
        </div>

        <ResponsiveDialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="w-[52rem]"
        >
          {stakingModalPage === 0 && (
            <BSNSelectionModal
              onNext={(chain) => {
                setSelectedChain(chain);
                setStakingModalPage(1);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
          {stakingModalPage === 1 && (
            <FinalityProviderSelectionModal
              onBack={() => setStakingModalPage(0)}
              onAdd={(selectedProviderKey) =>
                handleSelectProvider(selectedProviderKey)
              }
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ResponsiveDialog>

        <StakingModal />
      </Form>
    </Section>
  );
}

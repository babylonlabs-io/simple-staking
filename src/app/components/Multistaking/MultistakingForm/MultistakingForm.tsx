import {
  Button,
  Card,
  Form,
  NumberField,
  useFormContext,
  useWatch,
} from "@babylonlabs-io/core-ui";
import Image from "next/image";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";

import babylon from "@/app/assets/babylon-genesis.png";
import bitcoin from "@/app/assets/bitcoin.png";
import cosmos from "@/app/assets/cosmos.png";
import ethereum from "@/app/assets/ethereum.png";
import sui from "@/app/assets/sui.png";
import { KeybaseImage } from "@/app/components/KeybaseImage/KeybaseImage";
import { MultistakingPreviewModal } from "@/app/components/Modals/MultistakingModal/MultistakingStartModal";
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
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";
import { maxDecimals } from "@/utils/maxDecimals";
import { trim } from "@/utils/trim";
import { ChainSelectionModal } from "@/app/components/Multistaking/ChainSelectionModal/ChainSelectionModal";
import { FinalityProviderModal } from "@/app/components/Multistaking/FinalityProviderModal/FinalityProviderModal";

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
}) => (
  <div
    className={`flex bg-secondary-highlight text-[#12495E] p-4 ${className}`}
    style={style}
  >
    {children}
  </div>
);

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
            {provider.description?.moniker ||
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
  const { step, processing, reset } = useStakingState();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

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

  const handlePreview = (data: any) => {
    setPreviewModalOpen(true);
  };

  return (
    <Section title={`${networkName} Staking`}>
      <Form
        schema={validationSchema}
        mode="onChange"
        reValidateMode="onChange"
        onSubmit={handlePreview}
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
            <Button
              //@ts-ignore - fix type issue in core-ui
              type="submit"
              className="w-full"
              style={{ marginTop: "8px" }}
              onClick={(e) => {
                e.preventDefault();
                setPreviewModalOpen(true);
              }}
            >
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
            <ChainSelectionModal
              onNext={(chain) => {
                setSelectedChain(chain);
                setStakingModalPage(1);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
          {stakingModalPage === 1 && (
            <FinalityProviderModal
              onBack={() => setStakingModalPage(0)}
              onAdd={(selectedProviderKey) =>
                handleSelectProvider(selectedProviderKey)
              }
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </ResponsiveDialog>

        <FormValuesConsumer
          selectedProviders={selectedProviders}
          previewModalOpen={previewModalOpen}
          setPreviewModalOpen={setPreviewModalOpen}
        />
      </Form>
    </Section>
  );
}

const FormValuesConsumer = ({
  selectedProviders,
  previewModalOpen,
  setPreviewModalOpen,
}: {
  selectedProviders: Array<any>;
  previewModalOpen: boolean;
  setPreviewModalOpen: (open: boolean) => void;
}) => {
  const btcAmount = useWatch({ name: "amount", defaultValue: "0" });
  const feeRate = useWatch({ name: "feeRate", defaultValue: "1" });
  const feeAmount = useWatch({ name: "feeAmount", defaultValue: "0" });
  const { coinSymbol } = getNetworkConfigBTC();

  return (
    <MultistakingPreviewModal
      open={previewModalOpen}
      processing={false}
      onClose={() => setPreviewModalOpen(false)}
      onProceed={() => {
        setPreviewModalOpen(false);
      }}
      bsns={[
        {
          icon: <Image src={babylon} alt="babylon" className="w-6 h-6" />,
          name: "Babylon Genesis",
        },
      ]}
      finalityProviders={selectedProviders.map((provider) => ({
        icon: (
          <KeybaseImage
            identity={provider.description?.identity}
            moniker={provider.description?.moniker}
            size="small"
          />
        ),
        name:
          provider.description?.moniker ||
          trim(provider.btcPk, 8) ||
          "Selected FP",
      }))}
      details={{
        stakeAmount: `${parseFloat(btcAmount) || 0} ${coinSymbol}`,
        feeRate: `${feeRate} sat/vB`,
        transactionFees: `${parseFloat(feeAmount) || 0} ${coinSymbol}`,
        term: {
          blocks: "5000 blocks",
          duration: "~ 35 days",
        },
        onDemandBonding: "Enabled (~ 7 days unbonding time)",
        unbondingFee: "0.0001 BTC",
      }}
    />
  );
};

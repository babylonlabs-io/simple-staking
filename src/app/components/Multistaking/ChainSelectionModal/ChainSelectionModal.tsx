import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import { PropsWithChildren, useState } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { chainLogos } from "@/app/constants";

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
    className={twMerge(
      "flex bg-secondary-highlight text-accent-primary p-4",
      className,
    )}
    style={style}
  >
    {children}
  </div>
);

interface ChainButtonProps extends PropsWithChildren {
  className?: string;
  disabled?: boolean;
  logo?: string;
  title?: string | JSX.Element;
  alt?: string;
  selected?: boolean;
  onClick?: () => void;
}

const ChainButton = ({
  className,
  disabled,
  title,
  logo,
  selected,
  onClick,
}: ChainButtonProps) => (
  <Text
    disabled={disabled}
    as={disabled ? "div" : "button"}
    className={twMerge(
      "bg-[#F9F9F9] w-full py-[14px] px-6 pl-[14px] rounded border",
      selected ? "border-[#CE6533]" : "border-transparent",
      disabled
        ? "opacity-50 pointer-events-none cursor-default"
        : "cursor-pointer",
      className,
    )}
    onClick={onClick}
  >
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center text-base">
        {logo && (
          <img
            src={logo}
            alt="bitcoin"
            className="max-w-[40px] max-h-[40px] mr-2 rounded-full"
          />
        )}
        {title}
      </div>
      <div className="text-xs">TVL: X BTC ($Y)</div>
    </div>
  </Text>
);

export const ChainSelectionModal = ({
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
        <div className="overflow-x-auto flex flex-col gap-2 mt-10">
          <ChainButton
            logo={chainLogos.babylon}
            title="Babylon Genesis"
            selected={selected === "babylon"}
            onClick={() => setSelected("babylon")}
          />
          <ChainButton
            logo={chainLogos.cosmos}
            title="Cosmos"
            disabled
            onClick={() => setSelected("cosmos")}
          />
          <ChainButton
            logo={chainLogos.ethereum}
            title="Ethereum"
            disabled
            onClick={() => setSelected("ethereum")}
          />
          <ChainButton
            logo={chainLogos.sui}
            title="Sui"
            disabled
            onClick={() => setSelected("sui")}
          />
        </div>
        <SubSection className="text-base text-[#387085] gap-3 flex-row mt-4">
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

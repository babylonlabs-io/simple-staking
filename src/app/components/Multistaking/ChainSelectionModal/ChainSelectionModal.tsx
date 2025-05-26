import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Text,
} from "@babylonlabs-io/core-ui";
import Image, { StaticImageData } from "next/image";
import { PropsWithChildren, useState } from "react";
import { MdOutlineInfo } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import babylon from "@/app/assets/babylon-genesis.png";
import cosmos from "@/app/assets/cosmos.png";
import ethereum from "@/app/assets/ethereum.png";
import sui from "@/app/assets/sui.png";

// Local reusable subsection container
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
      "flex bg-secondary-highlight text-[#12495E] p-4",
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
  logo?: string | StaticImageData;
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
    style={{
      backgroundColor: "#F9F9F9",
      width: "100%",
      padding: "14px 24px 14px 14px",
      borderRadius: "4px",
      border: selected ? "1px solid #CE6533" : "1px solid transparent",
      opacity: disabled ? 0.5 : 1,
    }}
    className={twMerge(
      disabled ? "pointer-events-none cursor-default" : "cursor-pointer",
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
            className="max-w-[40px] max-h-[40px] mr-2 rounded-full"
          />
        )}
        {title}
      </div>
      <div style={{ fontSize: "12px" }}>TVL: X BTC ($Y)</div>
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

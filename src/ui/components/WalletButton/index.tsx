import { MetaMask, WalletConnect } from "../../assets/logos";
import { cx } from "../../utils/cx";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/types";
import { LoadingIcon } from "../LoadingIcon";

export type WalletButtonProps = {
  state?: "default" | "loading";
  logo?: "metaMask" | "walletConnect";
  buttonProps?: Omit<ButtonProps, "children">;
  children?: ButtonProps["children"];
  iconClassName?: string;
};

export const WalletButton = ({
  state,
  logo,
  buttonProps,
  children,
  iconClassName,
}: WalletButtonProps) => {
  return (
    <Button variant="outline" {...buttonProps}>
      <div
        className={cx(
          "flex items-center gap-2 px-2 py-1 space-between",
          state === "loading" ? "opacity-50" : "",
        )}
      >
        {children && <span className="text-desktopCallout">{children}</span>}

        <div className={cx("flex items-center size-[22px]", iconClassName)}>
          {logo === "metaMask" ? <MetaMask /> : <WalletConnect />}
        </div>

        {state === "loading" && (
          <div className="relative rounded-full bg-backgroundPrimaryDefault -top-1.5 -ml-5 left-1">
            <LoadingIcon size="goldfish" />
          </div>
        )}
      </div>
    </Button>
  );
};

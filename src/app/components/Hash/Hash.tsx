import { Text } from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

import { cx, Icon } from "@/ui";
import { trim } from "@/utils/trim";

interface HashProps {
  value: string;
  noFade?: boolean;
  address?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  symbols?: number;
  className?: string;
}

export const Hash: React.FC<HashProps> = ({
  value,
  noFade,
  address,
  small,
  fullWidth,
  className,
  symbols = 8,
}) => {
  const [_value, copy] = useCopyToClipboard();
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = () => {
    if (!value) return;
    setCopiedText("Copied!");
    copy(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopiedText("");
    }, 2000);
    return () => clearTimeout(timer);
  }, [copiedText]);

  if (!value) {
    return <Text variant="body2">-</Text>;
  }

  return (
    <div
      className={cx(
        "inline-flex min-h-[25px] cursor-pointer items-center",
        "hover:opacity-100 pointer-events-auto",
        "text-itemPrimaryDefault text-callout font-semibold uppercase",
        className,
        !noFade && "opacity-50",
        fullWidth && "w-full",
      )}
      onClick={handleCopy}
    >
      <Text
        variant="body2"
        style={{
          minWidth: small ? "3.5rem" : "7rem",
        }}
      >
        {copiedText || (
          <>
            {!address && (
              <>
                <span>0</span>
                <span className="font-mono">x</span>
              </>
            )}
            <span>{trim(value, symbols) ?? value}</span>
          </>
        )}
      </Text>
      <span className="text-itemSecondaryDefault">
        <Icon
          iconKey={copiedText ? "checkCircleFilled" : "copy"}
          size={14}
          className="ml-1"
        />
      </span>
    </div>
  );
};

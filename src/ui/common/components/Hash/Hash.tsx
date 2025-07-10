import { Text } from "@babylonlabs-io/core-ui";
import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import { useCopyToClipboard } from "usehooks-ts";

import { trim } from "@/ui/common/utils/trim";

interface HashProps {
  value: string;
  noFade?: boolean;
  address?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  symbols?: number;
  className?: string;
  noCopy?: boolean;
}

export const Hash: React.FC<HashProps> = ({
  value,
  noFade,
  address,
  small,
  fullWidth,
  className,
  symbols = 8,
  noCopy = false,
}) => {
  const [, copy] = useCopyToClipboard();
  const [copiedText, setCopiedText] = useState("");

  const handleCopy = () => {
    if (!value || noCopy) return;
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
      className={twMerge(
        "inline-flex min-h-[25px] items-center",
        !noCopy && "cursor-pointer hover:opacity-100 pointer-events-auto",
        "text-accent-primary",
        className,
        !noFade && "opacity-50",
        fullWidth && "w-full",
      )}
      onClick={!noCopy ? handleCopy : undefined}
    >
      <Text
        variant="body2"
        style={{
          minWidth: small ? "3.5rem" : "5.5rem",
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
      {!noCopy && (
        <>
          {copiedText ? (
            <IoIosCheckmarkCircle className="ml-1" />
          ) : (
            <FiCopy className="ml-1" />
          )}
        </>
      )}
    </div>
  );
};

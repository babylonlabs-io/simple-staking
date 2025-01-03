import { Text } from "@babylonlabs-io/bbn-core-ui";
import { useEffect, useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useCopyToClipboard } from "usehooks-ts";

import { trim } from "@/utils/trim";

interface HashProps {
  value: string;
  noFade?: boolean;
  address?: boolean;
  small?: boolean;
  fullWidth?: boolean;
  symbols?: number;
}

export const Hash: React.FC<HashProps> = ({
  value,
  noFade,
  address,
  small,
  fullWidth,
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
      className={`inline-flex min-h-[25px] cursor-pointer items-center ${
        !noFade && "opacity-50"
      } hover:opacity-100 pointer-events-auto`}
      onClick={handleCopy}
    >
      <Text
        variant="body2"
        style={{
          minWidth: small ? "3.5rem" : "5.5rem",
        }}
        className={`${fullWidth ? "w-full" : ""} text-primary-dark`}
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
      {copiedText ? (
        <IoIosCheckmarkCircle className="ml-1" />
      ) : (
        <FiCopy className="ml-1" />
      )}
    </div>
  );
};

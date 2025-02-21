import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";

import blue from "@/app/assets/blue-check.svg";

interface FPInfoProps {
  moniker?: string;
  website?: string;
}

export const FPInfo = ({ moniker, website }: FPInfoProps) => {
  if (!moniker) {
    return <span>No data provided</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Image src={blue} alt="verified" />
      <span>
        {moniker}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex ml-1 relative top-[1px]"
          >
            <FiExternalLink />
          </a>
        )}
      </span>
    </div>
  );
};

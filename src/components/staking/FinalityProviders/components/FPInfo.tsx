import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";

import blue from "@/app/assets/blue-check.svg";

interface FPInfoProps {
  moniker: string;
  website: string;
}

export function FPInfo({ moniker, website }: FPInfoProps) {
  return (
    <div className="flex items-center gap-1 justify-start">
      <Image src={blue} alt="verified" />
      <p>
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
      </p>
    </div>
  );
}

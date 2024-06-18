import {
  BsDiscord,
  BsGithub,
  BsLinkedin,
  BsMedium,
  BsTelegram,
} from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import { IoMdBook } from "react-icons/io";
import { MdAlternateEmail } from "react-icons/md";

import { useTerms } from "@/app/context/Terms/TermsContext";

const iconLinks = [
  {
    name: "Website",
    url: "https://babylonchain.io",
    Icon: GoHome,
  },
  {
    name: "X",
    url: "https://twitter.com/babylon_chain",
    Icon: FaXTwitter,
  },
  {
    name: "GitHub",
    url: "https://github.com/babylonchain",
    Icon: BsGithub,
  },
  {
    name: "Telegram",
    url: "https://t.me/babyloncommunity",
    Icon: BsTelegram,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/babylon-chain/",
    Icon: BsLinkedin,
  },
  {
    name: "Medium",
    url: "https://medium.com/babylonchain-io",
    Icon: BsMedium,
  },
  {
    name: "Docs",
    url: "https://docs.babylonchain.io/",
    Icon: IoMdBook,
  },
  {
    name: "Email",
    url: "mailto:contact@babylonchain.io",
    Icon: MdAlternateEmail,
  },
  {
    name: "Discord",
    url: "https://discord.com/invite/babylonglobal",
    Icon: BsDiscord,
  },
];

const textLinks = [
  {
    name: "Terms of Use",
  },
];

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const { openTerms } = useTerms();

  return (
    <div className="container mx-auto flex flex-col items-center">
      <div className="w-24">
        <div className="divider my-1" />
      </div>
      <div className="flex justify-center gap-8 p-2">
        <div className="flex items-center justify-center text-sm">
          <a
            onClick={openTerms}
            className="transition-colors hover:text-primary cursor-pointer"
          >
            Terms of Use
          </a>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-8 p-4 pt-2 md:flex-row md:p-6 md:pt-2">
        {iconLinks.map(({ name, url, Icon }) => (
          <div
            key={name}
            className="flex w-4 items-center justify-center text-[22px] text-xl"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary"
            >
              <Icon title={name} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

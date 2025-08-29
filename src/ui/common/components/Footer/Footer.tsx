import { Text } from "@babylonlabs-io/core-ui";
import { BsDiscord, BsGithub, BsLinkedin, BsTelegram } from "react-icons/bs";
import { FaXTwitter } from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import { IoMdBook } from "react-icons/io";
import { MdAlternateEmail, MdForum } from "react-icons/md";

import { Container } from "@/ui/common/components/Container/Container";

import { Logo } from "../Logo/Logo";

const iconLinks = [
  {
    name: "Website",
    url: "https://babylonlabs.io",
    Icon: GoHome,
  },
  {
    name: "X",
    url: "https://x.com/babylonlabs_io",
    Icon: FaXTwitter,
  },
  {
    name: "GitHub",
    url: "https://github.com/babylonlabs-io",
    Icon: BsGithub,
  },
  {
    name: "Telegram",
    url: "https://t.me/babyloncommunity",
    Icon: BsTelegram,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/babylon-labs-official",
    Icon: BsLinkedin,
  },
  {
    name: "Docs",
    url: "https://docs.babylonlabs.io/",
    Icon: IoMdBook,
  },
  {
    name: "Forum",
    url: "https://forum.babylon.foundation/",
    Icon: MdForum,
  },
  {
    name: "Email",
    url: "mailto:contact@babylonlabs.io",
    Icon: MdAlternateEmail,
  },
  {
    name: "Discord",
    url: "https://discord.com/invite/babylonglobal",
    Icon: BsDiscord,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative flex bg-primary-main before:absolute before:h-3 before:w-2/3 before:bg-primary-main before:left-1/4 before:-top-2 text-accent-contrast py-10 md:py-20">
      <Container className="flex flex-col items-center md:items-start md:justify-between md:flex-row-reverse">
        <Logo className="w-[250px] h-[61px] lg:w-[367px] lg:h-[90px]" />

        <div className="mt-10 md:mt-0">
          <div className="flex flex-wrap justify-center pt-2 gap-x-5 gap-y-8 pb-10 md:pb-8 mb:pt-0 md:justify-start">
            {iconLinks.map(({ name, url, Icon }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-secondary-main"
              >
                <Icon size={28} title={name} />
              </a>
            ))}
          </div>

          <Text variant="body2" className="text-center md:text-left">
            <a
              href="https://babylonlabs.io/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-secondary-main"
            >
              Terms of Use
            </a>{" "}
            -{" "}
            <a
              href="https://babylonlabs.io/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-secondary-main"
            >
              Privacy Policy
            </a>{" "}
            - 2025 Babylon Labs. All rights reserved.
          </Text>
        </div>
      </Container>
    </footer>
  );
};

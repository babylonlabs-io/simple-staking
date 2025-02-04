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
import { MdAlternateEmail, MdForum } from "react-icons/md";

import { Container } from "@/app/components/Container/Container";

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
    name: "Medium",
    url: "https://medium.com/babylonlabs-io",
    Icon: BsMedium,
  },
  {
    name: "Docs",
    url: "https://docs.babylonlabs.io/",
    Icon: IoMdBook,
  },
  {
    name: "Forum",
    url: "https://forum.babylonlabs.io/",
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
    <footer className="relative hidden md:flex h-[238px] bg-primary-main before:absolute before:h-3 before:w-2/3 before:bg-primary-main before:left-1/4 before:-top-2 text-primary-contrast">
      <Container className="flex flex-row items-center justify-around">
        <div className="flex flex-col">
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
                  className="transition-colors hover:text-secondary-main"
                >
                  <Icon title={name} />
                </a>
              </div>
            ))}
          </div>
          <div>
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
            - 2024 Babylon Labs. All rights reserved.
          </div>
        </div>
        <div>
          <Logo width={372} height={86} />
        </div>
      </Container>
    </footer>
  );
};

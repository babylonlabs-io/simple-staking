import { Text } from "@babylonlabs-io/core-ui";
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
import { useLanguage } from "@/app/contexts/LanguageContext";
import { translations } from "@/app/translations";

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
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer
      className="relative flex bg-primary-main before:absolute before:h-3 before:w-2/3 text-accent-contrast py-10 md:py-20"
      style={{
        background: "linear-gradient(359deg, #080705 -26.89%, #2B271C 253.87%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <Text
            variant="subtitle1"
            className="text-center md:text-left text-2xl font-semibold"
          >
            {t.title}
          </Text>
          <a
            href="https://dsrv.com/product/custody"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center md:text-left text-lg underline"
          >
            {t.viewMore}
          </a>
        </div>

        <Text variant="subtitle2" className="text-center md:text-left">
          {t.copyright}
        </Text>
      </Container>
    </footer>
  );
};

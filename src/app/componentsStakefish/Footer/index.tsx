import { useMediaQueryContext } from "@/app/context/ui/MediaQueryContext";
import { socialLinks } from "@/data/socials";
import {
  Footer as FooterComponent,
  type FooterProps as FooterComponentProps,
  type SocialLinkProps,
} from "@/ui";
import { WEBSITE_URL } from "@/utils/stakefish";

export const CURRENT_YEAR = new Date().getFullYear();

interface FooterProps extends FooterComponentProps {}

export const Footer = ({ fixed, menu, simple, ...props }: FooterProps) => {
  const { up } = useMediaQueryContext();
  const isSm = up?.flounder;
  const isMd = up?.salmon;

  const links = [
    {
      url: `${WEBSITE_URL}/terms-of-service`,
      title: "Terms of service",
    },
    {
      url: `${WEBSITE_URL}/privacy-policy`,
      title: "Privacy policy",
    },
    {
      url: `${WEBSITE_URL}/contact`,
      title: "Contact us",
    },
  ];

  return (
    <FooterComponent
      simple={simple}
      title="Staking has never been this easy."
      links={links}
      menu={menu}
      socials={socialLinks as SocialLinkProps[]}
      currentYear={CURRENT_YEAR}
      fixed={Boolean(isSm) && fixed}
      isMd={Boolean(isMd)}
      className="font-mono"
      {...props}
    />
  );
};

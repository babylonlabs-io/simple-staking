import { IconKeyVariant } from "@/ui";

export interface SocialLinkProps {
  icon: IconKeyVariant;
  url: string;
  title: string;
}

export const socialLinks: SocialLinkProps[] = [
  {
    icon: "twitter",
    url: "https://twitter.com/stakefish",
    title: "Twitter",
  },
  {
    icon: "telegram",
    url: "https://t.me/stakefish",
    title: "Telegram",
  },
  {
    icon: "youTube",
    url: "https://www.youtube.com/c/stakefish",
    title: "YouTube",
  },
  {
    icon: "medium",
    url: "https://medium.com/stakefish",
    title: "Medium",
  },
  {
    icon: "instagram",
    url: "https://instagram.com/stakedotfish",
    title: "Instagram",
  },
  {
    icon: "linkedIn",
    url: "https://www.linkedin.com/company/stakefish",
    title: "LinkedIn",
  },
  {
    icon: "reddit",
    url: "https://www.reddit.com/r/stakefish",
    title: "Reddit",
  },
];

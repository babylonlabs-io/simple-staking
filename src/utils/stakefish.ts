import Link from "next/link";
import { ElementType } from "react";

export const WEBSITE_URL = "https://stake.fish";

type LinkProps = {
  as: ElementType;
  target?: string;
  rel?: string;
};
export const getLinkProps = (
  url?: string,
  ignoreTargetBlank = false,
): LinkProps => {
  if (!url) undefined;

  return !ignoreTargetBlank && url?.includes("http")
    ? { as: "a", target: "_blank", rel: "noopener noreferrer" }
    : { as: Link };
};

import { IconType } from "react-icons";
import { TypeOptions } from "react-toastify";
import { twJoin } from "tailwind-merge";

interface Props {
  ReactIcon: IconType;
  type: TypeOptions;
}

const BG_TEXT_COLOR = {
  success: "bg-[#49B149]/15 text-[#49B149]",
  warning: "bg-[#C5882D]/15 text-[#C5882D]",
  error: "bg-[#DD6464]/15 text-[#DD6464]",
  info: "bg-[#919191]/15 text-[#919191]",
  default: "bg-[#919191]/15 text-[#919191]",
} as const;

export const IconWrapper = ({ ReactIcon, type }: Props) => {
  return (
    <div className={twJoin("p-2 rounded-full", BG_TEXT_COLOR[type])}>
      <ReactIcon size={24} />
    </div>
  );
};

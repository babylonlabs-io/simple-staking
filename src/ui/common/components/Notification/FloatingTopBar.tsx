import { TypeOptions } from "react-toastify";
import { twJoin } from "tailwind-merge";

interface Props {
  type: TypeOptions;
}

const BG_COLOR = {
  success: "bg-[#49B149]",
  warning: "bg-[#C5882D]",
  error: "bg-[#DD6464]",
  info: "bg-[#919191]",
  default: "bg-[#919191]",
} as const;

export const FloatingTopBar = ({ type }: Props) => {
  return (
    <div
      className={twJoin(BG_COLOR[type], "h-1 absolute left-0 right-0 top-0")}
    ></div>
  );
};

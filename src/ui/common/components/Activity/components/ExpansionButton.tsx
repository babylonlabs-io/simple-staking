import { MdKeyboardArrowDown } from "react-icons/md";
import { twMerge } from "tailwind-merge";

import { ThemedIcon } from "../../Icons/ThemedIcon";

interface ExpansionButtonProps {
  Icon: string;
  text: string;
  counter?: string;
  onClick: () => void;
  className?: string;
}

export function ExpansionButton({
  Icon,
  text,
  counter,
  onClick,
  className = "",
}: ExpansionButtonProps) {
  return (
    <button
      className={twMerge("border-0 btn btn-ghost", className)}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full gap-4">
        <ThemedIcon
          variant="primary"
          background
          rounded
          className={twMerge(
            "w-10 h-10 flex-shrink-0 flex items-center justify-center p-2",
            className,
          )}
        >
          <img src={Icon} alt={text} className="w-8 h-8" />
        </ThemedIcon>
        <div className="flex flex-col w-full items-start">
          <span className="text-sm text-accent-primary">{text}</span>
          <span className="text-xs">{counter && <span>{counter}</span>}</span>
        </div>
        <MdKeyboardArrowDown
          size={24}
          className="transform -rotate-90 text-current"
        />
      </div>
    </button>
  );
}

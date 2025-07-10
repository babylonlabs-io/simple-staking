import { BaseIconProps } from "../index";

export const CopyIcon = ({ className = "", size = 16 }: BaseIconProps) => {
  return (
    <svg
      style={{ width: size, height: size * 1.143 }}
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-opacity duration-200 ${className}`}
    >
      <path
        d="M9.99984 0.666626H1.99984C1.2665 0.666626 0.666504 1.26663 0.666504 1.99996V11.3333H1.99984V1.99996H9.99984V0.666626ZM11.9998 3.33329H4.6665C3.93317 3.33329 3.33317 3.93329 3.33317 4.66663V14C3.33317 14.7333 3.93317 15.3333 4.6665 15.3333H11.9998C12.7332 15.3333 13.3332 14.7333 13.3332 14V4.66663C13.3332 3.93329 12.7332 3.33329 11.9998 3.33329ZM11.9998 14H4.6665V4.66663H11.9998V14Z"
        fill="#387085"
        className="dark:fill-[#5A5A5A]"
      />
    </svg>
  );
};

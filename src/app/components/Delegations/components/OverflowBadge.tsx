import { IoIosWarning } from "react-icons/io";

export const OverflowBadge: React.FC = () => (
  <div className="absolute -top-1 right-1/2 flex translate-x-1/2 items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white lg:right-2 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
    <IoIosWarning size={14} />
    <p>overflow</p>
  </div>
);

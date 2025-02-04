import { twMerge } from "tailwind-merge";

interface DelegationCellProps {
  children: React.ReactNode;
  className?: string;
}

export const DelegationCell: React.FC<DelegationCellProps> = ({
  children,
  className = "",
}) => (
  <td
    className={twMerge(
      "h-16 px-4 whitespace-nowrap overflow-hidden text-ellipsis",
      className,
    )}
  >
    {children}
  </td>
);

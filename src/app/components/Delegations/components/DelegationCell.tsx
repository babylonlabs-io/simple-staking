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
      "whitespace-nowrap text-ellipsis app-table-col table-cell",
      className,
    )}
  >
    {children}
  </td>
);

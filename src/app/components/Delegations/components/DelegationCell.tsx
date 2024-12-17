interface DelegationCellProps {
  children: React.ReactNode;
  order: string;
  className?: string;
}

export const DelegationCell: React.FC<DelegationCellProps> = ({
  children,
  order,
  className = "",
}) => <div className={`${order} ${className}`}>{children}</div>;

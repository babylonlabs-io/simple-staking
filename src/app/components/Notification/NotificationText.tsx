interface Props {
  children: string;
}

export const NotificationText = ({ children }: Props) => {
  return (
    <span className="text-sm font-normal dark:text-[#AFAFAF] text-[#303030]">
      {children}
    </span>
  );
};

interface Props {
  children: string;
}

export const NotificationText = ({ children }: Props) => {
  return (
    <span className="text-sm font-normal text-primary-dark">{children}</span>
  );
};

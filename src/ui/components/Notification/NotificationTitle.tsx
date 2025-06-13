interface Props {
  children: string;
}

export const NotificationTitle = ({ children }: Props) => {
  return (
    <span className="text-base font-bold text-primary-dark">{children}</span>
  );
};

interface Props {
  children: string;
}

export const NotificationTitle = ({ children }: Props) => {
  return (
    <span className="text-base font-bold dark:text-white text-black">
      {children}
    </span>
  );
};

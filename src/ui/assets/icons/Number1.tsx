const Icon = ({ variant = 24 }: { variant?: 24 | 40 }) => {
  const path =
    variant === 24
      ? "M13.9709 4.95459V19.5H12.2095V6.80118H12.1243L8.57315 9.15913V7.36936L12.2095 4.95459H13.9709Z"
      : "M20.7825 34.4333H22.758V5.14243H20.625L14.0779 9.49279V11.6361L20.7421 7.21743H20.7825V34.4333Z";

  return (
    <svg viewBox={`0 0 ${variant} ${variant}`}>
      <path fillRule="evenodd" clipRule="evenodd" d={path} />
    </svg>
  );
};
export default Icon;

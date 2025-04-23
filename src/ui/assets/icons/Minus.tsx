const Icon = ({ variant = 24 }: { variant?: 24 | 40 }) => {
  const path =
    variant === 24
      ? "M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
      : "M7.33333 20C7.33333 19.4477 7.78105 19 8.33333 19H31.6667C32.219 19 32.6667 19.4477 32.6667 20C32.6667 20.5523 32.219 21 31.6667 21H8.33333C7.78105 21 7.33333 20.5523 7.33333 20Z";

  return (
    <svg viewBox={`0 0 ${variant} ${variant}`}>
      <path fillRule="evenodd" clipRule="evenodd" d={path} />
    </svg>
  );
};
export default Icon;

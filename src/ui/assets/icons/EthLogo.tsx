const Icon = ({ variant = 24 }: { variant?: 24 | 40 }) => {
  return (
    <svg viewBox={`0 0 ${variant} ${variant}`}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.5018 13.215L12.2246 24L4.52809 13.4995L12.116 18.4287L19.5037 13.2131L19.5018 13.215ZM11.751 0L19.4756 11.8484L12.088 17.064L4.5 12.1329L11.751 0Z"
      />
    </svg>
  );
};

export default Icon;

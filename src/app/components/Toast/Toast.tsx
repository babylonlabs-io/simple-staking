import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  linkText?: string;
  linkUrl?: string;
  closeText?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  linkText,
  linkUrl,
  closeText,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="toast toast-end z-10">
      <div className="alert max-w-[20rem] flex flex-col">
        <p className="text-wrap text-xs">
          {message}{" "}
          {linkText && linkUrl && (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              {linkText}
            </a>
          )}
        </p>
        <button onClick={onClose} className="btn btn-primary btn-sm w-full">
          {closeText || "Close"}
        </button>
      </div>
    </div>
  );
};

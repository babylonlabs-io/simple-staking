import { useEffect, useState } from "react";

export const useLanguage = () => {
  const [language, setLanguage] = useState<"en" | "ko" | "jp">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (
      savedLanguage === "en" ||
      savedLanguage === "ko" ||
      savedLanguage === "jp"
    ) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage =
      language === "en" ? "ko" : language === "ko" ? "jp" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return { language, toggleLanguage };
};

import { useEffect, useState } from "react";

export const useLanguage = () => {
  const [language, setLanguage] = useState<"en" | "ko">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en" || savedLanguage === "ko") {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ko" : "en";
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return { language, toggleLanguage };
};

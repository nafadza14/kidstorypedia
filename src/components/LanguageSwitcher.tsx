import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button 
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs hover:bg-white hover:text-black transition-all cursor-pointer font-medium"
      title="Switch Language"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}

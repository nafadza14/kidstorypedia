import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages } from "lucide-react";
import { useLanguage, LANG_LABELS, type Language } from "@/contexts/LanguageContext";

const LANGS: Language[] = ['id', 'en', 'ar'];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-xs hover:bg-white hover:text-black transition-all cursor-pointer font-medium"
        title="Switch Language"
        aria-expanded={open}
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{language.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 rtl:right-auto rtl:left-0 z-50 min-w-[160px] rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {LANGS.map(l => (
              <button
                key={l}
                onClick={() => { setLanguage(l); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ${
                  l === language
                    ? "bg-white/10 text-white font-medium"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-6 text-center font-mono text-xs text-zinc-500">{l.toUpperCase()}</span>
                <span>{LANG_LABELS[l]}</span>
                {l === language && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

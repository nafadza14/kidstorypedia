import React, { useState } from "react";
import { SEO_TOPICS } from "@/lib/seo";
import { loc } from "@/lib/content";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";

function useLinks() {
  const { tx } = useLanguage();
  return [
    { to: "/stories", label: tx("Cerita", "Stories", "القصص") },
    { to: "/pricing", label: tx("Harga", "Pricing", "الأسعار") },
    { to: "/30-nights", label: tx("30 Malam", "30 Nights", "٣٠ ليلة") },
    { to: "/classroom", label: tx("Untuk Sekolah", "For Schools", "للمدارس") },
  ];
}

export function Logo({ className }: { className?: string }) {
  const { language } = useLanguage();
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 group shrink-0", className)}>
      <span className="font-heading text-[21px] sm:text-[24px] tracking-tight text-white group-hover:opacity-80 transition-opacity">
        {language === "ar" ? "كيدستوريبيديا®" : "Kidstorypedia®"}
      </span>
      <span className="text-[24px] sm:text-[28px] text-white select-none -tracking-widest" aria-hidden>✳︎</span>
    </Link>
  );
}

/** Shared header for public/marketing pages. `transparent` for pages with a hero image. */
export function PublicNav({ transparent }: { transparent?: boolean }) {
  const { tx } = useLanguage();
  const [open, setOpen] = useState(false);
  const hasParent = useStore(s => !!s.parent);
  const links = useLinks();
  const loginTo = hasParent ? "/dashboard" : "/onboarding";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-8 py-4 flex justify-between items-center border-b border-white/10 backdrop-blur-md",
          transparent ? "bg-black/20" : "bg-[#0a0a0c]/85",
        )}
      >
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-[15px] text-zinc-200" aria-label={tx("Utama", "Main", "الرئيسية")}>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => cn("hover:text-white transition-colors", isActive && "text-white underline underline-offset-8 decoration-white/40")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          <Link to={loginTo} className="hidden md:inline text-sm text-zinc-200 hover:text-white">
            {hasParent ? tx("Portal orang tua", "Parent portal", "بوابة الوالدين") : tx("Masuk", "Log in", "تسجيل الدخول")}
          </Link>
          <Link to="/onboarding" className="hidden md:inline-flex px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors">
            {tx("Mulai Sekarang", "Get Started", "ابدأ الآن")}
          </Link>
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2 cursor-pointer"
            aria-label={tx("Menu", "Toggle menu", "القائمة")}
            aria-expanded={open}
          >
            <span className={cn("w-6 h-[2px] bg-white transition-transform", open && "rotate-45 translate-y-2")} />
            <span className={cn("w-6 h-[2px] bg-white transition-opacity", open && "opacity-0")} />
            <span className={cn("w-6 h-[2px] bg-white transition-transform", open && "-rotate-45 -translate-y-2")} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-5 md:hidden overflow-y-auto"
          >
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-2xl text-white border-b border-white/10 pb-4">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-3">
              <Link to="/onboarding" onClick={() => setOpen(false)} className="w-full text-center py-4 bg-white text-black font-semibold rounded-full text-lg">
                {tx("Mulai Sekarang", "Get Started", "ابدأ الآن")}
              </Link>
              <Link to={loginTo} onClick={() => setOpen(false)} className="w-full text-center py-4 border border-white/30 text-white rounded-full text-lg">
                {hasParent ? tx("Portal orang tua", "Parent portal", "بوابة الوالدين") : tx("Masuk", "Log in", "تسجيل الدخول")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function PublicFooter() {
  const { tx, language } = useLanguage();
  const hasParent = useStore(s => !!s.parent);
  const year = new Date().getFullYear();
  const links = [
    { to: "/stories", label: tx("Cerita", "Stories", "القصص") },
    { to: "/pricing", label: tx("Harga", "Pricing", "الأسعار") },
    { to: "/30-nights", label: tx("30 Malam", "30 Nights", "٣٠ ليلة") },
    { to: "/classroom", label: tx("Sekolah", "Schools", "المدارس") },
    { to: "/privacy", label: tx("Privasi", "Privacy", "الخصوصية") },
    { to: hasParent ? "/dashboard" : "/onboarding", label: tx("Portal orang tua", "Parent portal", "بوابة الوالدين") },
  ];
  return (
    <footer className="relative z-10 border-t border-white/10 py-12 px-5 sm:px-8 max-w-7xl mx-auto text-xs text-zinc-400">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="max-w-sm">
          <div className="font-heading text-white text-lg mb-2">Kidstorypedia® ✳︎</div>
          <p className="leading-relaxed">
            {tx("Setiap cerita menjadi kesempatan untuk bertumbuh.", "Every story becomes an opportunity to grow.", "كل قصة فرصة للنمو.")}
          </p>
          <p className="mt-3">{tx("Didukung oleh Yayasan Omah Dongeng Kalasan", "Supported by Yayasan Omah Dongeng Kalasan", "بدعم من مؤسسة أوماه دونغينغ كالاسان")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-10">
          <nav className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm h-fit" aria-label={tx("Footer", "Footer", "التذييل")}>
            {links.map(l => (
              <Link key={l.label} to={l.to} className="hover:text-white transition-colors">{l.label}</Link>
            ))}
          </nav>
          <nav className="flex flex-col gap-2.5 text-sm" aria-label={tx("Topik cerita", "Story topics", "مواضيع القصص")}>
            <span className="text-[11px] font-mono text-zinc-500">{tx("Topik cerita", "Story topics", "مواضيع القصص")}</span>
            {SEO_TOPICS.map(t => (
              <Link key={t.slug} to={`/${t.slug}`} className="hover:text-white transition-colors">{loc(t.h1, language)}</Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3">
        <span>© {year} Kidstorypedia. {tx("Hak cipta dilindungi.", "All rights reserved.", "جميع الحقوق محفوظة.")}</span>
        <span>{tx("Bebas iklan · Tanpa pelacakan · Dikontrol orang tua", "Ad-free · No behavioural tracking · Parent-controlled", "بلا إعلانات · بلا تتبع سلوكي · بتحكم الوالدين")}</span>
      </div>
    </footer>
  );
}

/** Page shell for public pages without the landing hero image. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-white font-body overflow-x-hidden">
      <PublicNav />
      <main className="relative z-10 pt-24">{children}</main>
      <PublicFooter />
    </div>
  );
}

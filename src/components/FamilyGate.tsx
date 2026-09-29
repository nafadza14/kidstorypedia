import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { seedDemoFamily } from "@/lib/demo";
import { useStore } from "@/store";
import { btn } from "./kit";

/** Family routes require a parent account with at least one child. */
export function FamilyGate({ children }: { children: React.ReactNode }) {
  const ready = useStore(s => !!s.parent && s.children.length > 0);
  const { tx } = useLanguage();
  if (ready) return <>{children}</>;
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/15 bg-zinc-900/70 p-8 text-center">
        <div className="text-3xl mb-4">✳︎</div>
        <h1 className="text-2xl font-heading mb-2">{tx("Siapkan keluargamu dulu", "Set up your family first", "أعدّ ملف عائلتك أولاً")}</h1>
        <p className="text-sm text-zinc-400 mb-6">{tx("Buat akun orang tua dan tambahkan anakmu - hanya butuh sekitar dua menit.", "Create a parent account and add your child - it takes about two minutes.", "أنشئ حساب الوالدين وأضف طفلك - يستغرق الأمر دقيقتين تقريباً.")}</p>
        <div className="flex flex-col gap-3">
          <Link to="/onboarding" className={btn.primary}>{tx("Mulai Perjalanan Belajar Keluarga", "Start Your Family Learning Journey", "ابدأ رحلة التعلم العائلية")}</Link>
          <button className={btn.ghost} onClick={() => seedDemoFamily()}>{tx("Jelajahi dengan keluarga demo", "Explore with a demo family", "استكشف مع عائلة تجريبية")}</button>
        </div>
      </div>
    </div>
  );
}

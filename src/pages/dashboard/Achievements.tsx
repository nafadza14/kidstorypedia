import React, { useState } from "react";
import { Award, BookOpen, Compass, Hourglass, Lock, MessageCircle, Moon, Printer, Sparkles, Trophy, Zap } from "lucide-react";
import { Empty, Modal, Panel, btn, toast } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { BADGES } from "@/data/catalog";
import { VALUE_MAP } from "@/data/values";
import { track } from "@/lib/analytics";
import { loc } from "@/lib/content";
import { isPremium } from "@/lib/entitlements";
import { badgeProgress, childStats, valueJourney } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { now, setState, uid } from "@/store";
import type { Certificate, ChildProfile, Lang } from "@/types";
import { NoChild, PrintStyle, SectionHeader, fmtDate, useDash } from "./shared";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = { BookOpen, Moon, Compass, Hourglass, MessageCircle, Zap, Sparkles, Trophy };

const HINTS: Record<string, { en: string; ar: string }> = {
  "first-story": { en: "Finish any story together.", ar: "أكملوا أي قصة معاً." },
  "nightly-reader": { en: "Complete 7 reading sessions.", ar: "أكملوا ٧ جلسات قراءة." },
  "story-explorer": { en: "Read from all four categories.", ar: "اقرؤوا من الفئات الأربع." },
  "patience-practitioner": { en: "Save 3 reflections on patience stories.", ar: "احفظوا ٣ تأملات عن الصبر." },
  "family-reflector": { en: "Complete 5 family discussions.", ar: "أكملوا ٥ نقاشات عائلية." },
  "action-taker": { en: "Complete 5 action challenges.", ar: "أكملوا ٥ تحديات عملية." },
  "value-explorer": { en: "Explore 6 different values.", ar: "استكشفوا ٦ قيم مختلفة." },
  "program-finisher": { en: "Finish a family program.", ar: "أنهوا برنامجاً عائلياً." },
};

function CertificateView({ cert, child, stories, discussions, personalised, lang }: { cert: Certificate; child: ChildProfile; stories: number; discussions: number; personalised: boolean; lang: Lang }) {
  const ar = lang === "ar";
  const values = cert.values.map(v => loc(VALUE_MAP[v]?.name, lang));
  const valuesText = values.length ? values.join(ar ? "، " : ", ") : ar ? "القيم الإسلامية" : "Islamic character values";
  return (
    <div className="ksp-print rounded-2xl bg-[#fbf7ee] text-zinc-900 p-8 sm:p-12 text-center border-[6px] border-double border-amber-700/60" dir={ar ? "rtl" : "ltr"}>
      <div className="text-amber-800 text-3xl mb-2">✳︎</div>
      <div className="text-[11px] tracking-[0.3em] uppercase text-amber-900/70 mb-3">Kidstorypedia</div>
      <h2 className="font-heading text-3xl sm:text-4xl mb-6">{cert.title}</h2>
      <p className="text-sm text-zinc-600 mb-2">{ar ? "تُمنح هذه الشهادة إلى" : "This certificate is presented to"}</p>
      <p className="font-heading text-4xl sm:text-5xl text-amber-900 mb-6">{child.name}</p>
      <p className="text-base leading-relaxed max-w-lg mx-auto text-zinc-800">
        {ar
          ? `الذي استكشف ومارس ${valuesText} من خلال ${stories} قصة و${discussions} نقاشاً عائلياً.`
          : `who has explored and practised ${valuesText} through ${stories} ${stories === 1 ? "story" : "stories"} and ${discussions} family ${discussions === 1 ? "discussion" : "discussions"}.`}
      </p>
      {personalised && (
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {cert.values.map(v => <span key={v} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: VALUE_MAP[v].color, color: "#3f3f46" }}>{loc(VALUE_MAP[v].name, lang)}</span>)}
        </div>
      )}
      <div className="flex justify-between items-end mt-10 text-xs text-zinc-500">
        <div className="text-start"><div className="border-t border-zinc-400 pt-1 w-36">{ar ? "الوالد/الوالدة" : "Parent"}</div></div>
        <div>{fmtDate(cert.at, lang)}</div>
      </div>
      <p className="text-[10px] text-zinc-400 mt-6">{ar ? "تحتفي هذه الشهادة بأنشطة التعلم العائلية، ولا تقيس أخلاق الطفل." : "This certificate celebrates family learning activities — it does not measure a child's character."}</p>
    </div>
  );
}

export default function Achievements() {
  const { state, child, language, tx } = useDash();
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const [paywall, setPaywall] = useState(false);
  if (!child) return <NoChild />;
  const premium = isPremium(state);
  const owned = new Map(state.achievements.filter(a => a.childId === child.id).map(a => [a.badgeId, a]));
  const progress = badgeProgress(state, child.id);
  const stats = childStats(state, child.id);
  const certs = state.certificates.filter(c => c.childId === child.id).slice().reverse();

  const generate = () => {
    const values = premium
      ? valueJourney(state, child.id).filter(j => j.total > 0).sort((a, b) => b.total - a.total).slice(0, 6).map(j => j.value)
      : [];
    const cert: Certificate = {
      id: uid("cert"),
      childId: child.id,
      title: premium ? tx("Character Journey Certificate", "شهادة رحلة الأخلاق") : tx("Family Learning Certificate", "شهادة التعلم العائلي"),
      at: now(),
      values,
    };
    setState(s => ({ ...s, certificates: [...s.certificates, cert] }));
    track("certificate_generated", { childId: child.id, personalised: premium });
    toast(tx("Certificate created", "تم إنشاء الشهادة"));
    setViewing(cert);
  };

  return (
    <div className="space-y-6">
      <PrintStyle />
      <SectionHeader title={tx("Achievements & Certificates", "الإنجازات والشهادات")} subtitle={tx("Badges celebrate learning habits — reading, talking and practising together.", "الشارات تحتفي بعادات التعلم — القراءة والحوار والممارسة معاً.")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BADGES.map(b => {
          const Icon = ICONS[b.icon] || Award;
          const a = owned.get(b.id);
          const unlocked = !!a || progress[b.id];
          return (
            <div key={b.id} className={cn("rounded-2xl border p-4", unlocked ? "border-amber-300/40 bg-amber-300/5" : "border-white/10 bg-zinc-900/40")}>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", unlocked ? "bg-amber-300/20 text-amber-200" : "bg-white/5 text-zinc-600")}>
                {unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>
              <div className={cn("font-heading", !unlocked && "text-zinc-400")}>{loc(b.name, language)}</div>
              <p className="text-xs text-zinc-400 mt-1">{loc(b.description, language)}</p>
              <p className="text-[11px] font-mono mt-2 text-zinc-500">
                {a ? tx(`Unlocked ${fmtDate(a.at, language)}`, `فُتحت ${fmtDate(a.at, language)}`) : tx(HINTS[b.id]?.en || "", HINTS[b.id]?.ar)}
              </p>
            </div>
          );
        })}
      </div>

      <Panel
        title={tx("Certificates", "الشهادات")}
        action={<button className={btn.primary} onClick={generate}><Award className="w-4 h-4" />{tx("Create certificate", "إنشاء شهادة")}</button>}
      >
        {!premium && (
          <p className="text-xs text-zinc-400 mb-4">
            {tx("Free families get a basic certificate. Premium certificates are personalised with the values your child explored.", "العائلات المجانية تحصل على شهادة أساسية. الشهادات المميزة مخصصة بالقيم التي استكشفها طفلك.")}{" "}
            <button className="underline cursor-pointer" onClick={() => setPaywall(true)}>{tx("Upgrade", "ترقية")}</button>
          </p>
        )}
        {!certs.length ? <Empty>{tx(`Create a certificate to celebrate ${child.name}'s learning journey.`, `أنشئ شهادة للاحتفاء برحلة تعلم ${child.name}.`)}</Empty> : (
          <ul className="divide-y divide-white/5">
            {certs.map(c => (
              <li key={c.id} className="py-3 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-300" />
                <div className="flex-1">
                  <div className="text-sm">{c.title}</div>
                  <div className="text-[11px] text-zinc-500">{fmtDate(c.at, language)}</div>
                </div>
                <button className={btn.small} onClick={() => setViewing(c)}><Printer className="w-3.5 h-3.5" />{tx("View & print", "عرض وطباعة")}</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={!!viewing} onClose={() => setViewing(null)} wide title={tx("Certificate", "الشهادة")}>
        {viewing && (
          <>
            <CertificateView cert={viewing} child={child} stories={stats.storiesCompleted} discussions={stats.discussions} personalised={viewing.values.length > 0} lang={language} />
            <div className="flex justify-end mt-4">
              <button className={btn.primary} onClick={() => window.print()}><Printer className="w-4 h-4" />{tx("Print", "طباعة")}</button>
            </div>
          </>
        )}
      </Modal>
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Personalised certificates are part of Premium.", "الشهادات المخصصة جزء من الخطة المميزة.")} />
    </div>
  );
}

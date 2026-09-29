import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, Printer, Route } from "lucide-react";
import { Modal, Panel, StoryCover, btn, toast } from "@/components/kit";
import { PACKS, type Pack } from "@/data/catalog";
import { VALUES } from "@/data/values";
import { buyPack } from "@/lib/billing";
import { familyStories, loc, stripTashkeel } from "@/lib/content";
import { canAccessStory, isPremium } from "@/lib/entitlements";
import { Pill, PrintStyle, SectionHeader, useDash } from "./shared";

function ReflectionCards() {
  const { state, language, tx } = useDash();
  const stories = familyStories(state).slice(0, 24);
  return (
    <div className="ksp-print">
      <div className="grid sm:grid-cols-2 gap-3 print:grid-cols-2">
        {VALUES.map(v => (
          <div key={v.id} className="rounded-2xl border p-4 bg-[#fbf7ee] text-zinc-900 print:break-inside-avoid" style={{ borderColor: v.color }}>
            <div className="text-[10px] tracking-widest uppercase text-zinc-500">{tx("Value card", "بطاقة قيمة")}</div>
            <div className="font-heading text-xl" style={{ color: "#27272a" }}>{loc(v.name, language)}</div>
            <p className="text-sm text-zinc-700 mt-1">{loc(v.description, language)}</p>
            <p className="text-xs text-zinc-600 mt-3">{tx("This week, when did you see someone show this value? What did they do?", "متى رأيت أحداً يُظهر هذه القيمة هذا الأسبوع؟ ماذا فعل؟")}</p>
          </div>
        ))}
        {stories.map(s => (
          <div key={s.id} className="rounded-2xl border border-zinc-300 p-4 bg-white text-zinc-900 print:break-inside-avoid">
            <div className="text-[10px] tracking-widest uppercase text-zinc-500">{tx("Reflection card", "بطاقة تأمل")}</div>
            <div className="font-heading text-lg">{loc(s.title, language)}</div>
            <ol className="text-xs text-zinc-700 mt-2 space-y-1 list-decimal ps-4">{s.discussion.questions.map((q, i) => <li key={i}>{loc(q, language)}</li>)}</ol>
            <p className="text-xs text-zinc-700 mt-2"><b>{tx("Reflect:", "تأمل:")}</b> {loc(s.discussion.reflection, language)}</p>
            <p className="text-xs text-zinc-700 mt-1"><b>{tx("Do:", "افعل:")}</b> {loc(s.discussion.action, language)}</p>
            {s.discussion.dua && <p dir="rtl" className="text-sm mt-2 font-[Amiri,serif]">{state.settings.tashkeel ? s.discussion.dua.arabic : stripTashkeel(s.discussion.dua.arabic)} <span className="text-[10px] text-zinc-500" dir="ltr">({s.discussion.dua.source})</span></p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PackCard({ pack, onPrint }: { pack: Pack; onPrint: () => void }) {
  const { state, language, tx } = useDash();
  const [busy, setBusy] = useState(false);
  const owned = state.ownedPacks.includes(pack.id);
  const printAccess = owned || (isPremium(state) && state.subscription.plan === "family_plus");
  const stories = familyStories(state).filter(s => s.packId === pack.id);

  const buy = async () => {
    setBusy(true);
    const r = await buyPack(pack.id);
    setBusy(false);
    toast(r.message);
  };

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-heading text-lg">{loc(pack.name, language)}</h3>
          <p className="text-sm text-zinc-400">{loc(pack.description, language)}</p>
        </div>
        {owned ? <Pill tone="emerald"><CheckCircle2 className="w-3 h-3" />{tx("Owned", "مملوكة")}</Pill> : <span className="text-lg font-light whitespace-nowrap">${pack.priceUsd}</span>}
      </div>
      {stories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {stories.map(s => (
            <Link key={s.id} to={canAccessStory(state, s) ? `/story/${s.id}` : `/stories/${s.slug}`} className="shrink-0 w-20" title={loc(s.title, language)}>
              <StoryCover story={s} locked={!canAccessStory(state, s)} className="w-20 aspect-[3/4] rounded-lg" />
              <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{loc(s.title, language)}</div>
            </Link>
          ))}
        </div>
      )}
      {!stories.length && !pack.programId && !pack.printable && <p className="text-xs text-zinc-500 my-2">{tx("New stories are added to this collection as they pass scholar review.", "تُضاف قصص جديدة لهذه المجموعة بعد المراجعة الشرعية.")}</p>}
      {pack.programId && <p className="text-xs text-zinc-400 my-2 flex items-center gap-1.5"><Route className="w-3.5 h-3.5" />{tx("Unlocks all days of the program.", "يفتح كل أيام البرنامج.")} <Link to="/dashboard/programs" className="underline">{tx("View program", "عرض البرنامج")}</Link></p>}
      <div className="flex gap-2 mt-3">
        {!owned && <button className={btn.primary} onClick={buy} disabled={busy}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : tx("Buy pack", "اشترِ الحزمة")}</button>}
        {pack.printable && <button className={btn.ghost} disabled={!printAccess} onClick={onPrint} title={printAccess ? undefined : tx("Buy the pack to print", "اشترِ الحزمة للطباعة")}><Printer className="w-4 h-4" />{tx("Printable cards", "بطاقات للطباعة")}</button>}
      </div>
    </Panel>
  );
}

export default function LibrarySection() {
  const { state, tx } = useDash();
  const [printing, setPrinting] = useState(false);
  return (
    <div className="space-y-5">
      <PrintStyle />
      <SectionHeader
        title={tx("Premium packs & library", "الباقات المميزة والمكتبة")}
        subtitle={tx("Buy a single collection without a subscription. Premium members already have access to every story.", "اشترِ مجموعة واحدة بدون اشتراك. أعضاء الخطة المميزة لديهم وصول لكل القصص.")}
        action={<Link to="/stories" className={btn.ghost}>{tx("Browse full library", "تصفح المكتبة كاملة")}</Link>}
      />
      {isPremium(state) && <p className="text-xs text-emerald-300">{tx("Your plan includes all premium stories.", "خطتك تشمل كل القصص المميزة.")}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {PACKS.map(p => <PackCard key={p.id} pack={p} onPrint={() => setPrinting(true)} />)}
      </div>
      <Modal open={printing} onClose={() => setPrinting(false)} wide title={tx("Family reflection cards", "بطاقات التأمل العائلي")}>
        <div className="flex justify-end mb-4"><button className={btn.primary} onClick={() => window.print()}><Printer className="w-4 h-4" />{tx("Print", "طباعة")}</button></div>
        <ReflectionCards />
      </Modal>
    </div>
  );
}

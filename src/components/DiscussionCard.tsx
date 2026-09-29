import { useState } from "react";
import { CheckCircle2, Circle, Lock, MessageCircle, Sparkles, Target, Heart } from "lucide-react";
import { BADGES } from "@/data/catalog";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";
import { loc, stripTashkeel } from "@/lib/content";
import { discussionQuestionLimit } from "@/lib/entitlements";
import { hasEvent, logEvent } from "@/lib/learning";
import { useStore } from "@/store";
import type { Story } from "@/types";
import { Paywall } from "./Paywall";
import { btn, input, toast, ValueChip } from "./kit";

/**
 * Discussion Engine (PRD §18): 3 questions, action challenge, reflection,
 * du'a with its source. Every step is logged as an observable learning
 * interaction - never as a character score (PRD §30).
 */
export function DiscussionCard({ story, childId, onDone }: { story: Story; childId: string; onDone?: () => void }) {
  const { language, tx } = useLanguage();
  const state = useStore(s => s);
  const limit = discussionQuestionLimit(state);
  const tashkeel = state.settings.tashkeel;
  const [reflection, setReflection] = useState("");
  const [paywall, setPaywall] = useState(false);
  const discussed = hasEvent(state, childId, "discussion_completed", story.id);
  const acted = hasEvent(state, childId, "action_completed", story.id);
  const reflected = hasEvent(state, childId, "reflection_completed", story.id);

  const celebrate = (fresh: string[]) => fresh.forEach(id => {
    const b = BADGES.find(x => x.id === id);
    if (b) toast(tx(`Lencana terbuka: ${b.name.en}`, `Badge unlocked: ${b.name.en}`, `شارة جديدة: ${b.name.ar}`));
  });

  const complete = (type: "discussion_completed" | "action_completed" | "reflection_completed", note?: string) => {
    const fresh = logEvent({ childId, type, storyId: story.id, storyVersion: story.version, values: story.values, note });
    track(type, { storyId: story.id });
    toast(type === "discussion_completed" ? tx("Diskusi dicatat", "Discussion recorded", "تم تسجيل النقاش") : type === "action_completed" ? tx("Tantangan aksi selesai", "Action challenge completed", "تم إنجاز التحدي") : tx("Refleksi tersimpan", "Reflection saved", "تم حفظ التأمل"));
    celebrate(fresh);
    onDone?.();
  };

  const dua = story.discussion.dua;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">{story.values.map(v => <ValueChip key={v} id={v} />)}</div>

      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3"><MessageCircle className="w-3.5 h-3.5" />{tx("Ngobrol bersama", "Talk together", "تحدثوا معاً")}</div>
        <ol className="space-y-2.5">
          {story.discussion.questions.map((q, i) => i < limit ? (
            <li key={i} className="flex gap-3 text-sm text-zinc-200"><span className="font-mono text-zinc-500">{i + 1}.</span>{loc(q, language)}</li>
          ) : (
            <li key={i} className="flex gap-3 text-sm text-zinc-500 items-center">
              <span className="font-mono">{i + 1}.</span>
              <button onClick={() => setPaywall(true)} className="inline-flex items-center gap-1.5 text-amber-300/80 hover:text-amber-200 cursor-pointer"><Lock className="w-3 h-3" />{tx("Pertanyaan premium", "Premium question", "سؤال مميز")}</button>
            </li>
          ))}
        </ol>
        <button onClick={() => !discussed && complete("discussion_completed")} disabled={discussed} className={`mt-3 ${btn.small}`}>
          {discussed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
          {discussed ? tx("Sudah didiskusikan", "Discussed", "تمت المناقشة") : tx("Tandai diskusi selesai", "Mark discussion completed", "تمت المناقشة")}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2"><Target className="w-3.5 h-3.5" />{tx("Tantangan aksi keluarga", "Family action challenge", "تحدي العائلة العملي")}</div>
        <p className="text-sm text-zinc-200 mb-3">{loc(story.discussion.action, language)}</p>
        <button onClick={() => !acted && complete("action_completed")} disabled={acted} className={btn.small}>
          {acted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
          {acted ? tx("Selesai", "Completed", "تم") : tx("Kami berhasil!", "We did it!", "فعلناها!")}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2"><Heart className="w-3.5 h-3.5" />{tx("Refleksi", "Reflection", "تأمل")}</div>
        <p className="text-sm text-zinc-200 mb-3">{loc(story.discussion.reflection, language)}</p>
        {reflected ? (
          <p className="text-xs text-emerald-300 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{tx("Refleksi tersimpan di Jurnal Karakter", "Reflection saved to the Character Journal", "حُفظ التأمل في دفتر الأخلاق")}</p>
        ) : (
          <div className="flex gap-2">
            <input className={input} value={reflection} onChange={e => setReflection(e.target.value)} placeholder={tx("Tulis jawaban anakmu (opsional)", "Write your child's answer (optional)", "اكتب إجابة طفلك (اختياري)")} maxLength={280} />
            <button className={btn.small} onClick={() => complete("reflection_completed", reflection.trim() || undefined)}>{tx("Simpan", "Save", "حفظ")}</button>
          </div>
        )}
      </div>

      {dua && (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-200/80 mb-2"><Sparkles className="w-3.5 h-3.5" />{tx("Doa", "Du'a", "دعاء")}</div>
          <p dir="rtl" className="text-xl leading-loose text-white mb-1 font-[Amiri,serif]">{tashkeel ? dua.arabic : stripTashkeel(dua.arabic)}</p>
          <p className="text-xs italic text-zinc-400">{dua.transliteration}</p>
          <p className="text-sm text-zinc-200 mt-1">{loc(dua.meaning, language)}</p>
          <p className="text-[11px] font-mono text-zinc-500 mt-2">{tx("Sumber", "Source", "المصدر")}: {dua.source}</p>
        </div>
      )}

      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Keluarga premium mendapatkan ketiga pertanyaan diskusi untuk setiap cerita.", "Premium families get all three discussion questions for every story.", "العائلات المميزة تحصل على أسئلة النقاش الثلاثة لكل قصة.")} />
    </div>
  );
}

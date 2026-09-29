import { useState } from "react";
import { CheckCircle2, ChevronDown, Lock } from "lucide-react";
import { DiscussionCard } from "@/components/DiscussionCard";
import { Empty, Panel, StoryCover, ValueChip, btn } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { VALUES } from "@/data/values";
import { familyStories, findStory, isAgeSuitable, loc } from "@/lib/content";
import { canAccessStory, discussionQuestionLimit } from "@/lib/entitlements";
import { hasEvent } from "@/lib/learning";
import { cn } from "@/lib/utils";
import type { Story, ValueId } from "@/types";
import { NoChild, SectionHeader, fmtDate, useDash } from "./shared";

export default function Discussion() {
  const { state, child, language, tx } = useDash();
  const [filter, setFilter] = useState<ValueId | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  if (!child) return <NoChild />;

  // completed stories, most recent first
  const completedEvents = state.events.filter(e => e.childId === child.id && e.type === "story_completed").reverse();
  const seen = new Set<string>();
  const completed: { story: Story; at: string }[] = [];
  for (const e of completedEvents) {
    if (!e.storyId || seen.has(e.storyId)) continue;
    const s = findStory(state, e.storyId);
    if (s) { seen.add(s.id); completed.push({ story: s, at: e.at }); }
  }
  const byValue = (s: Story) => filter === "all" || s.values.includes(filter);
  const list = completed.filter(c => byValue(c.story));
  const unread = familyStories(state).filter(s => !seen.has(s.id) && isAgeSuitable(s, child.age) && byValue(s)).slice(0, 9);
  const limit = discussionQuestionLimit(state);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={tx("Discussion Engine", "محرك النقاش")}
        subtitle={tx("Three questions, a family action and a reflection for every story — turning reading time into a conversation.", "ثلاثة أسئلة وعمل عائلي وتأمل لكل قصة — لتتحول القراءة إلى حوار.")}
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")} className={cn("px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap border cursor-pointer", filter === "all" ? "bg-white text-black border-white" : "border-white/15 text-zinc-300")}>{tx("All values", "كل القيم")}</button>
        {VALUES.map(v => (
          <button key={v.id} onClick={() => setFilter(v.id)} className={cn("px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap border cursor-pointer", filter === v.id ? "bg-white text-black border-white" : "border-white/15 text-zinc-300")}>{loc(v.name, language)}</button>
        ))}
      </div>

      <Panel title={tx(`Stories ${child.name} has read`, `القصص التي قرأها ${child.name}`)}>
        {!list.length ? (
          <Empty>{completed.length ? tx("No completed stories match this value.", "لا قصص مكتملة لهذه القيمة.") : tx("Once your child finishes a story, its discussion guide appears here.", "بعد أن يُنهي طفلك قصة، يظهر دليل نقاشها هنا.")}</Empty>
        ) : (
          <ul className="divide-y divide-white/5">
            {list.map(({ story, at }) => {
              const discussed = hasEvent(state, child.id, "discussion_completed", story.id);
              const isOpen = open === story.id;
              return (
                <li key={story.id} className="py-3">
                  <button onClick={() => setOpen(isOpen ? null : story.id)} className="w-full flex items-center gap-3 text-start cursor-pointer" aria-expanded={isOpen}>
                    <StoryCover story={story} className="w-10 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{loc(story.title, language)}</div>
                      <div className="text-[11px] text-zinc-500">{tx("Read", "قُرئت")} {fmtDate(at, language)}</div>
                    </div>
                    {discussed ? <span className="text-[11px] text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{tx("Discussed", "نوقشت")}</span> : <span className="text-[11px] text-amber-200">{tx("Ready to discuss", "جاهزة للنقاش")}</span>}
                    <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && <div className="mt-4 ps-0 sm:ps-13"><DiscussionCard story={story} childId={child.id} /></div>}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title={tx("Discussion guides for stories not read yet", "أدلة نقاش لقصص لم تُقرأ بعد")}>
        <p className="text-xs text-zinc-400 mb-4">{tx("Preview the questions before reading together.", "اطّلع على الأسئلة قبل القراءة معاً.")}</p>
        {!unread.length ? <Empty>{tx("Nothing else to preview for this filter.", "لا شيء آخر للمعاينة.")}</Empty> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unread.map(s => {
              const locked = !canAccessStory(state, s);
              const isOpen = preview === s.id;
              return (
                <div key={s.id} className="rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <StoryCover story={s} locked={locked} className="w-10 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="text-sm font-medium">{loc(s.title, language)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">{s.values.slice(0, 2).map(v => <ValueChip key={v} id={v} />)}</div>
                  {isOpen ? (
                    <ol className="space-y-1.5 text-xs text-zinc-300 mb-2">
                      {s.discussion.questions.map((q, i) => i < limit && !locked ? <li key={i}>{i + 1}. {loc(q, language)}</li> : (
                        <li key={i}><button onClick={() => setPaywall(true)} className="text-amber-300/80 inline-flex items-center gap-1 cursor-pointer"><Lock className="w-3 h-3" />{tx("Premium question", "سؤال مميز")}</button></li>
                      ))}
                    </ol>
                  ) : null}
                  <button className={btn.small} onClick={() => setPreview(isOpen ? null : s.id)}>{isOpen ? tx("Hide", "إخفاء") : tx("Preview questions", "معاينة الأسئلة")}</button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Premium families get full discussion guides for every story.", "العائلات المميزة تحصل على أدلة النقاش الكاملة لكل قصة.")} />
    </div>
  );
}

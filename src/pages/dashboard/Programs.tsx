import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Circle, Lock, Target } from "lucide-react";
import { Panel, StoryCover, ValueChip, btn, toast } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { BADGES, PROGRAMS, type Program } from "@/data/catalog";
import { track } from "@/lib/analytics";
import { findStory, loc } from "@/lib/content";
import { canAccessProgramDay, canAccessStory } from "@/lib/entitlements";
import { evaluateBadges, logEvent } from "@/lib/learning";
import { cn } from "@/lib/utils";
import { now, setState } from "@/store";
import { NoChild, Pill, SectionHeader, useDash } from "./shared";

function ProgramCard({ program }: { program: Program }) {
  const { state, child, language, tx } = useDash();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [paywall, setPaywall] = useState(false);
  if (!child) return null;
  const enr = state.enrollments.find(e => e.programId === program.id && e.childId === child.id);
  const done = new Set(enr?.completedDays || []);
  const nextDay = program.days.find(d => !done.has(d.day))?.day;
  const dayNo = selectedDay ?? nextDay ?? program.days.length;
  const day = program.days.find(d => d.day === dayNo)!;
  const allowed = canAccessProgramDay(state, program.packId, day.day);
  const story = findStory(state, day.storyId);
  const finished = done.size >= program.days.length;

  const enroll = () => {
    setState(s => ({ ...s, enrollments: [...s.enrollments, { programId: program.id, childId: child.id, startedAt: now(), completedDays: [] }] }));
    track("program_enrolled", { program: program.id });
    toast(tx(`${child.name} bergabung di ${loc(program.name, "id")}`, `${child.name} joined ${loc(program.name, "en")}`, `انضم ${child.name} إلى ${loc(program.name, "ar")}`));
  };

  const markDone = () => {
    if (!allowed) { setPaywall(true); return; }
    if (done.has(day.day)) return;
    setState(s => ({
      ...s,
      enrollments: s.enrollments.map(e => e.programId === program.id && e.childId === child.id ? { ...e, completedDays: [...new Set([...e.completedDays, day.day])].sort((a, b) => a - b) } : e),
    }));
    const fresh = logEvent({ childId: child.id, type: "action_completed", values: [day.value], programId: program.id, programDay: day.day, note: day.action.en });
    track("action_completed", { program: program.id, day: day.day });
    const all = [...fresh, ...evaluateBadges(child.id)];
    toast(tx(`Hari ${day.day} selesai`, `Day ${day.day} complete`, `اكتمل اليوم ${day.day}`));
    all.forEach(id => { const b = BADGES.find(x => x.id === id); if (b) toast(tx(`Lencana terbuka: ${loc(b.name, "id")}`, `Badge unlocked: ${loc(b.name, "en")}`, `شارة جديدة: ${loc(b.name, "ar")}`)); });
    setSelectedDay(null);
  };

  return (
    <Panel>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-xl">{loc(program.name, language)}</h3>
            {program.seasonal && <Pill tone="amber">{tx("Musiman", "Seasonal", "موسمي")}</Pill>}
            {finished && <Pill tone="emerald">{tx("Selesai", "Completed", "مكتمل")}</Pill>}
          </div>
          <p className="text-sm text-zinc-400">{loc(program.description, language)}</p>
          <p className="text-xs text-zinc-500 font-mono mt-1">{tx(`${program.days.length} hari`, `${program.days.length} days`, `${program.days.length} يوماً`)}{enr ? ` · ${done.size}/${program.days.length} ${tx("selesai", "done", "منجز")}` : ""}</p>
        </div>
        {!enr && <button className={btn.primary} onClick={enroll}>{tx(`Daftarkan ${child.name}`, `Enrol ${child.name}`, `سجّل ${child.name}`)}</button>}
      </div>

      {enr && (
        <>
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 mb-5" role="list">
            {program.days.map(d => {
              const isDone = done.has(d.day);
              const locked = !canAccessProgramDay(state, program.packId, d.day);
              return (
                <button
                  key={d.day}
                  role="listitem"
                  onClick={() => setSelectedDay(d.day)}
                  title={tx(`Hari ${d.day}`, `Day ${d.day}`, `اليوم ${d.day}`)}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-mono flex items-center justify-center border cursor-pointer transition-all",
                    isDone ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-200" : locked ? "border-white/5 text-zinc-600" : "border-white/15 text-zinc-300 hover:border-white/40",
                    d.day === dayNo && "ring-2 ring-white",
                  )}
                >
                  {locked && !isDone ? <Lock className="w-3 h-3" /> : d.day}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-mono text-zinc-400">{day.day === nextDay && selectedDay === null ? tx("Tugas hari ini", "Today's task", "مهمة اليوم") : tx(`Hari ${day.day}`, `Day ${day.day}`, `اليوم ${day.day}`)}</span>
              <ValueChip id={day.value} />
            </div>
            {!allowed ? (
              <div className="text-sm text-zinc-300">
                <p className="mb-3">{tx("7 hari pertama gratis. Buka perjalanan lengkap dengan Premium atau paket program.", "The first 7 days are free. Unlock the full journey with Premium or the program pack.", "الأيام السبعة الأولى مجانية. افتح الرحلة كاملة بالخطة المميزة أو حزمة البرنامج.")}</p>
                <button className={btn.primary} onClick={() => setPaywall(true)}><Lock className="w-3.5 h-3.5" />{tx("Buka", "Unlock", "افتح")}</button>
              </div>
            ) : (
              <div className="space-y-3">
                {story && (
                  <div className="flex items-center gap-3">
                    <StoryCover story={story} locked={!canAccessStory(state, story)} className="w-10 aspect-[3/4] rounded-lg shrink-0" />
                    <div className="flex-1 text-sm">{loc(story.title, language)}</div>
                    <Link to={`/story/${story.id}`} className={btn.small}><BookOpen className="w-3.5 h-3.5" />{tx("Baca", "Read", "اقرأ")}</Link>
                  </div>
                )}
                <p className="text-sm text-zinc-200 flex gap-2"><Target className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />{loc(day.action, language)}</p>
                <button className={done.has(day.day) ? btn.small : btn.primary} disabled={done.has(day.day)} onClick={markDone}>
                  {done.has(day.day) ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />{tx("Selesai", "Done", "تم")}</> : <><Circle className="w-3.5 h-3.5" />{tx("Tandai hari selesai", "Mark day complete", "أكملنا اليوم")}</>}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Lanjutkan program musiman lengkap dengan Premium, atau beli paket program.", "Continue the full seasonal program with Premium, or buy the program pack.", "تابع البرنامج الموسمي كاملاً بالخطة المميزة أو اشترِ حزمة البرنامج.")} />
    </Panel>
  );
}

export default function Programs() {
  const { child, tx } = useDash();
  if (!child) return <NoChild />;
  return (
    <div className="space-y-5">
      <SectionHeader
        title={tx("Program Keluarga", "Family Programs", "البرامج العائلية")}
        subtitle={tx("Perjalanan terpandu singkat: cerita, percakapan, dan aksi nyata setiap hari.", "Short guided journeys: a story, a conversation and a real-world action each day.", "رحلات موجّهة قصيرة: قصة وحوار وعمل واقعي كل يوم.")}
      />
      {PROGRAMS.map(p => <ProgramCard key={`${p.id}-${child.id}`} program={p} />)}
    </div>
  );
}

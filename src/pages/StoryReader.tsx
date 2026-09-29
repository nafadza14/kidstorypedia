import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Lock, Pause, Volume2, X, BookOpen, Type as TypeIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DiscussionCard } from "@/components/DiscussionCard";
import { Modal, StoryCover, ValueChip, btn, toast } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { PinGate } from "@/components/PinGate";
import { BADGES } from "@/data/catalog";
import { SOURCE_MAP } from "@/data/sources";
import { VALUE_MAP } from "@/data/values";
import { useNarration } from "@/hooks/useNarration";
import { track } from "@/lib/analytics";
import { findStory, loc, pageText } from "@/lib/content";
import { canAccessStory } from "@/lib/entitlements";
import { hasEvent, logEvent, readingSecondsToday, startSession, updateSession } from "@/lib/learning";
import { activeChild, getState, useStore } from "@/store";
import type { GlossaryTerm } from "@/types";

type Phase = "reading" | "celebrate" | "quiz" | "reflect" | "handoff";

/** Interactive Story Reader (PRD §16, §69). */
export default function StoryReader() {
  const { language, tx, dir } = useLanguage();
  const { id } = useParams();
  const nav = useNavigate();
  const state = useStore(s => s);
  const story = findStory(state, id);
  const child = activeChild(state)!;
  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState<Phase>("reading");
  const [tashkeel, setTashkeel] = useState(state.settings.tashkeel);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [gate, setGate] = useState<null | "discussion" | "exit" | "paywall">(null);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [term, setTerm] = useState<GlossaryTerm | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const sessionRef = useRef<string | null>(null);
  const tickRef = useRef<number>(Date.now());
  const narration = useNarration(language);
  const accessible = story ? canAccessStory(state, story) : false;

  // start session
  useEffect(() => {
    if (!story || !accessible || sessionRef.current) return;
    sessionRef.current = startSession(child.id, story.id, story.version);
    tickRef.current = Date.now();
    track("story_viewed", { storyId: story.id });
    track("story_started", { storyId: story.id, childId: child.id });
  }, [story?.id, accessible, child.id]);

  // reading-time tick + daily screen limit (PRD §32 parental controls)
  useEffect(() => {
    if (!sessionRef.current || phase !== "reading") return;
    const t = setInterval(() => {
      if (!sessionRef.current) return;
      const add = Math.round((Date.now() - tickRef.current) / 1000);
      tickRef.current = Date.now();
      if (document.visibilityState !== "visible") return;
      updateSession(sessionRef.current, { addSeconds: Math.min(add, 15) });
      const s = getState();
      const lim = s.settings.dailyScreenLimitMin;
      if (lim > 0 && readingSecondsToday(s, child.id) >= lim * 60) setTimeUp(true);
    }, 10000);
    return () => clearInterval(t);
  }, [phase, child.id, sessionRef.current]);

  useEffect(() => { narration.stop(); /* stop audio when page changes */ }, [page]);

  const text = story ? pageText(story.pages[page], language, child.age, tashkeel) : "";

  // keyboard navigation (RTL-aware)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (phase !== "reading") return;
      const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === fwd) next();
      if (e.key === back) prev();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  // text with glossary terms + read-aloud highlight (hook must run before early returns)
  const rendered = useMemoText(text, story?.glossary, state.settings.readAloudHighlight && narration.speaking ? narration.charIndex : null, setTerm);

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-xl text-zinc-400">{tx("Cerita tidak ditemukan.", "Story not found.", "القصة غير موجودة.")}</p>
        <Link to="/child" className="underline underline-offset-4">{tx("Kembali", "Go back", "العودة")}</Link>
      </div>
    );
  }

  if (!accessible) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center rounded-3xl border border-white/15 bg-zinc-900/70 p-8">
          <StoryCover story={story} className="aspect-[4/3] rounded-2xl mb-6" locked />
          <h1 className="text-2xl font-heading mb-2">{loc(story.title, language)}</h1>
          <p className="text-sm text-zinc-400 mb-6">{tx("Cerita ini bagian dari koleksi premium. Minta orang tua untuk membukanya.", "This story is part of a premium collection. Ask a parent to unlock it.", "هذه القصة ضمن مجموعة مميزة. اطلب من والديك فتحها.")}</p>
          <div className="flex flex-col gap-3">
            <button className={btn.primary} onClick={() => setGate("paywall")}><Lock className="w-4 h-4" />{tx("Orang Tua: buka kunci", "Parent: unlock", "للوالدين: افتح")}</button>
            <Link to="/child" className={btn.ghost}>{tx("Pilih cerita lain", "Choose another story", "اختر قصة أخرى")}</Link>
          </div>
        </div>
        <PinGate open={gate === "paywall"} onClose={() => setGate(null)} onPass={() => { setGate(null); setPaywall(true); }} />
        <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Buka cerita ini dengan Paket Keluarga Premium atau paket ceritanya.", "Unlock this story with Family Premium or its story pack.", "افتح هذه القصة بالاشتراك العائلي أو بحزمتها.")} />
      </div>
    );
  }

  const total = story.pages.length;
  const cur = story.pages[page];

  function next() {
    if (page < total - 1) {
      const n = page + 1;
      setPage(n);
      if (sessionRef.current) updateSession(sessionRef.current, { pagesViewed: n + 1 });
      track("story_page_viewed", { storyId: story!.id, page: n + 1 });
    } else finish();
  }
  function prev() { if (page > 0) setPage(p => p - 1); }

  function finish() {
    narration.stop();
    if (sessionRef.current) {
      const add = Math.min(Math.round((Date.now() - tickRef.current) / 1000), 15);
      tickRef.current = Date.now();
      updateSession(sessionRef.current, { completed: true, pagesViewed: total, addSeconds: add });
    }
    track("story_completed", { storyId: story!.id, childId: child.id });
    const fresh = logEvent({ childId: child.id, type: "story_completed", storyId: story!.id, storyVersion: story!.version, values: story!.values });
    fresh.forEach(b => { const d = BADGES.find(x => x.id === b); if (d) toast(tx(`Lencana baru: ${loc(d.name, "id")}!`, `New badge: ${loc(d.name, "en")}!`, `شارة جديدة: ${loc(d.name, "ar")}!`)); });
    setPhase("celebrate");
  }

  function toggleAudio() {
    if (narration.speaking) { narration.stop(); return; }
    track("audio_started", { storyId: story!.id });
    narration.speak(text);
  }


  const quiz = story.quiz || [];
  const answerQuiz = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === quiz[quizIdx].answer;
    if (correct) setQuizScore(s => s + 1);
    setTimeout(() => {
      setPicked(null);
      if (quizIdx < quiz.length - 1) setQuizIdx(q => q + 1);
      else {
        const score = quizScore + (correct ? 1 : 0);
        logEvent({ childId: child.id, type: "quiz_completed", storyId: story.id, values: story.values, score });
        track("quiz_completed", { storyId: story.id, score, total: quiz.length });
        setPhase("reflect");
      }
    }, 1100);
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] text-white flex flex-col overflow-hidden">
      {/* top bar */}
      <header className="absolute top-0 inset-x-0 p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-center z-50 bg-gradient-to-b from-black/90 to-transparent">
        <button onClick={() => nav("/child")} className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer" title={tx("Tutup", "Close", "إغلاق")}>
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 max-w-[40vw] overflow-x-auto scrollbar-none" aria-label={`Page ${page + 1} of ${total}`}>
          {story.pages.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all shrink-0 ${i === page ? "w-8 bg-white" : i < page ? "w-3 bg-white/60" : "w-3 bg-white/15"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {language === "ar" && (
            <button onClick={() => setTashkeel(t => !t)} className={`w-11 h-11 rounded-full border border-white/15 flex items-center justify-center cursor-pointer ${tashkeel ? "bg-white text-black" : "bg-white/10"}`} title={tx("Tashkeel", "Tashkeel", "التشكيل")}>
              <TypeIcon className="w-4 h-4" />
            </button>
          )}
          {state.settings.audioNarration && narration.supported && (
            <button onClick={toggleAudio} className={`w-11 h-11 rounded-full border border-white/15 flex items-center justify-center cursor-pointer ${narration.speaking ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`} title={tx("Dengarkan", "Listen", "استمع")}>
              {narration.speaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </header>

      {/* page */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            {cur.image && <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-105" style={{ backgroundImage: `url(${cur.image})`, filter: "blur(50px)" }} />}
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 px-6 pt-24 pb-32 md:p-16 max-w-7xl mx-auto overflow-y-auto">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 relative shrink-0 max-h-[40vh] md:max-h-none">
                <StoryCover story={{ ...story, coverImage: cur.image || story.coverImage }} className="w-full h-full" />
                <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono text-zinc-300">
                  {tx(`Halaman ${page + 1} dari ${total}`, `Page ${page + 1} of ${total}`, `الصفحة ${page + 1} من ${total}`)}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="mb-4 flex flex-wrap gap-1.5">{story.values.map(v => <ValueChip key={v} id={v} />)}</div>
                <p className={`leading-relaxed text-zinc-100 font-light ${child.age <= 5 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl lg:text-4xl"} ${language === "ar" ? "font-[Amiri,serif] leading-loose" : ""}`}>
                  {rendered}
                </p>
                {cur.sourceRefs.length > 0 && (
                  <p className="mt-6 text-[11px] font-mono text-zinc-500">
                    {tx("Sumber", "Source", "المصدر")}: {cur.sourceRefs.map(r => SOURCE_MAP[r]?.reference || r).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="absolute bottom-0 inset-x-0 p-6 sm:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-between items-center z-50 bg-gradient-to-t from-black/90 to-transparent">
        <button onClick={prev} disabled={page === 0} className="w-14 h-14 rounded-full bg-zinc-900/80 border border-white/15 flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-20 cursor-pointer" title={tx("Sebelumnya", "Previous", "السابق")}>
          {dir === "rtl" ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <div className="text-xs font-mono text-zinc-400 text-center px-3 line-clamp-1">{loc(story.title, language)}</div>
        <button onClick={next} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 shadow-2xl cursor-pointer" title={page < total - 1 ? tx("Selanjutnya", "Next", "التالي") : tx("Selesai", "Finish", "إنهاء")}>
          {page < total - 1 ? (dir === "rtl" ? <ChevronLeft className="w-7 h-7" /> : <ChevronRight className="w-7 h-7" />) : <Check className="w-6 h-6" />}
        </button>
      </footer>

      {/* glossary / vocabulary assistance */}
      <Modal open={!!term} onClose={() => setTerm(null)} title={term?.term}>
        <p className="text-lg text-zinc-200 flex gap-3 items-start"><BookOpen className="w-5 h-5 mt-1 shrink-0" />{term && loc(term.meaning, language)}</p>
      </Modal>

      {/* completion flow: celebrate → quiz → reflect → hand-off (PRD §12 learning journey) */}
      <AnimatePresence>
        {phase !== "reading" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
            <motion.div key={phase} initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/20 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center">
              {phase === "celebrate" && (
                <>
                  <div className="text-5xl mb-4">✳︎</div>
                  <h2 className="text-3xl font-heading mb-3">{tx("MasyaAllah!", "MashaAllah!", "ما شاء الله!")}</h2>
                  <p className="text-zinc-300 mb-6">{tx(`Kamu telah menyelesaikan "${story.title.en}".`, `You finished "${story.title.en}".`, `لقد أكملت «${loc(story.title, "ar")}».`)}</p>
                  <div className="text-xs font-mono text-zinc-400 mb-3">{tx("Nilai-nilai dalam cerita ini", "Values in this story", "القيم في هذه القصة")}</div>
                  <div className="space-y-2 mb-8 text-left rtl:text-right">
                    {story.values.map(v => (
                      <div key={v} className="rounded-2xl p-3 border" style={{ borderColor: VALUE_MAP[v].color + "55", background: VALUE_MAP[v].color + "12" }}>
                        <div className="font-heading text-sm">{loc(VALUE_MAP[v].name, language)}</div>
                        <div className="text-xs text-zinc-300">{loc(VALUE_MAP[v].description, language)}</div>
                      </div>
                    ))}
                  </div>
                  <button className={btn.primary + " w-full py-3.5"} onClick={() => setPhase(quiz.length ? "quiz" : "reflect")}>{tx("Lanjutkan", "Continue", "متابعة")}</button>
                </>
              )}

              {phase === "quiz" && quiz[quizIdx] && (
                <>
                  <div className="text-xs font-mono text-zinc-400 mb-3">{tx(`Pertanyaan ${quizIdx + 1} dari ${quiz.length}`, `Question ${quizIdx + 1} of ${quiz.length}`, `سؤال ${quizIdx + 1} من ${quiz.length}`)}</div>
                  <h2 className="text-2xl font-heading mb-6">{loc(quiz[quizIdx].q, language)}</h2>
                  <div className="space-y-3">
                    {quiz[quizIdx].options.map((o, i) => {
                      const show = picked !== null;
                      const right = i === quiz[quizIdx].answer;
                      return (
                        <button key={i} onClick={() => answerQuiz(i)} className={`w-full py-4 px-5 rounded-2xl border text-lg transition-all cursor-pointer ${show && right ? "bg-emerald-500/20 border-emerald-400" : show && picked === i ? "bg-rose-500/10 border-rose-400/50" : "border-white/15 hover:bg-white/10"}`}>
                          {loc(o, language)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {phase === "reflect" && (
                <>
                  <h2 className="text-2xl font-heading mb-3">{tx("Pikirkan baik-baik", "Think about it", "فكّر في ذلك")}</h2>
                  <p className="text-lg text-zinc-200 mb-8">{loc(story.discussion.reflection, language)}</p>
                  <p className="text-sm text-zinc-400 mb-6">{tx("Katakan jawabanmu dengan lantang kepada keluargamu!", "Say your answer out loud to your family!", "قل إجابتك بصوت عالٍ لعائلتك!")}</p>
                  <button className={btn.primary + " w-full py-3.5"} onClick={() => setPhase("handoff")}>{tx("Aku sudah memikirkannya", "I thought about it", "فكّرت في ذلك")}</button>
                </>
              )}

              {phase === "handoff" && (
                <>
                  <div className="text-4xl mb-4">🤝</div>
                  <h2 className="text-2xl font-heading mb-3">{tx("Sekarang bicaralah dengan orang tuamu", "Now talk with your parent", "الآن تحدّث مع والديك")}</h2>
                  <p className="text-zinc-300 mb-8">{tx("Tunjukkan layar ini kepada orang tua - mereka punya pertanyaan dan tantangan keluarga untukmu.", "Show this screen to a parent - they have questions and a family challenge for you.", "أرِ هذه الشاشة لأحد والديك - لديهم أسئلة وتحدٍّ عائلي لك.")}</p>
                  <div className="flex flex-col gap-3">
                    <button className={btn.primary + " py-3.5"} onClick={() => setGate("discussion")}>
                      {hasEvent(state, child.id, "discussion_completed", story.id) ? tx("Orang Tua: lihat diskusi", "Parent: view discussion", "للوالدين: عرض النقاش") : tx("Orang Tua: buka panduan diskusi", "Parent: open discussion guide", "للوالدين: افتح دليل النقاش")}
                    </button>
                    <button className={btn.ghost + " py-3.5"} onClick={() => nav("/child")}>{tx("Baca cerita lain", "Read another story", "اقرأ قصة أخرى")}</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showDiscussion} onClose={() => setShowDiscussion(false)} title={tx("Panduan diskusi", "Discussion guide", "دليل النقاش")}>
        <DiscussionCard story={story} childId={child.id} />
        <div className="mt-6 flex gap-3">
          <button className={btn.primary + " flex-1"} onClick={() => nav("/dashboard")}>{tx("Ke dasbor", "Go to dashboard", "إلى لوحة التحكم")}</button>
          <button className={btn.ghost + " flex-1"} onClick={() => nav("/child")}>{tx("Kembali ke cerita", "Back to stories", "العودة للقصص")}</button>
        </div>
      </Modal>

      <Modal open={timeUp} onClose={() => nav("/child")} title={tx("Waktu membaca hari ini sudah habis", "Reading time is up for today", "انتهى وقت القراءة لليوم")}>
        <p className="text-zinc-300 mb-6">{tx("Bacaan yang hebat! Kita lanjutkan besok ya, insya Allah.", "Great reading! Let's save the rest for tomorrow, in sha Allah.", "قراءة رائعة! لنكمل غداً إن شاء الله.")}</p>
        <button className={btn.primary + " w-full"} onClick={() => nav("/child")}>{tx("OK", "OK", "حسناً")}</button>
      </Modal>

      <PinGate open={gate === "discussion"} onClose={() => setGate(null)} onPass={() => { setGate(null); setShowDiscussion(true); track("discussion_opened", { storyId: story.id }); }} />
    </div>
  );
}

/** Renders page text with clickable glossary terms and a read-aloud highlight. */
function useMemoText(text: string, glossaryIn: GlossaryTerm[] | undefined, charIndex: number | null, onTerm: (t: GlossaryTerm) => void) {
  return useMemo(() => {
    const glossary = glossaryIn || [];
    const words = text.split(/(\s+)/);
    let pos = 0;
    return words.map((w, i) => {
      const start = pos;
      pos += w.length;
      if (/^\s+$/.test(w)) return w;
      const clean = w.replace(/[.,!?'"«»؛،:]/g, "");
      const g = glossary.find(x => x.term.toLowerCase() === clean.toLowerCase());
      const active = charIndex !== null && charIndex >= start && charIndex < pos;
      const cls = active ? "bg-amber-300/30 rounded px-0.5" : "";
      if (g) return <button key={i} onClick={() => onTerm(g)} className={`underline decoration-dotted decoration-amber-300 underline-offset-4 cursor-help ${cls}`}>{w}</button>;
      return <span key={i} className={cls}>{w}</span>;
    });
  }, [text, glossaryIn, charIndex, onTerm]) as React.ReactNode;
}

import React, { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, ShieldAlert, User } from "lucide-react";
import { Panel, btn, input, label } from "@/components/kit";
import { askAssistant } from "@/lib/ai/pipeline";
import { familyStories, loc } from "@/lib/content";
import { NoChild, Pill, SectionHeader, useDash } from "./shared";

interface Msg { id: number; role: "user" | "assistant"; text: string; grounded?: boolean; fallback?: boolean; storyTitle?: string }

export default function Assistant() {
  const { state, child, language, tx } = useDash();
  const [storyId, setStoryId] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, busy]);
  if (!child) return <NoChild />;

  const stories = familyStories(state);
  const story = stories.find(s => s.id === storyId);
  const suggestions = story
    ? [
      tx(`Bagaimana cara menjelaskan pelajaran utama dari "${loc(story.title, "id")}" kepada anak usia ${child.age} tahun?`, `How do I explain the main lesson of "${story.title.en}" to a ${child.age}-year-old?`, `كيف أشرح الدرس الأساسي في «${loc(story.title, "ar")}» لطفل عمره ${child.age}؟`),
      tx("Pertanyaan lanjutan apa yang bisa saya ajukan saat menjelang tidur?", "What follow-up questions can I ask at bedtime?", "ما الأسئلة التي يمكنني طرحها قبل النوم؟"),
      tx("Bagaimana kami bisa mempraktikkan nilai ini di rumah minggu ini?", "How can we practise this value at home this week?", "كيف نمارس هذه القيمة في البيت هذا الأسبوع؟"),
    ]
    : [
      tx("Bagaimana cara menjadikan dongeng sebelum tidur sebagai kebiasaan?", "How can I make bedtime story time a habit?", "كيف أجعل قصة ما قبل النوم عادة؟"),
      tx(`Bagaimana cara berbicara tentang kesabaran dengan anak usia ${child.age} tahun?`, `How do I talk about patience with a ${child.age}-year-old?`, `كيف أتحدث عن الصبر مع طفل عمره ${child.age}؟`),
      tx("Anak saya bertanya hal sulit tentang Allah - bagaimana cara menjawab dengan lembut?", "My child asks hard questions about Allah - how do I respond gently?", "يسألني طفلي أسئلة صعبة عن الله - كيف أجيب بلطف؟"),
    ];

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setQ("");
    setMsgs(m => [...m, { id: Date.now(), role: "user", text, storyTitle: story ? loc(story.title, language) : undefined }]);
    setBusy(true);
    try {
      const r = await askAssistant(text, { storyId: storyId || undefined, age: child.age, lang: language });
      setMsgs(m => [...m, { id: Date.now() + 1, role: "assistant", text: r.answer, grounded: r.grounded, fallback: r.fallback }]);
    } catch {
      setMsgs(m => [...m, { id: Date.now() + 1, role: "assistant", text: tx("Terjadi kesalahan. Silakan coba lagi.", "Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."), fallback: true }]);
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => { e.preventDefault(); ask(q); };

  return (
    <div className="space-y-5">
      <SectionHeader
        title={tx("Asisten Orang Tua", "Parent Assistant", "مساعد الوالدين")}
        subtitle={tx("Dapatkan bantuan menjelaskan cerita dan nilai kepada anak Anda, berdasarkan konten cerita yang telah disetujui.", "Get help explaining stories and values to your child, grounded in the approved story content.", "احصل على مساعدة لشرح القصص والقيم لطفلك، استناداً إلى محتوى القصص المعتمد.")}
      />
      <div className="rounded-2xl border border-amber-300/25 bg-amber-300/5 p-4 text-xs text-amber-100/90 flex gap-3">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{tx("Asisten ini adalah pembantu pengasuhan, bukan ulama. Asisten ini tidak memberikan fatwa atau hukum agama - untuk itu, silakan berkonsultasi dengan ulama yang berkompeten atau imam masjid Anda.", "This assistant is a parenting helper, not a scholar. It does not give fatwas or religious rulings - for those, please consult a qualified scholar or your local imam.", "هذا المساعد أداة مساعدة للوالدين وليس عالماً. لا يصدر فتاوى أو أحكاماً شرعية - لذلك يُرجى استشارة عالم مؤهل أو إمام مسجدك.")}</span>
      </div>

      <Panel>
        <div className="mb-4">
          <label className={label}>{tx("Konteks cerita (opsional)", "Story context (optional)", "سياق القصة (اختياري)")}</label>
          <select className={input} value={storyId} onChange={e => setStoryId(e.target.value)}>
            <option value="">{tx("Tanpa cerita tertentu", "No specific story", "بدون قصة محددة")}</option>
            {stories.map(s => <option key={s.id} value={s.id}>{loc(s.title, language)}</option>)}
          </select>
        </div>

        <div className="min-h-[240px] max-h-[480px] overflow-y-auto space-y-4 py-2" aria-live="polite">
          {!msgs.length && <p className="text-sm text-zinc-500 text-center py-10">{tx("Ajukan pertanyaan, atau pilih saran di bawah.", "Ask a question, or pick a suggestion below.", "اطرح سؤالاً أو اختر اقتراحاً أدناه.")}</p>}
          {msgs.map(m => (
            <div key={m.id} className={m.role === "user" ? "flex gap-3 justify-end" : "flex gap-3"}>
              {m.role === "assistant" && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>}
              <div className={m.role === "user" ? "max-w-[80%] rounded-2xl bg-white text-black px-4 py-2.5 text-sm" : "max-w-[85%] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm"}>
                {m.storyTitle && <div className="text-[10px] font-mono opacity-60 mb-1">{m.storyTitle}</div>}
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                {m.role === "assistant" && (
                  <div className="flex gap-1.5 mt-2">
                    {m.grounded && <Pill tone="emerald">{tx("Berdasarkan cerita", "Grounded in story", "مستند إلى القصة")}</Pill>}
                    {m.fallback && <Pill tone="amber">{tx("Cadangan offline", "Offline fallback", "إجابة احتياطية")}</Pill>}
                    {!m.grounded && !m.fallback && <Pill>{tx("Panduan umum", "General guidance", "إرشاد عام")}</Pill>}
                  </div>
                )}
              </div>
              {m.role === "user" && <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
            </div>
          ))}
          {busy && <div className="flex items-center gap-2 text-xs text-zinc-400"><Loader2 className="w-4 h-4 animate-spin" />{tx("Sedang berpikir…", "Thinking…", "جارٍ التفكير…")}</div>}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-2 my-3">
          {suggestions.map(s => <button key={s} className={btn.small} onClick={() => ask(s)} disabled={busy}>{s}</button>)}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <input className={input} value={q} onChange={e => setQ(e.target.value)} maxLength={500} placeholder={tx("Tanyakan tentang cerita, nilai, atau pertanyaan sulit…", "Ask about a story, a value, or a tricky question…", "اسأل عن قصة أو قيمة أو سؤال صعب…")} />
          <button className={btn.primary} disabled={busy || !q.trim()} aria-label={tx("Kirim", "Send", "إرسال")}><Send className="w-4 h-4 rtl:rotate-180" /></button>
        </form>
      </Panel>
    </div>
  );
}

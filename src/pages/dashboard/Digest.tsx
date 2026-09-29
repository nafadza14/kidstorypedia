import React, { useState } from "react";
import { Copy, Info, Printer } from "lucide-react";
import { Avatar, btn } from "@/components/kit";
import { findStory, loc } from "@/lib/content";
import { fmtDuration, weekStart, weeklySummary } from "@/lib/learning";
import { nextStep } from "@/lib/recommend";
import { cn } from "@/lib/utils";
import type { AppState } from "@/store";
import type { ChildProfile, Lang } from "@/types";
import { PrintStyle, SectionHeader, copyText, fmtDate, useDash, valueName } from "./shared";

function weekRange(offset: number) {
  const start = weekStart();
  start.setDate(start.getDate() - offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

/** Restrict the store snapshot to events/sessions before `end` so weeklySummary covers exactly one week. */
function until(s: AppState, end: Date): AppState {
  return { ...s, events: s.events.filter(e => new Date(e.at) < end), sessions: s.sessions.filter(x => new Date(x.startedAt) < end) };
}

function buildDigest(s: AppState, child: ChildProfile, offset: number, lang: Lang, tx: (id: string, en: string, ar?: string) => string) {
  const { start, end } = weekRange(offset);
  const w = weeklySummary(until(s, end), child.id, start);
  const step = offset === 0 ? nextStep(s, child, lang) : undefined;
  const stories = w.storiesCompleted.map(id => loc(findStory(s, id)?.title, lang) || id);
  const lastDay = new Date(end.getTime() - 86400000);
  return { start, lastDay, w, step, stories };
}

type Digest = ReturnType<typeof buildDigest>;

function digestText(child: ChildProfile, d: Digest, lang: Lang, tx: (id: string, en: string, ar?: string) => string) {
  const lines = [
    tx(`Kidstorypedia - Pekan ${child.name} (${fmtDate(d.start.toISOString(), lang)} – ${fmtDate(d.lastDay.toISOString(), lang)})`, `Kidstorypedia - ${child.name}'s week (${fmtDate(d.start.toISOString(), lang)} – ${fmtDate(d.lastDay.toISOString(), lang)})`, `كيدستوريبيديا - أسبوع ${child.name} (${fmtDate(d.start.toISOString(), lang)} – ${fmtDate(d.lastDay.toISOString(), lang)})`),
    "",
    tx(`Cerita: ${d.stories.join(", ") || "belum ada"}`, `Stories: ${d.stories.join(", ") || "none yet"}`, `القصص: ${d.stories.join("، ") || "لا شيء بعد"}`),
    tx(`Nilai yang dipelajari: ${d.w.values.map(v => valueName(v, lang)).join(", ") || "-"}`, `Values explored: ${d.w.values.map(v => valueName(v, lang)).join(", ") || "-"}`, `القيم: ${d.w.values.map(v => valueName(v, lang)).join("، ") || "-"}`),
    tx(`Diskusi keluarga: ${d.w.discussions}`, `Family discussions: ${d.w.discussions}`, `النقاشات العائلية: ${d.w.discussions}`),
    tx(`Tantangan aksi: ${d.w.actions.length}`, `Action challenges: ${d.w.actions.length}`, `التحديات العملية: ${d.w.actions.length}`),
    tx(`Refleksi: ${d.w.reflections.length}`, `Reflections: ${d.w.reflections.length}`, `التأملات: ${d.w.reflections.length}`),
    tx(`Catatan orang tua: ${d.w.observations.length}`, `Parent observations: ${d.w.observations.length}`, `ملاحظات الوالدين: ${d.w.observations.length}`),
    tx(`Waktu membaca: ${fmtDuration(d.w.readingSeconds)}`, `Reading time: ${fmtDuration(d.w.readingSeconds)}`, `وقت القراءة: ${fmtDuration(d.w.readingSeconds)}`),
    tx(`Sesi belajar bermakna: ${d.w.meaningful}`, `Meaningful learning sessions: ${d.w.meaningful}`, `جلسات التعلم الهادفة: ${d.w.meaningful}`),
  ];
  const notes = [...d.w.reflections, ...d.w.observations].filter(e => e.note).slice(0, 3);
  if (notes.length) lines.push("", tx("Momen:", "Moments:", "لحظات:"), ...notes.map(e => `• ${e.note}`));
  if (d.step) lines.push("", tx(`Langkah selanjutnya: ${loc(d.step.story.title, lang)} - ${d.step.reason}`, `Next step: ${loc(d.step.story.title, lang)} - ${d.step.reason}`, `الخطوة التالية: ${loc(d.step.story.title, lang)} - ${d.step.reason}`));
  return lines.join("\n");
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5 border-b border-white/5 print:border-zinc-200 grid grid-cols-[160px_1fr] gap-3 text-sm">
      <div className="text-zinc-400 print:text-zinc-500">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function DigestSection() {
  const { state, language, tx } = useDash();
  const [offset, setOffset] = useState(0);
  const digests = state.children.map(c => ({ child: c, d: buildDigest(state, c, offset, language, tx) }));
  const all = digests.map(({ child, d }) => digestText(child, d, language, tx)).join("\n\n---\n\n");

  return (
    <div className="space-y-5">
      <PrintStyle />
      <SectionHeader
        title={tx("Ringkasan Mingguan Keluarga", "Weekly Family Digest", "الملخص العائلي الأسبوعي")}
        subtitle={tx("Ringkasan singkat pekan setiap anak - cetak atau salin untuk dibagikan ke keluarga lewat email atau WhatsApp.", "A short summary of each child's week - print it, or copy it to share with family by email or WhatsApp.", "ملخص قصير لأسبوع كل طفل - اطبعه أو انسخه لمشاركته بالبريد أو واتساب.")}
        action={
          <div className="flex gap-2">
            <button className={btn.ghost} onClick={() => copyText(all, tx("Ringkasan disalin", "Digest copied", "تم نسخ الملخص"))}><Copy className="w-4 h-4" />{tx("Salin sebagai teks", "Copy as text", "نسخ كنص")}</button>
            <button className={btn.primary} onClick={() => window.print()}><Printer className="w-4 h-4" />{tx("Cetak", "Print", "طباعة")}</button>
          </div>
        }
      />
      <div className="flex gap-2 overflow-x-auto">
        {[0, 1, 2, 3, 4].map(o => {
          const { start } = weekRange(o);
          return (
            <button key={o} onClick={() => setOffset(o)} className={cn("px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap border cursor-pointer", offset === o ? "bg-white text-black border-white" : "border-white/15 text-zinc-300")}>
              {o === 0 ? tx("Pekan ini", "This week", "هذا الأسبوع") : o === 1 ? tx("Pekan lalu", "Last week", "الأسبوع الماضي") : fmtDate(start.toISOString(), language)}
            </button>
          );
        })}
      </div>

      <div className="ksp-print space-y-5">
        {digests.map(({ child, d }) => (
          <section key={child.id} className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 print:bg-white print:border-zinc-300 print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-4">
              <Avatar seed={child.avatarSeed} size={40} className="print:hidden" />
              <div>
                <h3 className="font-heading text-xl">{tx(`Pekan ${child.name}`, `${child.name}'s week`, `أسبوع ${child.name}`)}</h3>
                <p className="text-xs text-zinc-500">{fmtDate(d.start.toISOString(), language)} – {fmtDate(d.lastDay.toISOString(), language)}</p>
              </div>
              <div className="ms-auto text-end">
                <div className="text-2xl font-light">{d.w.meaningful}</div>
                <div className="text-[10px] font-mono text-zinc-500">{tx("sesi bermakna", "meaningful sessions", "جلسات هادفة")}</div>
              </div>
            </div>
            <Row label={tx("Cerita", "Stories", "القصص")}>{d.stories.length ? d.stories.join(language === "ar" ? "، " : ", ") : <span className="text-zinc-500">{tx("Belum ada minggu ini", "None this week", "لا شيء هذا الأسبوع")}</span>}</Row>
            <Row label={tx("Nilai yang dipelajari", "Values explored", "القيم المستكشفة")}>{d.w.values.length ? d.w.values.map(v => valueName(v, language)).join(language === "ar" ? "، " : ", ") : "-"}</Row>
            <Row label={tx("Diskusi keluarga", "Family discussions", "النقاشات العائلية")}>{d.w.discussions}</Row>
            <Row label={tx("Tantangan aksi", "Action challenges", "التحديات العملية")}>{d.w.actions.length}</Row>
            <Row label={tx("Refleksi", "Reflections", "التأملات")}>
              {d.w.reflections.length}
              {d.w.reflections.filter(r => r.note).slice(0, 3).map(r => <p key={r.id} className="text-xs text-zinc-400 italic mt-1">“{r.note}”</p>)}
            </Row>
            <Row label={tx("Catatan orang tua", "Parent observations", "ملاحظات الوالدين")}>
              {d.w.observations.length}
              {d.w.observations.slice(0, 3).map(o => <p key={o.id} className="text-xs text-zinc-400 mt-1">{valueName(o.values[0], language)}: {o.note}</p>)}
            </Row>
            <Row label={tx("Waktu membaca", "Reading time", "وقت القراءة")}>{fmtDuration(d.w.readingSeconds)}</Row>
            {d.step && <Row label={tx("Langkah selanjutnya", "Next step", "الخطوة التالية")}><span className="font-medium">{loc(d.step.story.title, language)}</span> <span className="text-zinc-400 text-xs">- {d.step.reason}</span></Row>}
          </section>
        ))}
      </div>

      <p className="text-xs text-zinc-500 flex items-start gap-2 print:hidden">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        {state.settings.weeklyDigest
          ? tx("Pengiriman email mingguan otomatis memerlukan layanan email backend; sementara itu, gunakan Salin atau Cetak untuk berbagi.", "Automatic weekly email delivery needs a backend mail service; until then, use Copy or Print to share.", "يتطلب الإرسال التلقائي بالبريد خادماً للبريد؛ حتى ذلك الحين استخدم النسخ أو الطباعة للمشاركة.")
          : tx("Ringkasan mingguan dimatikan di Pengaturan.", "Weekly digest is turned off in Settings.", "الملخص الأسبوعي متوقف في الإعدادات.")}
      </p>
    </div>
  );
}

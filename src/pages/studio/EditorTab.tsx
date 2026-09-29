import { useMemo, useState } from "react";
import { Empty, Panel, ReviewBadge, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { PACKS } from "@/data/catalog";
import { SOURCES } from "@/data/sources";
import { CANONICAL_STORIES } from "@/data/stories";
import { CATEGORIES, VALUES } from "@/data/values";
import { allStories, findStory, loc } from "@/lib/content";
import { getState, now, setState, useStore } from "@/store";
import type { Localized, Story, StoryCategory, StoryPage, ValueId } from "@/types";
import { Field, Toggle, bumpVersion, fmtDate, inp, sel, td, th } from "./shared";

type Props = { id?: string; editor: string; onPick: (id: string) => void; onReview: (id: string) => void };

export default function EditorTab({ id, editor, onPick, onReview }: Props) {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const story = findStory(state, id);
  const stories = useMemo(() => allStories(state), [state]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={story?.id || ""} onChange={e => e.target.value && onPick(e.target.value)} className={sel + " max-w-md"}>
          <option value="">{tx("Pilih cerita untuk diedit…", "Choose a story to edit…", "اختر قصة…")}</option>
          {stories.map(s => <option key={s.id} value={s.id}>{loc(s.title, language) || s.id} - v{s.version}</option>)}
        </select>
        {story && <ReviewBadge state={story.state} />}
        {story && <button className={btn.small} onClick={() => onReview(story.id)}>{tx("Buka di antrian tinjauan", "Open in review queue", "افتح في المراجعة")}</button>}
      </div>
      {!story ? <Empty>{tx("Pilih cerita dari tabel atau pemilih di atas.", "Select a story from the table or the picker above.", "اختر قصة من الجدول.")}</Empty> : <StoryEditor key={story.id + "@" + story.version} story={story} editor={editor} />}
    </div>
  );
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const lines = (a?: string[]) => (a || []).join("\n");
const unlines = (t: string) => t.split("\n").map(x => x.trim()).filter(Boolean);

function LocInput({ value, onChange, area, rows = 3 }: { value: Localized | undefined; onChange: (v: Localized) => void; area?: boolean; rows?: number }) {
  const v = value || { en: "" };
  const C = area ? "textarea" : "input";
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      <C className={inp} rows={area ? rows : undefined} value={v.en} placeholder="EN" onChange={(e: any) => onChange({ ...v, en: e.target.value })} />
      <C className={inp + " text-right"} dir="rtl" rows={area ? rows : undefined} value={v.ar || ""} placeholder="AR" onChange={(e: any) => onChange({ ...v, ar: e.target.value })} />
    </div>
  );
}

function StoryEditor({ story, editor }: { story: Story; editor: string }) {
  const { tx } = useLanguage();
  const state = useStore(s => s);
  const [d, setD] = useState<Story>(() => clone(story));
  const [note, setNote] = useState("");
  const [rk, setRk] = useState(0);
  const dirty = JSON.stringify(d) !== JSON.stringify(story);

  const patch = (p: Partial<Story>) => setD(x => ({ ...x, ...p }));
  const patchPage = (i: number, p: Partial<StoryPage>) => setD(x => ({ ...x, pages: x.pages.map((pg, j) => (j === i ? { ...pg, ...p } : pg)) }));
  const questions = [0, 1, 2].map(i => d.discussion.questions[i] || { en: "" });

  const versions = state.versions.filter(v => v.storyId === story.id).slice().reverse();
  const learned = useMemo(() => {
    const m = new Map<string, number>();
    state.events.filter(e => e.storyId === story.id).forEach(e => { const k = e.storyVersion || "?"; m.set(k, (m.get(k) || 0) + 1); });
    state.sessions.filter(x => x.storyId === story.id).forEach(x => { if (!m.has(x.storyVersion)) m.set(x.storyVersion, 0); });
    return m;
  }, [state.events, state.sessions, story.id]);

  function commit(next: Story, noteText: string) {
    const version = bumpVersion(story.version);
    const saved: Story = { ...next, version };
    const by = editor.trim() || "Editor";
    setState(s => {
      const hasBaseline = s.versions.some(v => v.storyId === story.id);
      const baseline = hasBaseline ? [] : [{ storyId: story.id, version: story.version, at: now(), by: "system", note: "Baseline before first edit", snapshot: story }];
      return {
        ...s,
        storyOverrides: { ...s.storyOverrides, [story.id]: saved },
        versions: [...s.versions, ...baseline, { storyId: story.id, version, at: now(), by, note: noteText, snapshot: saved }],
      };
    });
    toast(tx(`Tersimpan v${version}`, `Saved v${version}`, `حُفظ الإصدار ${version}`));
  }

  function save() {
    if (d.pages.some(p => !p.sourceRefs.length)) {
      if (!confirm(tx("Beberapa halaman tidak memiliki referensi sumber (PRD §23). Tetap simpan?", "Some pages have no source reference (PRD §23). Save anyway?", "بعض الصفحات بلا مصدر. حفظ؟"))) return;
    }
    commit(d, note.trim() || "Edited in Studio");
    setNote("");
  }

  function restore(v: string) {
    const snap = getState().versions.find(x => x.storyId === story.id && x.version === v)?.snapshot;
    if (!snap) return;
    if (!confirm(tx(`Pulihkan v${v} sebagai versi baru?`, `Restore v${v} as a new version?`, `استعادة ${v}؟`))) return;
    commit(clone(snap), `Restored from v${v}`);
  }

  function resetToCanonical() {
    const c = CANONICAL_STORIES.find(x => x.id === story.id);
    if (!c || !confirm(tx("Ganti dengan teks kanonik bawaan (disimpan sebagai versi baru)?", "Replace with the shipped canonical text (saved as a new version)?", "استبدال بالنص الأصلي؟"))) return;
    commit(clone(c), "Reset to shipped canonical text");
  }

  return (
    <div className="grid xl:grid-cols-[1fr_340px] gap-5">
      <div className="space-y-5">
        <Panel title={tx("Metadata", "Metadata", "البيانات الوصفية")}>
          <div className="space-y-3">
            <Field label={tx("Judul", "Title", "العنوان")}><LocInput value={d.title} onChange={title => patch({ title })} /></Field>
            <Field label={tx("Deskripsi", "Description", "الوصف")}><LocInput area rows={2} value={d.description} onChange={description => patch({ description })} /></Field>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label={tx("Kategori", "Category", "الفئة")}>
                <select className={sel + " w-full"} value={d.category} onChange={e => patch({ category: e.target.value as StoryCategory })}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                </select>
              </Field>
              <Field label={tx("Usia min / maks", "Age min / max", "العمر")}>
                <div className="flex gap-1.5">
                  <input type="number" min={3} max={12} className={inp} value={d.ageRange[0]} onChange={e => patch({ ageRange: [+e.target.value, d.ageRange[1]] })} />
                  <input type="number" min={3} max={12} className={inp} value={d.ageRange[1]} onChange={e => patch({ ageRange: [d.ageRange[0], +e.target.value] })} />
                </div>
              </Field>
              <Field label={tx("Durasi (menit)", "Duration (min)", "المدة")}><input type="number" min={1} className={inp} value={d.durationMin} onChange={e => patch({ durationMin: +e.target.value })} /></Field>
              <Field label={tx("Paket", "Pack", "الحزمة")}>
                <select className={sel + " w-full"} value={d.packId || ""} onChange={e => patch({ packId: e.target.value || undefined })}>
                  <option value="">-</option>
                  {PACKS.map(p => <option key={p.id} value={p.id}>{p.id}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={d.premium} onChange={e => patch({ premium: e.target.checked })} />{tx("Premium", "Premium", "مميز")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!d.bedtime} onChange={e => patch({ bedtime: e.target.checked })} />{tx("Sebelum tidur", "Bedtime", "قبل النوم")}</label>
              <span className="text-xs font-mono text-zinc-500">origin: {d.origin} · v{story.version}</span>
            </div>
            <Field label={tx("Nilai (taksonomi 12 nilai)", "Values (12-value taxonomy)", "القيم")}>
              <div className="flex flex-wrap gap-1.5">
                {VALUES.map(v => (
                  <Toggle key={v.id} color={v.color} on={d.values.includes(v.id)} onClick={() => patch({ values: d.values.includes(v.id) ? d.values.filter(x => x !== v.id) : [...d.values, v.id as ValueId] })}>{v.name.en}</Toggle>
                ))}
              </div>
            </Field>
          </div>
        </Panel>

        <Panel title={tx("Halaman", "Pages", "الصفحات")} action={<button className={btn.small} onClick={() => patch({ pages: [...d.pages, { page: d.pages.length + 1, text: { en: "" }, sourceRefs: [] }] })}>+ {tx("Halaman", "Page", "صفحة")}</button>}>
          <div className="space-y-4">
            {d.pages.map((p, i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">{tx("Halaman", "Page", "صفحة")} {i + 1}</span>
                  <button className="text-[11px] text-red-300 hover:underline cursor-pointer" onClick={() => patch({ pages: d.pages.filter((_, j) => j !== i).map((pg, j) => ({ ...pg, page: j + 1 })) })}>{tx("Hapus", "Remove", "حذف")}</button>
                </div>
                <Field label={tx("Teks", "Text", "النص")}><LocInput area value={p.text} onChange={text => patchPage(i, { text })} /></Field>
                <Field label={tx("Varian usia 4-5 (opsional)", "Age 4-5 variant (optional)", "نسخة ٤-٥")}>
                  <LocInput area rows={2} value={p.variants?.["4-5"]} onChange={v => patchPage(i, { variants: { ...(p.variants || {}), "4-5": v.en || v.ar ? v : undefined } })} />
                </Field>
                <Field label={tx("Referensi sumber", "Source refs", "المصادر")}>
                  <div className="flex flex-wrap gap-1">
                    {SOURCES.map(s => (
                      <Toggle key={s.id} on={p.sourceRefs.includes(s.id)} onClick={() => patchPage(i, { sourceRefs: p.sourceRefs.includes(s.id) ? p.sourceRefs.filter(x => x !== s.id) : [...p.sourceRefs, s.id] })}>
                        <span title={s.reference}>{s.id}</span>
                      </Toggle>
                    ))}
                  </div>
                  {!p.sourceRefs.length && <div className="text-[11px] text-amber-300 mt-1">{tx("Tidak ada referensi sumber - wajib untuk konten kanonik.", "No source reference - required for canonical content.", "لا يوجد مصدر.")}</div>}
                </Field>
                <Field label={tx("Prompt ilustrasi", "Illustration prompt", "وصف الرسم")}><textarea rows={2} className={inp} value={p.illustrationPrompt || ""} onChange={e => patchPage(i, { illustrationPrompt: e.target.value })} /></Field>
                {p.image && <img src={p.image} alt="" className="h-24 rounded-lg border border-white/10" />}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={tx("Panduan diskusi", "Discussion guide", "دليل النقاش")}>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Field key={i} label={`${tx("Pertanyaan", "Question", "سؤال")} ${i + 1}`}>
                <LocInput value={q} onChange={v => patch({ discussion: { ...d.discussion, questions: questions.map((x, j) => (j === i ? v : x)) } })} />
              </Field>
            ))}
            <Field label={tx("Aksi keluarga", "Family action", "التحدي العائلي")}><LocInput area rows={2} value={d.discussion.action} onChange={action => patch({ discussion: { ...d.discussion, action } })} /></Field>
            <Field label={tx("Prompt refleksi", "Reflection prompt", "سؤال التأمل")}><LocInput area rows={2} value={d.discussion.reflection} onChange={reflection => patch({ discussion: { ...d.discussion, reflection } })} /></Field>
          </div>
        </Panel>

        <Panel key={rk} title={tx("Lapisan pengetahuan (PRD §23)", "Knowledge layer (PRD §23)", "طبقة المعرفة")}>
          <div className="grid md:grid-cols-3 gap-3">
            <Field label={tx("Fakta yang diizinkan (satu per baris)", "Allowed facts (one per line)", "الحقائق المسموحة")}><textarea rows={6} className={inp} defaultValue={lines(d.allowedFacts)} onBlur={e => patch({ allowedFacts: unlines(e.target.value) })} /></Field>
            <Field label={tx("Peristiwa penting", "Key events", "الأحداث الرئيسية")}><textarea rows={6} className={inp} defaultValue={lines(d.keyEvents)} onBlur={e => patch({ keyEvents: unlines(e.target.value) })} /></Field>
            <Field label={tx("Larangan pengarangan", "Prohibited invention", "الممنوعات")}><textarea rows={6} className={inp} defaultValue={lines(d.prohibitedInvention)} onBlur={e => patch({ prohibitedInvention: unlines(e.target.value) })} /></Field>
          </div>
          <Field label={tx("Sumber cerita", "Story sources", "مصادر القصة")} className="mt-3">
            <div className="flex flex-wrap gap-1">
              {SOURCES.map(s => (
                <Toggle key={s.id} on={d.sources.includes(s.id)} onClick={() => patch({ sources: d.sources.includes(s.id) ? d.sources.filter(x => x !== s.id) : [...d.sources, s.id] })}>
                  <span title={s.reference}>{s.id}</span>
                </Toggle>
              ))}
            </div>
          </Field>
        </Panel>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-20 self-start">
        <Panel title={tx("Simpan", "Save", "حفظ")}>
          <div className="space-y-3">
            <input className={inp} value={note} onChange={e => setNote(e.target.value)} placeholder={tx("Catatan perubahan", "Change note", "ملاحظة التغيير")} />
            <button className={btn.primary + " w-full"} disabled={!dirty} onClick={save}>{tx(`Simpan sebagai v${bumpVersion(story.version)}`, `Save as v${bumpVersion(story.version)}`, `حفظ كإصدار ${bumpVersion(story.version)}`)}</button>
            <button className={btn.ghost + " w-full"} disabled={!dirty} onClick={() => { setD(clone(story)); setRk(k => k + 1); }}>{tx("Buang perubahan", "Discard changes", "تجاهل التغييرات")}</button>
            {CANONICAL_STORIES.some(c => c.id === story.id) && state.storyOverrides[story.id] && (
              <button className={btn.small + " w-full"} onClick={resetToCanonical}>{tx("Reset ke kanonik bawaan", "Reset to shipped canonical", "إعادة للنص الأصلي")}</button>
            )}
            <p className="text-[11px] text-zinc-500">{tx("Menyimpan tidak mengubah status tata kelola. Riwayat belajar anak tetap terkait dengan versi yang mereka baca.", "Saving does not change governance state. Children's past learning stays linked to the version they read.", "الحفظ لا يغيّر حالة المراجعة.")}</p>
          </div>
        </Panel>

        <Panel title={tx("Riwayat versi", "Version history", "سجل الإصدارات")}>
          {!versions.length ? <p className="text-xs text-zinc-500">{tx("Belum ada versi tersimpan - saat ini adalah teks bawaan.", "No saved versions yet - current is the shipped text.", "لا توجد إصدارات محفوظة.")}</p> : (
            <table className="w-full">
              <thead><tr><th className={th}>v</th><th className={th}>{tx("Oleh / catatan", "By / note", "بواسطة")}</th><th className={th} /></tr></thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={i}>
                    <td className={td + " font-mono text-xs"}>{v.version}{v.version === story.version && <span className="block text-[9px] text-emerald-300">{tx("saat ini", "current", "الحالي")}</span>}</td>
                    <td className={td + " text-xs"}><div>{v.by}</div><div className="text-zinc-500">{v.note}</div><div className="text-[10px] font-mono text-zinc-600">{fmtDate(v.at)}</div></td>
                    <td className={td}>{v.version !== story.version && <button className={btn.small} onClick={() => restore(v.version)}>{tx("Pulihkan", "Restore", "استعادة")}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title={tx("Riwayat belajar per versi", "Learning history by version", "التعلم حسب الإصدار")}>
          {!learned.size ? <p className="text-xs text-zinc-500">{tx("Tidak ada peristiwa belajar untuk cerita ini di browser ini.", "No learning events for this story in this browser.", "لا توجد أحداث تعلم.")}</p> : (
            <ul className="space-y-1 text-xs">
              {[...learned.entries()].map(([v, n]) => (
                <li key={v} className="flex justify-between font-mono"><span>v{v}</span><span className="text-zinc-400">{n} {tx("peristiwa", "events", "أحداث")}</span></li>
              ))}
            </ul>
          )}
          <p className="text-[11px] text-zinc-500 mt-2">{tx("Peristiwa menyimpan versi cerita saat direkam.", "Events keep the storyVersion they were recorded with.", "تحتفظ الأحداث بإصدارها.")}</p>
        </Panel>
      </aside>
    </div>
  );
}

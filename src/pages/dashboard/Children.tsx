import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Plus, Shuffle, Trash2 } from "lucide-react";
import { Avatar, Modal, Panel, btn, input, label, toast } from "@/components/kit";
import { Paywall } from "@/components/Paywall";
import { track } from "@/lib/analytics";
import { maxChildren } from "@/lib/entitlements";
import { childStats, fmtDuration } from "@/lib/learning";
import { now, setState, uid, type AppState } from "@/store";
import type { ChildProfile, Lang, ReadingLevel } from "@/types";
import { SectionHeader, useDash } from "./shared";

type Draft = Omit<ChildProfile, "id" | "createdAt">;
const emptyDraft = (): Draft => ({ name: "", age: 6, readingLevel: "developing", language: "en", dailyGoalMin: 15, avatarSeed: Math.random().toString(36).slice(2, 8) });

/** Data minimisation (PRD §32): removes a child and everything linked to them. */
export function removeChild(s: AppState, id: string): AppState {
  const children = s.children.filter(c => c.id !== id);
  return {
    ...s,
    children,
    activeChildId: s.activeChildId === id ? children[0]?.id ?? null : s.activeChildId,
    events: s.events.filter(e => e.childId !== id),
    sessions: s.sessions.filter(x => x.childId !== id),
    achievements: s.achievements.filter(a => a.childId !== id),
    enrollments: s.enrollments.filter(e => e.childId !== id),
    certificates: s.certificates.filter(c => c.childId !== id),
  };
}

export function ChildForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void }) {
  const { tx } = useDash();
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD(x => ({ ...x, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = d.name.trim().split(/\s+/)[0];
    if (!name) return;
    onSave({ ...d, name });
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar seed={d.avatarSeed} size={64} />
        <button type="button" className={btn.small} onClick={() => set("avatarSeed", Math.random().toString(36).slice(2, 8))}><Shuffle className="w-3.5 h-3.5" />{tx("Avatar baru", "New avatar", "صورة جديدة")}</button>
      </div>
      <div>
        <label className={label}>{tx("Nama depan saja", "First name only", "الاسم الأول فقط")}</label>
        <input className={input} value={d.name} onChange={e => set("name", e.target.value)} maxLength={30} required autoFocus />
        <p className="text-[11px] text-zinc-500 mt-1">{tx("Kami hanya menyimpan nama depan - tanpa nama keluarga, foto, atau tanggal lahir.", "We only store a first name - no surnames, photos or birthdays.", "نحفظ الاسم الأول فقط - بدون اسم العائلة أو الصور أو تاريخ الميلاد.")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>{tx("Usia", "Age", "العمر")}</label>
          <select className={input} value={d.age} onChange={e => set("age", Number(e.target.value))}>
            {Array.from({ length: 9 }, (_, i) => i + 4).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>{tx("Tingkat membaca", "Reading level", "مستوى القراءة")}</label>
          <select className={input} value={d.readingLevel} onChange={e => set("readingLevel", e.target.value as ReadingLevel)}>
            <option value="early">{tx("Pembaca awal", "Early reader", "قارئ مبتدئ")}</option>
            <option value="developing">{tx("Pembaca berkembang", "Developing reader", "قارئ نامٍ")}</option>
            <option value="confident">{tx("Pembaca mahir", "Confident reader", "قارئ متمكن")}</option>
          </select>
        </div>
        <div>
          <label className={label}>{tx("Bahasa cerita", "Story language", "لغة القصص")}</label>
          <select className={input} value={d.language} onChange={e => set("language", e.target.value as Lang)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <div>
          <label className={label}>{tx("Target harian (menit)", "Daily goal (minutes)", "الهدف اليومي (دقائق)")}</label>
          <input type="number" min={5} max={60} step={5} className={input} value={d.dailyGoalMin} onChange={e => set("dailyGoalMin", Math.max(5, Math.min(60, Number(e.target.value) || 5)))} />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" className={btn.ghost} onClick={onCancel}>{tx("Batal", "Cancel", "إلغاء")}</button>
        <button className={btn.primary}>{tx("Simpan", "Save", "حفظ")}</button>
      </div>
    </form>
  );
}

export default function Children() {
  const { state, tx } = useDash();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState<ChildProfile | "new" | null>(null);
  const [deleting, setDeleting] = useState<ChildProfile | null>(null);
  const [paywall, setPaywall] = useState(false);
  const limit = maxChildren(state);

  const startAdd = () => {
    if (state.children.length >= limit) { setPaywall(true); return; }
    setEditing("new");
  };

  useEffect(() => {
    if (params.get("add")) { startAdd(); setParams({}, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const save = (d: Draft) => {
    if (editing === "new") {
      const id = uid("child");
      setState(s => ({ ...s, children: [...s.children, { ...d, id, createdAt: now() }], activeChildId: id }));
      track("child_created", { age: d.age });
      toast(tx(`Profil ${d.name} dibuat`, `${d.name}'s profile created`, `تم إنشاء ملف ${d.name}`));
    } else if (editing) {
      setState(s => ({ ...s, children: s.children.map(c => (c.id === editing.id ? { ...c, ...d } : c)) }));
      toast(tx("Profil diperbarui", "Profile updated", "تم تحديث الملف"));
    }
    setEditing(null);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setState(s => removeChild(s, deleting.id));
    toast(tx("Profil anak dan semua data terkait dihapus", "Child profile and all related data deleted", "تم حذف ملف الطفل وكل بياناته"));
    setDeleting(null);
  };

  const levelLabel = (l: ReadingLevel) => l === "early" ? tx("Awal", "Early", "مبتدئ") : l === "developing" ? tx("Berkembang", "Developing", "نامٍ") : tx("Mahir", "Confident", "متمكن");

  return (
    <div>
      <SectionHeader
        title={tx("Anak-anak", "Children", "الأطفال")}
        subtitle={tx(`${state.children.length} dari ${limit} profil di paketmu.`, `${state.children.length} of ${limit} profile${limit === 1 ? "" : "s"} on your plan.`, `${state.children.length} من ${limit} ملفات في خطتك.`)}
        action={<button className={btn.primary} onClick={startAdd}><Plus className="w-4 h-4" />{tx("Tambah anak", "Add child", "إضافة طفل")}</button>}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {state.children.map(c => {
          const st = childStats(state, c.id);
          return (
            <Panel key={c.id}>
              <div className="flex items-start gap-4">
                <Avatar seed={c.avatarSeed} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xl">{c.name}</span>
                    {state.activeChildId === c.id && <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-black">{tx("Aktif", "Active", "نشط")}</span>}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    {tx(`Usia ${c.age}`, `Age ${c.age}`, `العمر ${c.age}`)} · {levelLabel(c.readingLevel)} · {c.language === "ar" ? "العربية" : "English"} · {tx(`${c.dailyGoalMin} mnt/hari`, `${c.dailyGoalMin} min/day`, `${c.dailyGoalMin} د/يوم`)}
                  </div>
                  <div className="text-xs text-zinc-300 mt-3">
                    {tx(`${st.storiesCompleted} cerita · ${st.discussions} diskusi · ${fmtDuration(st.readingSeconds)} membaca · ${st.badges} lencana`, `${st.storiesCompleted} stories · ${st.discussions} discussions · ${fmtDuration(st.readingSeconds)} reading · ${st.badges} badges`, `${st.storiesCompleted} قصص · ${st.discussions} نقاشات · ${fmtDuration(st.readingSeconds)} قراءة · ${st.badges} شارات`)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {state.activeChildId !== c.id && <button className={btn.small} onClick={() => setState(s => ({ ...s, activeChildId: c.id }))}>{tx("Jadikan aktif", "Make active", "اجعله نشطاً")}</button>}
                <button className={btn.small} onClick={() => setEditing(c)}><Pencil className="w-3 h-3" />{tx("Edit", "Edit", "تعديل")}</button>
                <button className={btn.small + " hover:!text-rose-300"} onClick={() => setDeleting(c)}><Trash2 className="w-3 h-3" />{tx("Hapus", "Delete", "حذف")}</button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? tx("Tambah anak", "Add a child", "إضافة طفل") : tx("Edit profil", "Edit profile", "تعديل الملف")}>
        {editing && (
          <ChildForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? emptyDraft() : { name: editing.name, age: editing.age, readingLevel: editing.readingLevel, language: editing.language, dailyGoalMin: editing.dailyGoalMin, avatarSeed: editing.avatarSeed }}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={tx("Hapus profil ini?", "Delete this profile?", "حذف هذا الملف؟")}>
        <p className="text-sm text-zinc-300 mb-5">
          {tx(`Ini akan menghapus profil ${deleting?.name} secara permanen beserta sesi membaca, kegiatan belajar, refleksi, lencana, sertifikat, dan progres program. Tidak dapat dibatalkan.`,
            `This permanently deletes ${deleting?.name}'s profile together with their reading sessions, learning events, reflections, badges, certificates and program progress. This cannot be undone.`,
            `سيؤدي هذا إلى حذف ملف ${deleting?.name} نهائياً مع جلسات القراءة والأنشطة والتأملات والشارات والشهادات وتقدم البرامج. لا يمكن التراجع.`)}
        </p>
        <div className="flex gap-2 justify-end">
          <button className={btn.ghost} onClick={() => setDeleting(null)}>{tx("Simpan", "Keep", "إبقاء")}</button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm hover:bg-rose-400 cursor-pointer" onClick={confirmDelete}><Trash2 className="w-4 h-4" />{tx("Hapus permanen", "Delete permanently", "حذف نهائي")}</button>
        </div>
      </Modal>

      <Paywall open={paywall} onClose={() => setPaywall(false)} reason={tx("Menambah anak lain memerlukan paket keluarga - hingga 5 profil anak, masing-masing dengan perjalanannya sendiri.", "Adding another child needs a family plan - up to 5 child profiles, each with their own journey.", "إضافة طفل آخر تتطلب خطة عائلية - حتى ٥ ملفات أطفال لكل منهم رحلته.")} />
    </div>
  );
}

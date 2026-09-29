import { useEffect, useMemo, useState } from "react";
import { Maximize2, Trash2, X } from "lucide-react";
import { Empty, Panel, btn, toast } from "@/components/kit";
import { useLanguage } from "@/contexts/LanguageContext";
import { familyStories, findStory, loc } from "@/lib/content";
import { cn } from "@/lib/utils";
import { now, setState, uid, useStore } from "@/store";
import type { Classroom, Student } from "@/types";
import { Field, inp, pct, sel, td, th } from "../studio/shared";
import { classStats, daysLeft } from "./stats";

function updateClass(id: string, fn: (c: Classroom) => Classroom) {
  setState(s => ({ ...s, classrooms: s.classrooms.map(c => (c.id === id ? fn(c) : c)) }));
}

export default function ClassesTab() {
  const { tx } = useLanguage();
  const classrooms = useStore(s => s.classrooms);
  const [selId, setSelId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", teacher: "", school: "", pilot: true });
  const current = classrooms.find(c => c.id === selId) || classrooms[0];

  function create() {
    if (!form.name.trim() || !form.teacher.trim()) return toast(tx("Nama kelas dan guru wajib diisi", "Class name and teacher are required", "الاسم والمعلم مطلوبان"));
    const c: Classroom = {
      id: uid("cls"), name: form.name.trim(), teacher: form.teacher.trim(), school: form.school.trim(), createdAt: now(),
      students: [], assignments: [], pilotEndsAt: form.pilot ? new Date(Date.now() + 30 * 86400000).toISOString() : undefined,
    };
    setState(s => ({ ...s, classrooms: [...s.classrooms, c] }));
    setSelId(c.id);
    setForm({ name: "", teacher: "", school: "", pilot: true });
    toast(tx("Kelas dibuat", "Classroom created", "تم إنشاء الفصل"));
  }

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      <div className="space-y-5">
        <Panel title={tx("Kelas baru", "New classroom", "فصل جديد")}>
          <div className="space-y-2.5">
            <Field label={tx("Nama kelas", "Class name", "اسم الفصل")}><input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Grade 2 - Al-Fajr" /></Field>
            <Field label={tx("Guru", "Teacher", "المعلم")}><input className={inp} value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} /></Field>
            <Field label={tx("Sekolah", "School", "المدرسة")}><input className={inp} value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" checked={form.pilot} onChange={e => setForm({ ...form, pilot: e.target.checked })} />{tx("Mulai uji coba sekolah 30 hari", "Start 30-day school pilot", "بدء تجربة ٣٠ يوماً")}</label>
            <button className={btn.primary + " w-full"} onClick={create}>{tx("Buat kelas", "Create classroom", "إنشاء")}</button>
          </div>
        </Panel>
        <Panel title={tx("Kelas", "Classrooms", "الفصول")}>
          {!classrooms.length ? <p className="text-xs text-zinc-500">{tx("Belum ada kelas.", "No classrooms yet.", "لا توجد فصول.")}</p> : (
            <ul className="space-y-1 -mx-2">
              {classrooms.map(c => {
                const st = classStats(c);
                const dl = daysLeft(c.pilotEndsAt);
                return (
                  <li key={c.id}>
                    <button onClick={() => setSelId(c.id)} className={cn("w-full text-start px-3 py-2 rounded-xl cursor-pointer", c.id === current?.id ? "bg-white/10" : "hover:bg-white/5")}>
                      <div className="text-sm">{c.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{c.school || "-"} · {st.students} {tx("siswa", "students", "طلاب")} · {st.assignments} {tx("ditugaskan", "assigned", "مهام")}{dl !== null && ` · pilot ${dl}d`}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
      {current ? <ClassDetail key={current.id} c={current} /> : <Empty>{tx("Buat kelas untuk mulai menugaskan cerita.", "Create a classroom to start assigning stories.", "أنشئ فصلاً للبدء.")}</Empty>}
    </div>
  );
}

function ClassDetail({ c }: { c: Classroom }) {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const stories = useMemo(() => familyStories(state), [state]);
  const [stu, setStu] = useState({ name: "", age: 7 });
  const [asg, setAsg] = useState({ storyId: "", due: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), note: "" });
  const [projectId, setProjectId] = useState<string | null>(null);
  const st = classStats(c);
  const dl = daysLeft(c.pilotEndsAt);

  function addStudent() {
    if (!stu.name.trim()) return;
    const s: Student = { id: uid("stu"), name: stu.name.trim().split(/\s+/)[0], age: stu.age, completed: [], discussions: 0 };
    updateClass(c.id, x => ({ ...x, students: [...x.students, s] }));
    setStu({ name: "", age: stu.age });
  }
  function addAssignment() {
    if (!asg.storyId) return toast(tx("Pilih cerita", "Choose a story", "اختر قصة"));
    updateClass(c.id, x => ({ ...x, assignments: [...x.assignments, { id: uid("asg"), storyId: asg.storyId, due: asg.due, note: asg.note, createdAt: now() }] }));
    setAsg({ ...asg, storyId: "", note: "" });
  }
  const toggleDone = (sid: string, storyId: string) => updateClass(c.id, x => ({ ...x, students: x.students.map(s => s.id !== sid ? s : { ...s, completed: s.completed.includes(storyId) ? s.completed.filter(i => i !== storyId) : [...s.completed, storyId] }) }));
  const bumpDisc = (sid: string, d: number) => updateClass(c.id, x => ({ ...x, students: x.students.map(s => s.id !== sid ? s : { ...s, discussions: Math.max(0, s.discussions + d) }) }));

  const projected = projectId ? findStory(state, projectId) : undefined;

  return (
    <div className="space-y-5 min-w-0">
      <Panel title={c.name} action={<button className="text-zinc-500 hover:text-red-300 cursor-pointer" title={tx("Hapus kelas", "Delete classroom", "حذف الفصل")} onClick={() => { if (confirm(tx("Hapus kelas ini?", "Delete this classroom?", "حذف الفصل؟"))) setState(s => ({ ...s, classrooms: s.classrooms.filter(x => x.id !== c.id) })); }}><Trash2 className="w-4 h-4" /></button>}>
        <div className="text-xs text-zinc-400 mb-4">{c.teacher} · {c.school || "-"}{dl !== null && <span className="ms-2 text-amber-300">{tx("Uji coba", "Pilot", "تجربة")}: {dl} {tx("hari tersisa", "days left", "يوم متبقٍ")}</span>}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[[tx("Siswa", "Students", "الطلاب"), st.students], [tx("Tugas", "Assignments", "المهام"), st.assignments], [tx("Penyelesaian", "Completion", "الإكمال"), st.assignments && st.students ? pct(st.completionRate) : "-"], [tx("Diskusi", "Discussions", "النقاشات"), st.discussions]].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl border border-white/10 p-3"><div className="text-[10px] font-mono text-zinc-500">{k}</div><div className="text-xl">{v}</div></div>
          ))}
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-5">
        <Panel title={tx("Siswa", "Students", "الطلاب")}>
          <div className="flex gap-2 mb-3">
            <input className={inp} placeholder={tx("Nama depan saja", "First name only", "الاسم الأول فقط")} value={stu.name} onChange={e => setStu({ ...stu, name: e.target.value })} onKeyDown={e => e.key === "Enter" && addStudent()} />
            <select className={sel} value={stu.age} onChange={e => setStu({ ...stu, age: +e.target.value })}>{Array.from({ length: 9 }, (_, i) => i + 4).map(a => <option key={a}>{a}</option>)}</select>
            <button className={btn.small} onClick={addStudent}>+</button>
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">{tx("Minimalisasi data: hanya nama depan dan usia.", "Data minimisation: first name and age only.", "أقل قدر من البيانات: الاسم الأول والعمر فقط.")}</p>
          <ul className="space-y-1">
            {c.students.map(s => (
              <li key={s.id} className="flex items-center justify-between text-sm border-b border-white/5 py-1">
                <span>{s.name} <span className="text-[10px] font-mono text-zinc-500">({s.age})</span></span>
                <button className="text-zinc-600 hover:text-red-300 cursor-pointer" onClick={() => updateClass(c.id, x => ({ ...x, students: x.students.filter(y => y.id !== s.id) }))}><X className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={tx("Cerita yang ditugaskan", "Assigned stories", "القصص المعيّنة")}>
          <div className="space-y-2 mb-3">
            <select className={sel + " w-full"} value={asg.storyId} onChange={e => setAsg({ ...asg, storyId: e.target.value })}>
              <option value="">{tx("Pilih cerita…", "Choose a story…", "اختر قصة…")}</option>
              {stories.map(s => <option key={s.id} value={s.id}>{loc(s.title, language)}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="date" className={inp} value={asg.due} onChange={e => setAsg({ ...asg, due: e.target.value })} />
              <input className={inp} placeholder={tx("Catatan", "Note", "ملاحظة")} value={asg.note} onChange={e => setAsg({ ...asg, note: e.target.value })} />
              <button className={btn.small} onClick={addAssignment}>{tx("Tugaskan", "Assign", "تعيين")}</button>
            </div>
          </div>
          <ul className="space-y-1">
            {c.assignments.map(a => {
              const s = findStory(state, a.storyId);
              return (
                <li key={a.id} className="flex items-center gap-2 text-sm border-b border-white/5 py-1.5">
                  <div className="flex-1 min-w-0"><div className="truncate">{s ? loc(s.title, language) : a.storyId}</div><div className="text-[10px] font-mono text-zinc-500">{tx("tenggat", "due", "الموعد")} {a.due}{a.note && ` · ${a.note}`}</div></div>
                  <button className={btn.small} onClick={() => setProjectId(a.storyId)} title={tx("Mode diskusi kelas", "Class discussion mode", "وضع النقاش")}><Maximize2 className="w-3 h-3" />{tx("Diskusi", "Discuss", "ناقش")}</button>
                  <button className="text-zinc-600 hover:text-red-300 cursor-pointer" onClick={() => updateClass(c.id, x => ({ ...x, assignments: x.assignments.filter(y => y.id !== a.id) }))}><X className="w-3.5 h-3.5" /></button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title={tx("Kemajuan kelas", "Class progress", "تقدم الفصل")}>
        {!c.students.length || !c.assignments.length ? <p className="text-xs text-zinc-500">{tx("Tambahkan siswa dan tugaskan cerita untuk melacak kemajuan.", "Add students and assign stories to track progress.", "أضف طلاباً ومهام.")}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>{tx("Siswa", "Student", "الطالب")}</th>
                  {c.assignments.map(a => <th key={a.id} className={th + " max-w-[120px] truncate"} title={findStory(state, a.storyId)?.title.en}>{(findStory(state, a.storyId)?.title.en || a.storyId).slice(0, 18)}</th>)}
                  <th className={th}>{tx("Diskusi", "Discussions", "النقاشات")}</th>
                  <th className={th}>%</th>
                </tr>
              </thead>
              <tbody>
                {c.students.map(s => {
                  const n = c.assignments.filter(a => s.completed.includes(a.storyId)).length;
                  return (
                    <tr key={s.id}>
                      <td className={td}>{s.name}</td>
                      {c.assignments.map(a => (
                        <td key={a.id} className={td}><input type="checkbox" aria-label={`${s.name} completed`} checked={s.completed.includes(a.storyId)} onChange={() => toggleDone(s.id, a.storyId)} /></td>
                      ))}
                      <td className={td}>
                        <span className="inline-flex items-center gap-1.5">
                          <button className={btn.small + " !px-2 !py-0.5"} onClick={() => bumpDisc(s.id, -1)}>−</button>
                          <span className="font-mono w-5 text-center">{s.discussions}</span>
                          <button className={btn.small + " !px-2 !py-0.5"} onClick={() => bumpDisc(s.id, 1)}>+</button>
                        </span>
                      </td>
                      <td className={td + " font-mono text-xs"}>{pct(n / c.assignments.length)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {projected && <DiscussionProjector story={projected} onClose={() => setProjectId(null)} />}
    </div>
  );
}

function DiscussionProjector({ story, onClose }: { story: NonNullable<ReturnType<typeof findStory>>; onClose: () => void }) {
  const { tx, language } = useLanguage();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[250] bg-[#0a0a0c] overflow-y-auto p-8 sm:p-14" role="dialog" aria-modal>
      <button onClick={onClose} className="fixed top-6 end-6 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10" aria-label="Close"><X className="w-5 h-5" /></button>
      <div className="max-w-5xl mx-auto">
        <div className="text-sm font-mono text-zinc-500 mb-3">{tx("Diskusi kelas", "Class discussion", "نقاش الفصل")}</div>
        <h1 className="font-heading text-4xl sm:text-6xl mb-12 leading-tight">{loc(story.title, language)}</h1>
        <ol className="space-y-10 mb-14">
          {story.discussion.questions.map((q, i) => (
            <li key={i} className="flex gap-6 items-start">
              <span className="text-4xl sm:text-5xl font-light text-zinc-600 w-12 shrink-0">{i + 1}</span>
              <span className="text-2xl sm:text-4xl leading-snug">{loc(q, language)}</span>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-8">
          <div className="text-sm font-mono text-emerald-300 mb-2">{tx("Tantangan aksi kelas", "Class action challenge", "تحدي الفصل")}</div>
          <div className="text-2xl sm:text-3xl leading-snug">{loc(story.discussion.action, language)}</div>
        </div>
      </div>
    </div>
  );
}

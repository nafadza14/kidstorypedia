import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, KeyRound, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { Modal, Panel, btn, input, label, toast } from "@/components/kit";
import { PinGate, hashPin } from "@/components/PinGate";
import { getState, resetAll, setState } from "@/store";
import type { Settings } from "@/types";
import { removeChild } from "./Children";
import { SectionHeader, Toggle, fmtDate, useDash } from "./shared";

/** Unlocked once per page visit (module scope survives section switches, not reloads). */
let unlockedThisVisit = false;

const danger = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-rose-500 text-white text-sm hover:bg-rose-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

export default function SettingsSection() {
  const { state, language, tx } = useDash();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(unlockedThisVisit || !state.settings.pin);
  const [gate, setGate] = useState(false);
  const [name, setName] = useState(state.parent?.name || "");
  const [email, setEmail] = useState(state.parent?.email || "");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [delChild, setDelChild] = useState("");
  const [confirmChild, setConfirmChild] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [wipeText, setWipeText] = useState("");
  const st = state.settings;

  if (!unlocked) {
    return (
      <div>
        <SectionHeader title={tx("Settings", "الإعدادات")} />
        <Panel>
          <div className="text-center py-8">
            <Lock className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
            <p className="text-sm text-zinc-300 mb-4">{tx("Settings are protected by your parent PIN.", "الإعدادات محمية بالرقم السري للوالدين.")}</p>
            <button className={btn.primary} onClick={() => setGate(true)}>{tx("Unlock settings", "فتح الإعدادات")}</button>
          </div>
        </Panel>
        <PinGate open={gate} onClose={() => setGate(false)} onPass={() => { unlockedThisVisit = true; setUnlocked(true); setGate(false); }} />
      </div>
    );
  }

  const patch = (p: Partial<Settings>) => setState(s => ({ ...s, settings: { ...s.settings, ...p } }));

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.parent) return;
    setState(s => ({ ...s, parent: s.parent ? { ...s.parent, name: name.trim() || s.parent.name, email: email.trim() || s.parent.email } : s.parent }));
    toast(tx("Profile saved", "تم حفظ الملف"));
  };

  const savePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) { toast(tx("PIN must be 4–6 digits", "يجب أن يكون الرقم السري ٤–٦ أرقام")); return; }
    if (pin !== pin2) { toast(tx("PINs don't match", "الرقمان غير متطابقين")); return; }
    patch({ pin: hashPin(pin) });
    unlockedThisVisit = true;
    setPin(""); setPin2("");
    toast(tx("Parent PIN set", "تم تعيين الرقم السري"));
  };

  const exportData = () => {
    const data = getState();
    const { aiCache: _cache, ...rest } = data;
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...rest, settings: { ...rest.settings, pin: rest.settings.pin ? "[set]" : undefined } }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kidstorypedia-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(tx("Export downloaded", "تم تنزيل البيانات"));
  };

  const childToDelete = state.children.find(c => c.id === delChild);

  return (
    <div className="space-y-5">
      <SectionHeader title={tx("Settings", "الإعدادات")} subtitle={tx("Account, parental controls and privacy.", "الحساب والرقابة الأبوية والخصوصية.")} />

      <Panel title={tx("Parent profile", "ملف الوالدين")}>
        <form onSubmit={saveProfile} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div><label className={label}>{tx("Name", "الاسم")}</label><input className={input} value={name} onChange={e => setName(e.target.value)} maxLength={40} /></div>
          <div><label className={label}>{tx("Email", "البريد الإلكتروني")}</label><input type="email" className={input} value={email} onChange={e => setEmail(e.target.value)} /></div>
          <button className={btn.primary}>{tx("Save", "حفظ")}</button>
        </form>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title={tx("Parental controls", "الرقابة الأبوية")}>
          <div className="pb-3 border-b border-white/5">
            <label className={label}>{tx("Daily screen limit (minutes, 0 = off)", "حد الشاشة اليومي (دقائق، ٠ = بدون)")}</label>
            <input type="number" min={0} max={240} step={5} className={input} value={st.dailyScreenLimitMin} onChange={e => patch({ dailyScreenLimitMin: Math.max(0, Math.min(240, Number(e.target.value) || 0)) })} />
          </div>
          <Toggle label={tx("Audio narration", "السرد الصوتي")} checked={st.audioNarration} onChange={v => patch({ audioNarration: v })} />
          <Toggle label={tx("Arabic tashkeel (diacritics)", "التشكيل العربي")} checked={st.tashkeel} onChange={v => patch({ tashkeel: v })} />
          <Toggle label={tx("Read-aloud word highlight", "تظليل الكلمات أثناء القراءة")} checked={st.readAloudHighlight} onChange={v => patch({ readAloudHighlight: v })} />
          <Toggle label={tx("Bedtime reminder", "تذكير وقت النوم")} checked={st.bedtimeReminder} onChange={v => patch({ bedtimeReminder: v })} />
          {st.bedtimeReminder && (
            <div className="py-3 border-b border-white/5">
              <label className={label}>{tx("Reminder time", "وقت التذكير")}</label>
              <input type="time" className={input} value={st.reminderTime} onChange={e => patch({ reminderTime: e.target.value })} />
            </div>
          )}
          <Toggle label={tx("Weekly family digest", "الملخص العائلي الأسبوعي")} checked={st.weeklyDigest} onChange={v => patch({ weeklyDigest: v })} />
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><KeyRound className="w-4 h-4" />{tx("Parent PIN", "الرقم السري للوالدين")}</span>}>
          <p className="text-xs text-zinc-400 mb-4">
            {st.pin
              ? tx("A PIN is set. It's needed to leave the kids view and to change settings.", "تم تعيين رقم سري. يلزم لمغادرة واجهة الأطفال وتغيير الإعدادات.")
              : tx("No PIN set — a simple maths question guards the parent area. Set a PIN for stronger protection.", "لا يوجد رقم سري — سؤال حسابي بسيط يحمي منطقة الوالدين. عيّن رقماً سرياً لحماية أقوى.")}
          </p>
          <form onSubmit={savePin} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>{st.pin ? tx("New PIN", "رقم سري جديد") : tx("PIN (4–6 digits)", "رقم سري (٤–٦ أرقام)")}</label><input type="password" inputMode="numeric" autoComplete="new-password" className={input} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
              <div><label className={label}>{tx("Confirm", "تأكيد")}</label><input type="password" inputMode="numeric" autoComplete="new-password" className={input} value={pin2} onChange={e => setPin2(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
            </div>
            <div className="flex gap-2">
              <button className={btn.primary} disabled={!pin}>{st.pin ? tx("Change PIN", "تغيير الرقم") : tx("Set PIN", "تعيين الرقم")}</button>
              {st.pin && <button type="button" className={btn.ghost} onClick={() => { patch({ pin: undefined }); toast(tx("PIN removed", "تمت إزالة الرقم السري")); }}>{tx("Remove PIN", "إزالة الرقم")}</button>}
            </div>
          </form>
        </Panel>
      </div>

      <Panel title={<span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" />{tx("Privacy & data", "الخصوصية والبيانات")}</span>}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm text-zinc-300">
              {tx("Parental consent given:", "تاريخ موافقة الوالدين:")} <span className="font-mono text-zinc-400">{state.parent?.consentAt ? `${fmtDate(state.parent.consentAt, language)} ${new Date(state.parent.consentAt).toLocaleTimeString()}` : tx("not recorded", "غير مسجل")}</span>
            </div>
            <div>
              <label className={label}>{tx("Keep learning history for", "الاحتفاظ بسجل التعلم لمدة")}</label>
              <select className={input} value={st.dataRetentionMonths} onChange={e => patch({ dataRetentionMonths: Number(e.target.value) })}>
                {[6, 12, 24, 36].map(m => <option key={m} value={m}>{tx(`${m} months`, `${m} شهراً`)}</option>)}
              </select>
            </div>
            <p className="text-xs text-zinc-500">{tx("No ads, no behavioural tracking, first names only. Data is stored on this device.", "بلا إعلانات ولا تتبع سلوكي، والأسماء الأولى فقط. تُحفظ البيانات على هذا الجهاز.")} <Link to="/privacy" className="underline">{tx("Privacy policy", "سياسة الخصوصية")}</Link></p>
            <button className={btn.ghost} onClick={exportData}><Download className="w-4 h-4" />{tx("Export all data (JSON)", "تصدير كل البيانات (JSON)")}</button>
          </div>
          <div className="space-y-4">
            <div>
              <label className={label}>{tx("Delete a child's profile and data", "حذف ملف طفل وبياناته")}</label>
              <div className="flex gap-2">
                <select className={input} value={delChild} onChange={e => setDelChild(e.target.value)}>
                  <option value="">{tx("Choose a child…", "اختر طفلاً…")}</option>
                  {state.children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className={btn.ghost} disabled={!delChild} onClick={() => setConfirmChild(true)}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <label className={label}>{tx("Delete everything", "حذف كل شيء")}</label>
              <button className={danger} onClick={() => setWipe(true)}><Trash2 className="w-4 h-4" />{tx("Delete all family data", "حذف كل بيانات العائلة")}</button>
            </div>
          </div>
        </div>
      </Panel>

      <Modal open={confirmChild && !!childToDelete} onClose={() => setConfirmChild(false)} title={tx("Delete this child's data?", "حذف بيانات هذا الطفل؟")}>
        <p className="text-sm text-zinc-300 mb-5">{tx(`All of ${childToDelete?.name}'s reading sessions, learning events, reflections, badges, certificates and program progress will be permanently deleted.`, `سيتم حذف كل جلسات القراءة والأنشطة والتأملات والشارات والشهادات وتقدم البرامج الخاصة بـ${childToDelete?.name} نهائياً.`)}</p>
        <div className="flex justify-end gap-2">
          <button className={btn.ghost} onClick={() => setConfirmChild(false)}>{tx("Cancel", "إلغاء")}</button>
          <button className={danger} onClick={() => { setState(s => removeChild(s, delChild)); setDelChild(""); setConfirmChild(false); toast(tx("Child data deleted", "تم حذف بيانات الطفل")); }}>{tx("Delete permanently", "حذف نهائي")}</button>
        </div>
      </Modal>

      <Modal open={wipe} onClose={() => { setWipe(false); setWipeText(""); }} title={tx("Delete all family data?", "حذف كل بيانات العائلة؟")}>
        <p className="text-sm text-zinc-300 mb-3">{tx("This removes the parent account, every child profile, all learning history, purchases and settings from this device. It cannot be undone. Consider exporting first.", "سيؤدي هذا إلى حذف حساب الوالدين وكل ملفات الأطفال وسجل التعلم والمشتريات والإعدادات من هذا الجهاز. لا يمكن التراجع. فكّر في التصدير أولاً.")}</p>
        <label className={label}>{tx('Type "DELETE" to confirm', 'اكتب "DELETE" للتأكيد')}</label>
        <input className={input + " mb-4"} value={wipeText} onChange={e => setWipeText(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className={btn.ghost} onClick={() => { setWipe(false); setWipeText(""); }}>{tx("Cancel", "إلغاء")}</button>
          <button className={danger} disabled={wipeText !== "DELETE"} onClick={() => { unlockedThisVisit = false; resetAll(); navigate("/"); }}>{tx("Delete everything", "حذف كل شيء")}</button>
        </div>
      </Modal>
    </div>
  );
}

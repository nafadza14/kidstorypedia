import React, { useState } from "react";
import { CheckCircle2, Clock, Copy, Gift, Mail, UserPlus } from "lucide-react";
import { Empty, Panel, Stat, btn, input, toast } from "@/components/kit";
import { CONFIG } from "@/config";
import { markReferralConverted, sendReferral } from "@/lib/billing";
import { SectionHeader, copyText, fmtDate, useDash } from "./shared";

export default function Referral() {
  const { state, language, tx } = useDash();
  const ref = state.referral;
  const link = `${window.location.origin}/join?ref=${ref.code}`;
  const [email, setEmail] = useState("");
  const converted = ref.invited.filter(i => i.converted).length;

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast(tx("Masukkan email yang valid", "Please enter a valid email", "أدخل بريداً صحيحاً")); return; }
    if (ref.invited.some(i => i.email === v)) { toast(tx("Sudah diundang", "Already invited", "تمت دعوته مسبقاً")); return; }
    sendReferral(v);
    setEmail("");
    toast(tx("Undangan tercatat", "Invitation recorded", "تم تسجيل الدعوة"));
  };

  const shareMsg = tx(
    `Kami sudah menggunakan Kidstorypedia untuk cerita Islami sebelum tidur dan diskusi keluarga. Bergabunglah lewat tautan saya dan kita berdua mendapat ${CONFIG.referralBonusDays} hari tambahan: ${link}`,
    `We've been using Kidstorypedia for bedtime Islamic stories and family discussions. Join with my link and we both get ${CONFIG.referralBonusDays} extra days: ${link}`,
    `نستخدم كيدستوريبيديا لقصص ما قبل النوم والنقاشات العائلية. انضم عبر رابطي ونحصل كلانا على ${CONFIG.referralBonusDays} أيام إضافية: ${link}`,
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title={tx(`Beri ${CONFIG.referralBonusDays} hari. Dapatkan ${CONFIG.referralBonusDays} hari.`, `Give ${CONFIG.referralBonusDays} days. Get ${CONFIG.referralBonusDays} days.`, `أهدِ ${CONFIG.referralBonusDays} أيام، واحصل على ${CONFIG.referralBonusDays} أيام.`)}
        subtitle={tx("Undang keluarga lain. Saat mereka bergabung, kedua keluarga mendapat hari premium tambahan.", "Invite another family. When they join, both families get extra premium days.", "ادعُ عائلة أخرى. عند انضمامها تحصل العائلتان على أيام مميزة إضافية.")}
      />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label={tx("Diundang", "Invited", "المدعوون")} value={ref.invited.length} />
        <Stat label={tx("Bergabung", "Joined", "انضموا")} value={converted} />
        <Stat label={tx("Hari bonus diperoleh", "Bonus days earned", "أيام إضافية مكتسبة")} value={ref.bonusDays} sub={ref.redeemedFrom ? tx(`Termasuk hari dari kode ${ref.redeemedFrom}`, `Includes days from code ${ref.redeemedFrom}`, `يشمل أياماً من الرمز ${ref.redeemedFrom}`) : undefined} />
      </div>

      <Panel title={<span className="flex items-center gap-2"><Gift className="w-4 h-4" />{tx("Tautan referral Anda", "Your referral link", "رابط الدعوة الخاص بك")}</span>}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-mono text-zinc-400">{tx("Kode", "Code", "الرمز")}</span>
          <span className="font-mono text-xl tracking-[0.2em]">{ref.code}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className={input + " font-mono text-xs"} value={link} readOnly onFocus={e => e.currentTarget.select()} aria-label={tx("Tautan referral", "Referral link", "رابط الدعوة")} />
          <button className={btn.primary} onClick={() => copyText(link, tx("Tautan disalin", "Link copied", "تم نسخ الرابط"))}><Copy className="w-4 h-4" />{tx("Salin", "Copy", "نسخ")}</button>
          <button className={btn.ghost} onClick={() => copyText(shareMsg, tx("Pesan disalin", "Message copied", "تم نسخ الرسالة"))}>{tx("Salin pesan", "Copy message", "نسخ الرسالة")}</button>
        </div>
      </Panel>

      <Panel title={<span className="flex items-center gap-2"><Mail className="w-4 h-4" />{tx("Undang lewat email", "Invite by email", "دعوة بالبريد")}</span>}>
        <form onSubmit={invite} className="flex flex-col sm:flex-row gap-2 mb-4">
          <input type="email" className={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@example.com" />
          <button className={btn.primary}><UserPlus className="w-4 h-4" />{tx("Undang", "Invite", "دعوة")}</button>
        </form>
        <p className="text-[11px] text-zinc-500 mb-4">{tx("Undangan dicatat di sini; pengiriman email memerlukan layanan email backend. Anda juga bisa menyalin pesan di atas.", "Invitations are recorded here; sending the email itself needs a backend mail service. You can also copy the message above.", "تُسجل الدعوات هنا؛ إرسال البريد نفسه يتطلب خادم بريد. يمكنك أيضاً نسخ الرسالة أعلاه.")}</p>
        {!ref.invited.length ? <Empty>{tx("Belum ada undangan.", "No invitations yet.", "لا دعوات بعد.")}</Empty> : (
          <ul className="divide-y divide-white/5">
            {ref.invited.map(i => (
              <li key={i.email} className="py-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex-1 min-w-0 truncate">{i.email}</span>
                <span className="text-[11px] text-zinc-500">{fmtDate(i.at, language)}</span>
                {i.converted ? (
                  <span className="text-[11px] text-emerald-300 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{tx(`Bergabung · +${CONFIG.referralBonusDays} hari`, `Joined · +${CONFIG.referralBonusDays} days`, `انضم · +${CONFIG.referralBonusDays} أيام`)}</span>
                ) : (
                  <>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{tx("Menunggu", "Pending", "قيد الانتظار")}</span>
                    <button className={btn.small} onClick={() => { markReferralConverted(i.email); toast(tx(`+${CONFIG.referralBonusDays} hari bonus`, `+${CONFIG.referralBonusDays} bonus days`, `+${CONFIG.referralBonusDays} أيام إضافية`)); }}>{tx("Simulasi teman bergabung (demo)", "Simulate friend joined (demo)", "محاكاة انضمام صديق (تجريبي)")}</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

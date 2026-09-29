import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Empty, Modal, Panel, btn, input, toast } from "@/components/kit";
import { CONFIG } from "@/config";
import { PLANS, PROGRAMS } from "@/data/catalog";
import { cancelSubscription, checkout, pauseSubscription, resumeSubscription, startTrial, switchPlan } from "@/lib/billing";
import { loc } from "@/lib/content";
import { isPremium, trialDaysLeft } from "@/lib/entitlements";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/types";
import { Pill, SectionHeader, fmtDate, useDash } from "./shared";

type CancelStep = "closed" | "why" | "offer";

export default function Billing() {
  const { state, language, tx } = useDash();
  const sub = state.subscription;
  const plan = PLANS.find(p => p.id === sub.plan)!;
  const premium = isPremium(state);
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [step, setStep] = useState<CancelStep>("closed");
  const [why, setWhy] = useState("");

  const buy = async (id: PlanId) => {
    setBusy(id);
    const r = await checkout(id);
    setBusy(null);
    toast(r.message);
  };

  const statusLabel: Record<typeof sub.status, string> = {
    active: tx("Active", "نشط"),
    trialing: tx(`Free trial · ${trialDaysLeft(state)} days left`, `تجربة مجانية · ${trialDaysLeft(state)} يوم متبقٍ`),
    paused: tx("Paused", "متوقف مؤقتاً"),
    cancelled: tx("Cancelled", "ملغى"),
    none: tx("Free", "مجاني"),
  };

  const closeCancel = () => { setStep("closed"); setWhy(""); };
  const doPause = () => { pauseSubscription(30); toast(tx("Subscription paused for 30 days", "تم إيقاف الاشتراك ٣٠ يوماً")); closeCancel(); };
  const doAnnual = async () => { closeCancel(); setBusy("premium_annual"); const r = await switchPlan("premium_annual"); setBusy(null); toast(r.message); };
  const doFamily = async () => { closeCancel(); setBusy("family_plus"); const r = await switchPlan("family_plus"); setBusy(null); toast(r.message); };
  const doCancel = () => { cancelSubscription(why.trim() || "not given"); toast(tx("Subscription cancelled. You keep access until the end of the period.", "أُلغي الاشتراك. يبقى الوصول حتى نهاية الفترة.")); closeCancel(); };

  const canCancel = sub.plan !== "free" && (sub.status === "active" || sub.status === "trialing");
  const canResume = sub.plan !== "free" && (sub.status === "paused" || sub.status === "cancelled");
  const annual = PLANS.find(p => p.id === "premium_annual")!;
  const suggestedProgram = PROGRAMS[0];

  return (
    <div className="space-y-5">
      <SectionHeader title={tx("Subscription", "الاشتراك")} subtitle={tx("Clear pricing, cancel any time — no dark patterns.", "أسعار واضحة، وإلغاء في أي وقت — بلا حيل.")} />

      <Panel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-zinc-400 mb-1">{tx("Current plan", "الخطة الحالية")}</div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl">{loc(plan.name, language)}</span>
              <Pill tone={premium ? "emerald" : sub.status === "paused" || sub.status === "cancelled" ? "amber" : "default"}>{statusLabel[sub.status]}</Pill>
            </div>
            <div className="text-xs text-zinc-400 mt-1 space-y-0.5">
              {sub.renewsAt && sub.status === "active" && <p>{tx("Renews", "يتجدد")} {fmtDate(sub.renewsAt, language)}</p>}
              {sub.renewsAt && sub.status === "cancelled" && <p>{tx("Access until", "الوصول حتى")} {fmtDate(sub.renewsAt, language)}</p>}
              {sub.pausedUntil && sub.status === "paused" && <p>{tx("Paused until", "متوقف حتى")} {fmtDate(sub.pausedUntil, language)}</p>}
              {sub.status === "trialing" && <p>{tx("Trial ends", "تنتهي التجربة")} {fmtDate(sub.trialEndsAt, language)}</p>}
              {state.referral.bonusDays > 0 && <p>{tx(`Includes ${state.referral.bonusDays} referral bonus days`, `يشمل ${state.referral.bonusDays} يوماً إضافياً من الدعوات`)}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canResume && <button className={btn.primary} onClick={() => { resumeSubscription(); toast(tx("Subscription resumed", "تم استئناف الاشتراك")); }}>{tx("Resume subscription", "استئناف الاشتراك")}</button>}
            {!sub.trialEndsAt && sub.plan === "free" && <button className={btn.primary} onClick={() => startTrial() && toast(tx("Free trial started", "بدأت التجربة المجانية"))}><Sparkles className="w-4 h-4" />{tx(`Start ${CONFIG.trialDays}-day free trial`, `ابدأ تجربة ${CONFIG.trialDays} أيام`)}</button>}
            {canCancel && <button className={btn.ghost} onClick={() => setStep("why")}>{tx("Cancel subscription", "إلغاء الاشتراك")}</button>}
          </div>
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map(p => {
          const current = p.id === sub.plan && (premium || p.id === "free");
          return (
            <div key={p.id} className={cn("rounded-2xl border p-5 flex flex-col", current ? "border-emerald-400/50 bg-emerald-400/5" : p.highlight ? "border-white/40 bg-white/5" : "border-white/10")}>
              <div className="font-heading text-lg">{loc(p.name, language)}</div>
              <div className="text-2xl font-light my-1">{p.priceUsd ? `$${p.priceUsd}` : tx("Free", "مجاني")}{p.period !== "forever" && <span className="text-sm text-zinc-400">/{p.period === "month" ? tx("mo", "شهر") : tx("yr", "سنة")}</span>}</div>
              <div className="text-xs text-zinc-400 mb-3">{loc(p.tagline, language)}</div>
              <ul className="space-y-1.5 text-xs text-zinc-300 flex-1 mb-4">
                {p.features.map((f, i) => <li key={i} className="flex gap-2"><Check className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />{loc(f, language)}</li>)}
              </ul>
              {current ? <span className="text-xs text-emerald-300 text-center py-2">{tx("Your plan", "خطتك")}</span>
                : p.id === "free" ? <span className="text-xs text-zinc-500 text-center py-2">{tx("Always available", "متاحة دائماً")}</span>
                  : <button className={p.highlight ? btn.primary : btn.ghost} disabled={!!busy} onClick={() => buy(p.id)}>{busy === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : tx("Choose", "اختر")}</button>}
            </div>
          );
        })}
      </div>
      {CONFIG.paymentsDemoMode && <p className="text-[11px] text-zinc-500">{tx("Demo mode: no card is charged.", "وضع تجريبي: لا يتم خصم أي مبلغ.")}</p>}

      <Panel title={tx("Payment history", "سجل المدفوعات")}>
        {!state.payments.length ? <Empty>{tx("No payments yet.", "لا مدفوعات بعد.")}</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-start text-[11px] font-mono text-zinc-500"><th className="text-start py-2">{tx("Date", "التاريخ")}</th><th className="text-start">{tx("Item", "البند")}</th><th className="text-start">{tx("Type", "النوع")}</th><th className="text-end">{tx("Amount", "المبلغ")}</th></tr></thead>
              <tbody>
                {state.payments.slice().reverse().map(p => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="py-2 text-zinc-400">{fmtDate(p.at, language)}</td>
                    <td>{p.description}{p.ref === "DEMO" && <span className="text-[10px] text-zinc-500 ms-2">DEMO</span>}</td>
                    <td className="text-zinc-400">{p.kind === "pack" ? tx("Pack", "حزمة") : tx("Subscription", "اشتراك")}</td>
                    <td className="text-end">${p.amountUsd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={step !== "closed"} onClose={closeCancel} title={step === "why" ? tx("Before you go", "قبل أن تغادر") : tx("A few options", "بعض الخيارات")}>
        {step === "why" ? (
          <div className="space-y-4">
            <label className="block text-sm text-zinc-300" htmlFor="cancel-why">{tx("What were you hoping Kidstorypedia would help your family achieve?", "ما الذي كنت تأمل أن تساعد كيدستوريبيديا عائلتك على تحقيقه؟")}</label>
            <textarea id="cancel-why" className={input + " min-h-[100px]"} value={why} onChange={e => setWhy(e.target.value)} maxLength={500} placeholder={tx("Optional — it helps us improve.", "اختياري — يساعدنا على التحسين.")} />
            <div className="flex justify-end gap-2">
              <button className={btn.ghost} onClick={closeCancel}>{tx("Keep my plan", "إبقاء خطتي")}</button>
              <button className={btn.primary} onClick={() => setStep("offer")}>{tx("Continue", "متابعة")}</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{tx("If one of these fits better, great. If not, cancelling is one click below.", "إن كان أحد هذه الخيارات أنسب فرائع. وإلا فالإلغاء بنقرة واحدة أدناه.")}</p>
            {sub.plan === "premium_monthly" && (
              <button onClick={doAnnual} className="w-full text-start rounded-2xl border border-white/10 p-4 hover:border-white/30 cursor-pointer">
                <div className="text-sm font-medium">{tx("Switch to annual", "التحويل إلى السنوي")}</div>
                <div className="text-xs text-zinc-400">{tx(`$${annual.priceUsd}/year — about 28% less than monthly.`, `$${annual.priceUsd} سنوياً — أقل بنحو ٢٨٪ من الشهري.`)}</div>
              </button>
            )}
            <button onClick={doPause} className="w-full text-start rounded-2xl border border-white/10 p-4 hover:border-white/30 cursor-pointer">
              <div className="text-sm font-medium">{tx("Pause for 30 days", "إيقاف مؤقت ٣٠ يوماً")}</div>
              <div className="text-xs text-zinc-400">{tx("Busy month? Keep your children's journals and pick up later.", "شهر مزدحم؟ احتفظ بدفاتر أطفالك وتابع لاحقاً.")}</div>
            </button>
            {sub.plan !== "family_plus" && (
              <button onClick={doFamily} className="w-full text-start rounded-2xl border border-white/10 p-4 hover:border-white/30 cursor-pointer">
                <div className="text-sm font-medium">{tx("Family+ plan", "خطة العائلة+")}</div>
                <div className="text-xs text-zinc-400">{tx("For homeschooling families: learning plan and printable packs.", "لعائلات التعليم المنزلي: خطة تعلم وحزم للطباعة.")}</div>
              </button>
            )}
            <Link to="/dashboard/programs" onClick={closeCancel} className="block rounded-2xl border border-white/10 p-4 hover:border-white/30">
              <div className="text-sm font-medium">{tx(`Try "${suggestedProgram.name.en}"`, `جرّب «${loc(suggestedProgram.name, "ar")}»`)}</div>
              <div className="text-xs text-zinc-400">{loc(suggestedProgram.description, language)}</div>
            </Link>
            <div className="flex justify-between items-center pt-3">
              <button className={btn.ghost} onClick={closeCancel}>{tx("Keep my plan", "إبقاء خطتي")}</button>
              <button className="text-sm text-rose-300 hover:text-rose-200 underline cursor-pointer" onClick={doCancel}>{tx("Cancel anyway", "إلغاء على أي حال")}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

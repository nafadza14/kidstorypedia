import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { CONFIG } from "@/config";
import { PLANS } from "@/data/catalog";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";
import { checkout, startTrial } from "@/lib/billing";
import { loc } from "@/lib/content";
import { useStore } from "@/store";
import type { PlanId } from "@/types";
import { Modal, btn, toast } from "./kit";

/**
 * Paywall (PRD §50, §79). Shown at natural conversion moments: premium story
 * selected, second child added, full character journey, seasonal programs.
 */
export function Paywall({ open, onClose, reason }: { open: boolean; onClose: () => void; reason?: string }) {
  const { language, tx } = useLanguage();
  const sub = useStore(s => s.subscription);
  const [busy, setBusy] = useState<PlanId | null>(null);

  useEffect(() => { if (open) track("paywall_viewed", { reason }); }, [open, reason]);

  const onTrial = () => {
    if (startTrial()) { toast(tx(`Uji coba gratis ${CONFIG.trialDays} hari dimulai`, `${CONFIG.trialDays}-day free trial started`, `بدأت التجربة المجانية لمدة ${CONFIG.trialDays} أيام`)); onClose(); }
  };
  const onBuy = async (plan: PlanId) => {
    setBusy(plan);
    const r = await checkout(plan);
    setBusy(null);
    toast(r.message);
    if (r.ok) onClose();
  };

  return (
    <Modal open={open} onClose={onClose} wide title={tx("Buka perjalanan belajar keluarga selengkapnya", "Unlock the full family learning journey", "افتح رحلة التعلم العائلية الكاملة")}>
      {reason && <p className="text-sm text-zinc-400 mb-5">{reason}</p>}
      <div className="grid sm:grid-cols-3 gap-4">
        {PLANS.filter(p => p.id !== "free").map(p => (
          <div key={p.id} className={`rounded-2xl border p-5 flex flex-col ${p.highlight ? "border-white/50 bg-white/5" : "border-white/10"}`}>
            {p.highlight && <span className="self-start text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-black mb-2">{tx("Paling hemat", "Best value", "الأفضل قيمة")}</span>}
            <div className="font-heading text-lg">{loc(p.name, language)}</div>
            <div className="text-2xl font-light my-1">${p.priceUsd}<span className="text-sm text-zinc-400">/{p.period === "month" ? tx("bln", "mo", "شهر") : tx("thn", "yr", "سنة")}</span></div>
            <div className="text-xs text-zinc-400 mb-3">{loc(p.tagline, language)}</div>
            <ul className="space-y-1.5 text-xs text-zinc-300 flex-1 mb-4">
              {p.features.map((f, i) => <li key={i} className="flex gap-2"><Check className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />{loc(f, language)}</li>)}
            </ul>
            <button className={p.highlight ? btn.primary : btn.ghost} disabled={!!busy} onClick={() => onBuy(p.id)}>
              {busy === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : tx("Pilih", "Choose", "اختر")}
            </button>
          </div>
        ))}
      </div>
      {!sub.trialEndsAt && (
        <button onClick={onTrial} className="mt-5 w-full py-3 rounded-full border border-amber-300/40 text-amber-200 text-sm hover:bg-amber-300/10 cursor-pointer flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> {tx(`Atau mulai uji coba gratis ${CONFIG.trialDays} hari`, `Or start a ${CONFIG.trialDays}-day free trial`, `أو ابدأ تجربة مجانية لمدة ${CONFIG.trialDays} أيام`)}
        </button>
      )}
      {CONFIG.paymentsDemoMode && <p className="text-[11px] text-zinc-500 mt-4 text-center">{tx("Mode demo: tidak ada kartu yang dikenakan biaya. Hubungkan penyedia pembayaran di src/lib/billing.ts.", "Demo mode: no card is charged. Connect a payment provider in src/lib/billing.ts.", "وضع تجريبي: لا يتم خصم أي مبلغ.")}</p>}
    </Modal>
  );
}

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Info, Package, School } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { btn, toast } from "@/components/kit";
import { useStore } from "@/store";
import { PACKS, PLANS } from "@/data/catalog";
import { buyPack, checkout, startTrial } from "@/lib/billing";
import { isPremium } from "@/lib/entitlements";
import { loc } from "@/lib/content";
import { CONFIG } from "@/config";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/types";

export default function Pricing() {
  const { tx, language } = useLanguage();
  const navigate = useNavigate();
  const hasParent = useStore(s => !!s.parent);
  const sub = useStore(s => s.subscription);
  const ownedPacks = useStore(s => s.ownedPacks);
  const premium = useStore(s => isPremium(s));
  const [busy, setBusy] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useSeo({
    title: tx("Harga - Paket Gratis & Keluarga | Kidstorypedia", "Pricing - Free & Family plans | Kidstorypedia", "الأسعار - الخطة المجانية وخطط العائلة | كيدستوريبيديا"),
    description: tx(
      "Mulai gratis dengan cerita pengantar tidur Islami untuk anak. Paket Keluarga membuka seluruh perpustakaan, hingga 5 profil anak, panduan diskusi lengkap, dan program musiman. Bebas iklan, batalkan kapan saja.",
      "Start free with Islamic bedtime stories for kids. Family plans unlock the full library, up to 5 child profiles, full discussion guides and seasonal programs. Ad-free, cancel anytime.",
      "ابدأ مجاناً مع قصص إسلامية للأطفال قبل النوم. خطط العائلة تفتح المكتبة كاملة وحتى ٥ ملفات أطفال وأدلة النقاش الكاملة. بلا إعلانات، وإلغاء في أي وقت.",
    ),
    canonical: "/pricing",
  });

  const choosePlan = async (plan: PlanId) => {
    if (!hasParent) { navigate("/onboarding"); return; }
    if (plan === "free") { navigate("/dashboard"); return; }
    setBusy(plan);
    try {
      if (!sub.trialEndsAt && sub.status !== "active") {
        const ok = startTrial(plan);
        if (ok) { toast(tx(`Uji coba gratis ${CONFIG.trialDays} hari telah dimulai`, `Your ${CONFIG.trialDays}-day free trial has started`, `بدأت تجربتك المجانية لمدة ${CONFIG.trialDays} أيام`)); return; }
      }
      const r = await checkout(plan);
      toast(r.ok ? tx("Langganan aktif (mode demo - tanpa biaya)", "Subscription active (demo mode - no charge)", "الاشتراك مفعّل (وضع تجريبي - بلا خصم)") : r.message);
    } finally {
      setBusy(null);
    }
  };

  const onPack = async (packId: string) => {
    if (!hasParent) { navigate("/onboarding"); return; }
    setBusy(packId);
    const r = await buyPack(packId);
    setBusy(null);
    toast(r.ok ? tx("Paket terbuka (mode demo - tanpa biaya)", "Pack unlocked (demo mode - no charge)", "تم فتح الحزمة (وضع تجريبي - بلا خصم)") : r.message);
  };

  const periodLabel = (p: string) => (p === "month" ? tx("/ bulan", "/ month", "/ شهر") : p === "year" ? tx("/ tahun", "/ year", "/ سنة") : tx("selamanya", "forever", "دائماً"));

  const ctaLabel = (plan: PlanId) => {
    if (!hasParent) return plan === "free" ? tx("Mulai gratis", "Start free", "ابدأ مجاناً") : tx(`Mulai uji coba gratis ${CONFIG.trialDays} hari`, `Start ${CONFIG.trialDays}-day free trial`, `ابدأ تجربة مجانية ${CONFIG.trialDays} أيام`);
    if (plan === "free") return tx("Ke dasbor", "Go to dashboard", "الذهاب إلى اللوحة");
    if (sub.plan === plan && (sub.status === "active" || sub.status === "trialing")) return sub.status === "trialing" ? tx("Uji coba aktif - berlangganan", "Trial active - subscribe", "التجربة مفعّلة - اشترك") : tx("Paket saat ini", "Current plan", "خطتك الحالية");
    if (!sub.trialEndsAt && sub.status !== "active") return tx(`Mulai uji coba gratis ${CONFIG.trialDays} hari`, `Start ${CONFIG.trialDays}-day free trial`, `ابدأ تجربة مجانية ${CONFIG.trialDays} أيام`);
    return premium ? tx("Beralih ke paket ini", "Switch to this plan", "التحويل لهذه الخطة") : tx("Berlangganan", "Subscribe", "اشترك");
  };

  const faqs = [
    { q: tx("Bagaimana cara kerja uji coba gratis?", "How does the free trial work?", "كيف تعمل التجربة المجانية؟"), a: tx(`Paket Keluarga dimulai dengan uji coba gratis ${CONFIG.trialDays} hari. Tanggal berakhirnya bisa dilihat di portal orang tua, dan kami akan mengingatkan sebelumnya. Satu uji coba per keluarga.`, `Family plans start with a ${CONFIG.trialDays}-day free trial. You'll see the date it ends in your parent portal, and we'll remind you before it does. One trial per family.`, `تبدأ خطط العائلة بتجربة مجانية لمدة ${CONFIG.trialDays} أيام. سترى تاريخ انتهائها في بوابة الوالدين وسنذكّرك قبل ذلك. تجربة واحدة لكل عائلة.`) },
    { q: tx("Bisa batal kapan saja?", "Can I cancel anytime?", "هل يمكنني الإلغاء في أي وقت؟"), a: tx("Ya. Batalkan atau jeda dari Pengaturan dalam dua klik - tanpa telepon, tanpa langkah tersembunyi. Akses tetap berlaku sampai akhir periode yang sudah dibayar.", "Yes. Cancel or pause from Settings in two clicks - no phone calls, no hidden steps. You keep access until the end of the period you paid for.", "نعم. ألغِ أو أوقف مؤقتاً من الإعدادات بنقرتين - بلا مكالمات أو خطوات مخفية. يبقى وصولك حتى نهاية الفترة المدفوعة.") },
    { q: tx("Berapa anak yang bisa ditambahkan?", "How many children can I add?", "كم طفلاً يمكنني إضافته؟"), a: tx(`Paket gratis mencakup ${CONFIG.free.maxChildren} profil anak. Paket Keluarga mencakup hingga ${CONFIG.family.maxChildren} anak, masing-masing dengan perjalanan belajar sendiri.`, `The free plan includes ${CONFIG.free.maxChildren} child profile. Family plans include up to ${CONFIG.family.maxChildren} children, each with their own learning journey.`, `الخطة المجانية تشمل ملف طفل واحد. خطط العائلة تشمل حتى ${CONFIG.family.maxChildren} أطفال، لكل منهم رحلة تعلم خاصة.`) },
    { q: tx("Apakah ada iklan?", "Are there ads?", "هل توجد إعلانات؟"), a: tx("Tidak pernah. Tidak ada iklan di semua paket, dan kami tidak menggunakan pelacakan perilaku atau menjual data.", "Never. There are no ads on any plan, and we don't use behavioural tracking or sell data.", "أبداً. لا إعلانات في أي خطة، ولا نستخدم التتبع السلوكي ولا نبيع البيانات.") },
    { q: tx("Apa itu paket?", "What are packs?", "ما هي الحزم؟"), a: tx("Paket adalah pembelian satu kali untuk koleksi atau program jika kamu memilih untuk tidak berlangganan. Paket tetap terbuka untuk keluargamu.", "Packs are one-time purchases for a collection or program if you'd rather not subscribe. They stay unlocked for your family.", "الحزم مشتريات لمرة واحدة لمجموعة أو برنامج إن لم ترغب في الاشتراك. تبقى مفتوحة لعائلتك.") },
  ];

  return (
    <PublicShell>
      <section className="px-5 sm:px-8 max-w-7xl mx-auto pt-10 pb-12 text-center">
        <span className="text-xs text-zinc-400 font-mono mb-3 block">[ {tx("Harga", "Pricing", "الأسعار")} ]</span>
        <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-4">{tx("Paket sederhana untuk keluarga", "Simple plans for families", "خطط بسيطة للعائلات")}</h1>
        <p className="text-zinc-300 max-w-xl mx-auto">{tx("Mulai gratis. Upgrade saat keluargamu siap untuk perjalanan lengkap. Harga dalam USD.", "Start free. Upgrade when your family is ready for the full journey. Prices in USD.", "ابدأ مجاناً، ورقِّ اشتراكك عندما تكون عائلتك مستعدة للرحلة الكاملة. الأسعار بالدولار الأمريكي.")}</p>
        {CONFIG.paymentsDemoMode && (
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-amber-200 border border-amber-300/30 bg-amber-300/10 rounded-full px-4 py-1.5">
            <Info className="w-3.5 h-3.5" />{tx("Mode pembayaran demo - tidak ada kartu yang dikenakan biaya dalam versi ini.", "Demo payments mode - no card is charged in this version.", "وضع الدفع التجريبي - لا يتم خصم أي بطاقة في هذه النسخة.")}
          </p>
        )}
      </section>

      <section className="px-5 sm:px-8 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-5 pb-16">
        {PLANS.map(p => (
          <div key={p.id} className={cn("relative rounded-3xl border p-6 flex flex-col", p.highlight ? "border-white bg-white/[0.06]" : "border-white/10 bg-zinc-900/50")}>
            {p.highlight && <span className="absolute -top-3 start-6 px-3 py-0.5 rounded-full bg-white text-black text-[11px] font-medium">{tx("Paling hemat", "Best value", "القيمة الأفضل")}</span>}
            <h2 className="text-xl font-heading mb-1">{loc(p.name, language)}</h2>
            <p className="text-sm text-zinc-400 mb-5 min-h-[2.5rem]">{loc(p.tagline, language)}</p>
            <div className="mb-6">
              <span className="text-4xl font-light">${p.priceUsd}</span>
              <span className="text-sm text-zinc-400 ms-1.5">{periodLabel(p.period)}</span>
              {p.period === "year" && <div className="text-xs text-zinc-500 mt-1">{tx(`≈ $${(p.priceUsd / 12).toFixed(2)} / bulan`, `≈ $${(p.priceUsd / 12).toFixed(2)} / month`, `≈ ${(p.priceUsd / 12).toFixed(2)}$ / شهر`)}</div>}
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-200 mb-8 flex-1">
              {p.features.map(f => (
                <li key={f.en} className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0" />{loc(f, language)}</li>
              ))}
            </ul>
            <button
              className={p.highlight ? btn.primary : btn.ghost}
              disabled={busy === p.id || (hasParent && sub.plan === p.id && sub.status === "active")}
              onClick={() => choosePlan(p.id)}
            >
              {busy === p.id ? tx("Memproses...", "Processing…", "جارٍ المعالجة…") : ctaLabel(p.id)}
            </button>
          </div>
        ))}
      </section>

      <section className="px-5 sm:px-8 max-w-7xl mx-auto py-16 border-t border-white/10">
        <div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5" /><h2 className="text-2xl sm:text-3xl font-light">{tx("Paket cerita", "Story packs", "حزم القصص")}</h2></div>
        <p className="text-sm text-zinc-400 mb-8">{tx("Tidak ingin berlangganan? Beli koleksi sekali dan simpan selamanya.", "Prefer not to subscribe? Buy a collection once and keep it.", "لا تفضّل الاشتراك؟ اشترِ مجموعة مرة واحدة واحتفظ بها.")}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PACKS.map(pk => {
            const owned = ownedPacks.includes(pk.id);
            return (
              <div key={pk.id} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-heading">{loc(pk.name, language)}</h3>
                  <span className="text-sm font-mono text-zinc-300">${pk.priceUsd}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-4 flex-1">{loc(pk.description, language)}</p>
                <button className={btn.small + " self-start"} disabled={owned || busy === pk.id || (premium && !pk.printable)} onClick={() => onPack(pk.id)}>
                  {owned ? tx("Dimiliki", "Owned", "مملوكة") : premium && !pk.printable ? tx("Termasuk dalam paketmu", "Included in your plan", "مشمولة في خطتك") : busy === pk.id ? "…" : tx("Beli paket", "Buy pack", "شراء الحزمة")}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 sm:px-8 max-w-3xl mx-auto py-16 border-t border-white/10">
        <h2 className="text-2xl sm:text-3xl font-light mb-8">{tx("Pertanyaan yang sering diajukan", "Frequently asked questions", "الأسئلة الشائعة")}</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f, i) => (
            <div key={i}>
              <button className="w-full flex items-center justify-between gap-4 py-5 text-start cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span className="font-medium">{f.q}</span>
                <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", openFaq === i && "rotate-180")} />
              </button>
              {openFaq === i && <p className="pb-5 text-sm text-zinc-400 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-20">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <School className="w-6 h-6 mt-1 shrink-0" />
            <div>
              <h2 className="text-2xl font-heading mb-1">{tx("Sekolah, TPA/TPQ & organisasi", "Schools, TPA/TPQ & organisations", "المدارس وحلقات التحفيظ والمؤسسات")}</h2>
              <p className="text-sm text-zinc-400">{tx("Akun kelas, tugas, dan kursi keluarga bersponsor. Program percontohan tersedia.", "Classroom accounts, assignments and sponsored family seats. Pilot programs available.", "حسابات صفية وتكليفات ومقاعد عائلية مدعومة. برامج تجريبية متاحة.")}</p>
            </div>
          </div>
          <Link to="/classroom" className={btn.primary + " shrink-0"}>{tx("Lihat perangkat kelas", "See classroom tools", "أدوات الصف")}</Link>
        </div>
      </section>
    </PublicShell>
  );
}

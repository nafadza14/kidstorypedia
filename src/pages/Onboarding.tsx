import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Gift, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { StoryCover, ValueChip, btn, input, label } from "@/components/kit";
import { getState, now, setState, uid, useStore } from "@/store";
import { track } from "@/lib/analytics";
import { redeemReferral } from "@/lib/billing";
import { recommendStories } from "@/lib/recommend";
import { seedDemoFamily } from "@/lib/demo";
import { loc } from "@/lib/content";
import { CONFIG } from "@/config";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import type { ChildProfile, Lang, ParentGoal, ReadingLevel, Story } from "@/types";

const STEPS = 5;

export default function Onboarding() {
  const { tx, language } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = (params.get("ref") || "").trim().toUpperCase();
  const existingParent = useStore(s => s.parent);

  useSeo({
    title: tx("Mulai perjalanan belajar keluarga | Kidstorypedia", "Start your family learning journey | Kidstorypedia", "ابدأ رحلة التعلم العائلية | كيدستوريبيديا"),
    description: tx("Buat akun keluarga Kidstorypedia gratis dalam beberapa menit: tambahkan anak, pilih tujuan, dan dapatkan rekomendasi cerita pertama.", "Create a free Kidstorypedia family account in a few minutes: add your child, choose your goals and get a first recommended story.", "أنشئ حساباً عائلياً مجانياً في دقائق: أضف طفلك واختر أهدافك واحصل على أول قصة مقترحة."),
    canonical: "/onboarding",
    noindex: true,
  });

  const [step, setStep] = useState(1);
  const [finished, setFinished] = useState(false);
  // step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  // step 2
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState(6);
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>("developing");
  const [childLang, setChildLang] = useState<Lang>(language);
  const [dailyGoal, setDailyGoal] = useState(10);
  // step 3
  const [goals, setGoals] = useState<ParentGoal[]>(["bedtime", "character"]);
  // step 5
  const [result, setResult] = useState<{ child: ChildProfile; story?: Story; reason?: string; referral: boolean } | null>(null);
  const started = useRef(false);
  const finishing = useRef(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const step1Ok = name.trim().length > 0 && emailOk && consent;
  const step2Ok = childName.trim().length > 0 && age >= 4 && age <= 12;

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("signup_started", ref ? { ref } : undefined);
  };

  // step 4 → build profile then show step 5
  useEffect(() => {
    if (step !== 4) return;
    const t = setTimeout(() => finish(), 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function finish() {
    if (finished || finishing.current) return;
    finishing.current = true;
    const child: ChildProfile = {
      id: uid("child"),
      name: childName.trim().split(/\s+/)[0],
      age,
      readingLevel,
      language: childLang,
      dailyGoalMin: dailyGoal,
      avatarSeed: childName.trim() + Math.random().toString(36).slice(2, 5),
      createdAt: now(),
    };
    const at = now();
    setState(s => ({
      ...s,
      parent: { name: name.trim(), email: email.trim(), createdAt: at, consentAt: at, goals, role: "parent" },
      children: [child],
      activeChildId: child.id,
    }));
    const referral = ref ? redeemReferral(ref) : false;
    track("onboarding_completed", { goals: goals.join(","), age, referral: !!ref });
    const rec = recommendStories(getState(), child, childLang, 1)[0];
    setResult({ child, story: rec?.story, reason: rec?.reason, referral });
    setFinished(true);
    setStep(5);
  }

  const next = () => {
    if (step === 1) {
      if (!step1Ok) return;
      track("signup_completed");
    }
    if (step === 2) {
      if (!step2Ok) return;
      track("child_created", { age, language: childLang, readingLevel });
    }
    setStep(s => Math.min(STEPS, s + 1));
  };
  const back = () => setStep(s => Math.max(1, s - 1));

  const goalOptions: { id: ParentGoal; id_: string; en: string; ar: string; did: string; d: [string, string] }[] = [
    { id: "bedtime", id_: "Rutinitas sebelum tidur", en: "Bedtime routine", ar: "روتين قبل النوم", did: "Cerita pendek dan menenangkan di penghujung hari", d: ["Calm, short stories for the end of the day", "قصص هادئة قصيرة لختام اليوم"] },
    { id: "prophets", id_: "Kisah para nabi", en: "Prophetic stories", ar: "قصص الأنبياء", did: "Kisah para nabi yang bersumber dari Al-Qur'an", d: ["Stories of the Prophets grounded in the Qur'an", "قصص الأنبياء المستندة إلى القرآن"] },
    { id: "character", id_: "Pembentukan karakter", en: "Character building", ar: "بناء الأخلاق", did: "Diskusi dan praktik nilai dalam kehidupan nyata", d: ["Discussion and real-life value practice", "النقاش وممارسة القيم في الحياة"] },
    { id: "history", id_: "Sejarah Islam", en: "Islamic history", ar: "التاريخ الإسلامي", did: "Sirah dan kehidupan para sahabat", d: ["Seerah and the lives of the Sahabah", "السيرة وحياة الصحابة"] },
    { id: "reading", id_: "Kebiasaan membaca", en: "Reading habit", ar: "عادة القراءة", did: "Target membaca harian yang ringan", d: ["A small daily reading goal", "هدف قراءة يومي صغير"] },
  ];

  // ── already has an account ──
  if (existingParent && !finished && !finishing.current) {
    return (
      <PublicShell>
        <div className="max-w-lg mx-auto px-5 py-16">
          <div className="rounded-3xl border border-white/15 bg-zinc-900/60 p-8 text-center">
            <div className="text-3xl mb-4">✳︎</div>
            <h1 className="text-2xl font-heading mb-2">{tx("Kamu sudah punya akun keluarga", "You already have a family account", "لديك حساب عائلي بالفعل")}</h1>
            <p className="text-sm text-zinc-400 mb-6">
              {tx(`Masuk di perangkat ini sebagai ${existingParent.name}. Kamu bisa menambahkan anak lagi dari portal orang tua.`, `Signed in on this device as ${existingParent.name}. You can add more children from the parent portal.`, `مسجّل على هذا الجهاز باسم ${existingParent.name}. يمكنك إضافة أطفال آخرين من بوابة الوالدين.`)}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className={btn.primary}>{tx("Ke portal orang tua", "Go to parent portal", "الذهاب إلى بوابة الوالدين")}</Link>
              <Link to="/child" className={btn.ghost}>{tx("Buka ruang anak", "Open the kids' space", "فتح مساحة الأطفال")}</Link>
              <Link to="/stories" className="text-sm text-zinc-400 hover:text-white mt-1">{tx("Jelajahi cerita", "Browse stories", "تصفّح القصص")}</Link>
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        {ref && step < 5 && (
          <div className="mb-6 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100 flex items-center gap-3">
            <Gift className="w-4 h-4 shrink-0" />
            {tx(`Temanmu memberikanmu ${CONFIG.referralBonusDays} hari tambahan akses Keluarga.`, `Your friend gave you ${CONFIG.referralBonusDays} extra days of Family access.`, `أهداك صديقك ${CONFIG.referralBonusDays} أيام إضافية من اشتراك العائلة.`)}
          </div>
        )}

        {/* progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <span>{tx(`Langkah ${step} dari ${STEPS}`, `Step ${step} of ${STEPS}`, `الخطوة ${step} من ${STEPS}`)}</span>
            <span>{tx("Sekitar 3 menit", "About 3 minutes", "نحو ٣ دقائق")}</span>
          </div>
          <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step}>
            {Array.from({ length: STEPS }, (_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < step ? "bg-white" : "bg-white/15")} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading mb-2">{tx("Buat akun orang tua", "Create your parent account", "أنشئ حساب الوالدين")}</h1>
                <p className="text-sm text-zinc-400">{tx("Akun dimiliki oleh orang tua. Anak-anak tidak mendaftar sendiri.", "Accounts are held by parents. Children never sign up themselves.", "الحسابات يملكها الوالدان. لا يسجّل الأطفال بأنفسهم.")}</p>
              </div>
              <div>
                <label className={label} htmlFor="ob-name">{tx("Nama kamu", "Your name", "اسمك")}</label>
                <input id="ob-name" className={input} value={name} onFocus={markStarted} onChange={e => setName(e.target.value)} autoComplete="given-name" required />
              </div>
              <div>
                <label className={label} htmlFor="ob-email">{tx("Email", "Email", "البريد الإلكتروني")}</label>
                <input id="ob-email" type="email" className={input} value={email} onFocus={markStarted} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
                {email && !emailOk && <p className="text-xs text-rose-300 mt-1.5">{tx("Mohon masukkan email yang valid.", "Please enter a valid email.", "يرجى إدخال بريد صحيح.")}</p>}
              </div>
              <label className="flex items-start gap-3 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={e => { markStarted(); setConsent(e.target.checked); }} className="mt-1 w-4 h-4 accent-white" required />
                <span>
                  {tx("Saya adalah orang tua atau wali sah dan saya menyetujui Kidstorypedia menyimpan nama depan dan usia anak saya untuk menyesuaikan cerita. ", "I am the parent or legal guardian and I consent to Kidstorypedia storing my child's first name and age to personalise stories. ", "أنا الوالد أو الوصي القانوني وأوافق على أن تحفظ كيدستوريبيديا الاسم الأول لطفلي وعمره لتخصيص القصص. ")}
                  <Link to="/privacy" target="_blank" className="underline underline-offset-4 hover:text-white">{tx("Baca kebijakan privasi", "Read the privacy policy", "اقرأ سياسة الخصوصية")}</Link>
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className={btn.primary} disabled={!step1Ok}>{tx("Lanjutkan", "Continue", "متابعة")} <ArrowRight className="w-4 h-4 rtl:-scale-x-100" /></button>
                <button type="button" className={btn.ghost} onClick={() => { seedDemoFamily(); navigate("/dashboard"); }}>
                  {tx("Jelajahi dengan keluarga demo", "Explore with a demo family", "استكشف مع عائلة تجريبية")}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading mb-2">{tx("Tambahkan anakmu", "Add your child", "أضف طفلك")}</h1>
                <p className="text-sm text-zinc-400">{tx("Nama depan saja - kami tidak memerlukan nama keluarga, foto, atau tanggal lahir.", "First name only - we don't need a surname, photo or birthday.", "الاسم الأول فقط - لا نحتاج اسم العائلة أو صورة أو تاريخ الميلاد.")}</p>
              </div>
              <div>
                <label className={label} htmlFor="ob-child">{tx("Nama depan anak", "Child's first name", "الاسم الأول للطفل")}</label>
                <input id="ob-child" className={input} value={childName} onChange={e => setChildName(e.target.value)} maxLength={30} autoComplete="off" required />
              </div>
              <div>
                <span className={label}>{tx("Usia", "Age", "العمر")}: <span className="text-white">{age}</span></span>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 9 }, (_, i) => i + 4).map(a => (
                    <button type="button" key={a} onClick={() => setAge(a)} className={cn("w-10 h-10 rounded-full border text-sm cursor-pointer", a === age ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10")} aria-pressed={a === age}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className={label}>{tx("Tingkat membaca", "Reading level", "مستوى القراءة")}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([["early", "Pemula", "Early", "مبتدئ", "Bacakan untukku", "Read to me", "اقرأ لي"], ["developing", "Berkembang", "Developing", "متوسط", "Membaca dengan bantuan", "Reads with help", "يقرأ بمساعدة"], ["confident", "Mahir", "Confident", "متمكّن", "Membaca sendiri", "Reads alone", "يقرأ وحده"]] as const).map(([id, id_, en, ar, hintId, hint, hintAr]) => (
                    <button type="button" key={id} onClick={() => setReadingLevel(id)} className={cn("rounded-2xl border p-3 text-start cursor-pointer", readingLevel === id ? "bg-white text-black border-white" : "border-white/15 hover:bg-white/5")} aria-pressed={readingLevel === id}>
                      <div className="text-sm font-medium">{tx(id_, en, ar)}</div>
                      <div className={cn("text-[11px]", readingLevel === id ? "text-zinc-600" : "text-zinc-500")}>{tx(hintId, hint, hintAr)}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <span className={label}>{tx("Bahasa cerita pilihan", "Preferred story language", "لغة القصص المفضلة")}</span>
                  <div className="flex gap-2">
                    {([["en", "English"], ["id", "Indonesia"], ["ar", "العربية"]] as const).map(([id, l]) => (
                      <button type="button" key={id} onClick={() => setChildLang(id)} className={cn("flex-1 rounded-full border py-2 text-sm cursor-pointer", childLang === id ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10")} aria-pressed={childLang === id}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className={label}>{tx("Target membaca harian", "Daily reading goal", "هدف القراءة اليومي")}</span>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map(m => (
                      <button type="button" key={m} onClick={() => setDailyGoal(m)} className={cn("flex-1 rounded-full border py-2 text-sm cursor-pointer", dailyGoal === m ? "bg-white text-black border-white" : "border-white/20 hover:bg-white/10")} aria-pressed={dailyGoal === m}>{m}{tx("m", "m", "د")}</button>
                    ))}
                  </div>
                </div>
              </div>
              <Nav back={back} disabled={!step2Ok} tx={tx} />
            </form>
          )}

          {step === 3 && (
            <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading mb-2">{tx("Apa yang ingin kamu fokuskan?", "What would you like to focus on?", "على ماذا تودّ التركيز؟")}</h1>
                <p className="text-sm text-zinc-400">{tx("Pilih sesukamu. Kami menggunakan ini untuk merekomendasikan cerita - bisa diubah nanti.", "Choose any. We use this to recommend stories - you can change it later.", "اختر ما تشاء. نستخدم ذلك لاقتراح القصص - يمكنك تغييره لاحقاً.")}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {goalOptions.map(g => {
                  const on = goals.includes(g.id);
                  return (
                    <button type="button" key={g.id} onClick={() => setGoals(gs => (on ? gs.filter(x => x !== g.id) : [...gs, g.id]))} aria-pressed={on}
                      className={cn("rounded-2xl border p-4 text-start flex items-start gap-3 cursor-pointer transition-colors", on ? "border-white bg-white/10" : "border-white/15 hover:bg-white/5")}>
                      <span className={cn("w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5", on ? "bg-white border-white text-black" : "border-white/30")}>{on && <Check className="w-3.5 h-3.5" />}</span>
                      <span>
                        <span className="block text-sm font-medium">{tx(g.id_, g.en, g.ar)}</span>
                        <span className="block text-xs text-zinc-400 mt-0.5">{tx(g.did, g.d[0], g.d[1])}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <Nav back={back} disabled={goals.length === 0} tx={tx} label={tx("Buat profil belajar", "Create learning profile", "إنشاء ملف التعلم")} />
            </form>
          )}

          {step === 4 && (
            <div className="py-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-5 text-zinc-300" />
              <h1 className="text-2xl font-heading mb-4">{tx("Membuat profil belajarmu...", "Creating your learning profile…", "جارٍ إنشاء ملف التعلم…")}</h1>
              <ul className="text-sm text-zinc-300 space-y-2 inline-block text-start">
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-300" />{tx(`${childName.trim() || "Anakmu"}, usia ${age}`, `${childName.trim() || "Your child"}, age ${age}`, `${childName.trim() || "طفلك"}، العمر ${age}`)}</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-300" />{tx(`${dailyGoal} menit per hari, dalam ${childLang === "ar" ? "Bahasa Arab" : "Bahasa Inggris"}`, `${dailyGoal} minutes a day, in ${childLang === "ar" ? "Arabic" : "English"}`, `${dailyGoal} دقائق يومياً، ${childLang === "ar" ? "بالعربية" : "بالإنجليزية"}`)}</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-300" />{goals.map(g => { const o = goalOptions.find(x => x.id === g)!; return tx(o.id_, o.en, o.ar); }).join(" · ")}</li>
              </ul>
            </div>
          )}

          {step === 5 && result && <FirstStory result={result} />}
        </div>

        {step < 4 && (
          <p className="text-xs text-zinc-500 mt-6 text-center">
            {tx("Disimpan di perangkat ini saja dalam versi ini. Tanpa iklan. Hapus kapan saja di Pengaturan.", "Stored on this device only in this version. No ads. Delete anytime in Settings.", "تُحفظ على هذا الجهاز فقط في هذه النسخة. بلا إعلانات. يمكنك الحذف في أي وقت من الإعدادات.")}
          </p>
        )}
      </div>
    </PublicShell>
  );
}

function Nav({ back, disabled, tx, label: lbl }: { back: () => void; disabled: boolean; tx: (id: string, en: string, ar?: string) => string; label?: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" className={btn.ghost} onClick={back}><ArrowLeft className="w-4 h-4 rtl:-scale-x-100" />{tx("Kembali", "Back", "رجوع")}</button>
      <button type="submit" className={btn.primary} disabled={disabled}>{lbl || tx("Lanjutkan", "Continue", "متابعة")} <ArrowRight className="w-4 h-4 rtl:-scale-x-100" /></button>
    </div>
  );
}

function FirstStory({ result }: { result: { child: ChildProfile; story?: Story; reason?: string; referral: boolean } }) {
  const { tx, language } = useLanguage();
  const navigate = useNavigate();
  const { child, story, reason, referral } = result;
  const read = () => {
    if (!story) return;
    setState(s => ({ ...s, activeChildId: child.id }));
    navigate(`/story/${story.id}`);
  };
  const intro = useMemo(() => tx(`Keluargamu sudah siap, profil belajar ${child.name} telah dibuat.`, `Your family is ready, ${child.name}'s learning profile is set up.`, `عائلتك جاهزة، وتم إعداد ملف التعلم لـ${child.name}.`), [child.name, tx]);
  return (
    <div>
      <div className="flex items-center gap-2 text-emerald-300 text-sm mb-3"><Sparkles className="w-4 h-4" />{intro}</div>
      {referral && (
        <p className="text-sm text-emerald-100 mb-4">{tx(`${CONFIG.referralBonusDays} hari bonus dari temanmu telah ditambahkan ke akunmu.`, `${CONFIG.referralBonusDays} bonus days from your friend have been added to your account.`, `أُضيفت ${CONFIG.referralBonusDays} أيام هدية من صديقك إلى حسابك.`)}</p>
      )}
      <h1 className="text-2xl sm:text-3xl font-heading mb-6">{tx(`Cerita pertama malam ini untuk ${child.name}`, `Tonight's first story for ${child.name}`, `القصة الأولى الليلة لـ${child.name}`)}</h1>
      {story ? (
        <div className="grid sm:grid-cols-5 gap-5 items-start">
          <StoryCover story={story} className="sm:col-span-2 aspect-[4/5] rounded-2xl" />
          <div className="sm:col-span-3">
            <h2 className="text-xl font-heading mb-2">{loc(story.title, language)}</h2>
            <p className="text-sm text-zinc-400 mb-3">{loc(story.description, language)}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">{story.values.map(v => <ValueChip key={v} id={v} />)}</div>
            {reason && <p className="text-xs text-zinc-300 mb-5"><span className="text-zinc-500">{tx("Kenapa cerita ini: ", "Why this story: ", "لماذا هذه القصة: ")}</span>{reason}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className={btn.primary} onClick={read}>{tx("Baca sekarang", "Read it now", "اقرأها الآن")}</button>
              <Link to="/dashboard" className={btn.ghost}>{tx("Ke dasbor orang tua", "Go to parent dashboard", "الذهاب إلى لوحة الوالدين")}</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/child" className={btn.primary}>{tx("Buka ruang anak", "Open the kids' space", "فتح مساحة الأطفال")}</Link>
          <Link to="/dashboard" className={btn.ghost}>{tx("Ke dasbor orang tua", "Go to parent dashboard", "الذهاب إلى لوحة الوالدين")}</Link>
        </div>
      )}
    </div>
  );
}

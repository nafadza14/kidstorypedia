import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Check, Info, Mail, MessageCircle, Moon, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { StoryCover, ValueChip, btn, input } from "@/components/kit";
import { now, setState, useStore } from "@/store";
import { familyStories, loc } from "@/lib/content";
import { track } from "@/lib/analytics";
import { PROGRAMS } from "@/data/catalog";
import { useSeo } from "@/hooks/useSeo";
import type { Story } from "@/types";

export default function LeadMagnet() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useSeo({
    title: tx("30 Malam Kisah Nabi - Program Pengantar Tidur Gratis | Kidstorypedia", "30 Nights of Prophetic Stories - Free Bedtime Program | Kidstorypedia", "٣٠ ليلة من القصص النبوية - برنامج مجاني قبل النوم | كيدستوريبيديا"),
    description: tx(
      "Program gratis 30 malam cerita Islami pengantar tidur untuk anak: sebuah cerita, pertanyaan diskusi, dan aksi keluarga kecil setiap malam. Kisah para Nabi, Sirah, dan Sahabat untuk usia 4-12 tahun.",
      "A free 30-night Islamic bedtime stories program for kids: a story, a discussion question and a small family action each night. Prophets, Seerah and Sahabah stories for ages 4–12.",
      "برنامج مجاني لمدة ٣٠ ليلة من القصص الإسلامية قبل النوم: قصة وسؤال نقاش وعمل عائلي صغير كل ليلة.",
    ),
    canonical: "/30-nights",
  });

  const nights = useMemo(() => {
    const program = PROGRAMS.find(p => p.id === "ramadan-30");
    const visible = familyStories(state);
    const used = new Set<string>();
    return (program?.days || []).slice(0, 7).map(d => {
      let story: Story | undefined = visible.find(s => s.id === d.storyId);
      if (!story) story = visible.find(s => s.values.includes(d.value) && !used.has(s.id));
      if (story) used.add(story.id);
      return { day: d.day, value: d.value, action: d.action, story };
    });
  }, [state]);

  const night1 = nights.find(n => n.story) || nights[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk) return;
    const clean = email.trim().toLowerCase();
    setState(s => ({
      ...s,
      leads: s.leads.some(l => l.email === clean && l.source === "30-nights") ? s.leads : [...s.leads, { email: clean, at: now(), source: "30-nights" }],
    }));
    track("lead_captured", { source: "30-nights" });
    setSubmitted(true);
  };

  return (
    <PublicShell>
      <section className="px-5 sm:px-8 max-w-6xl mx-auto pt-10 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs text-zinc-400 font-mono mb-3 block">[ {tx("Program gratis", "Free program", "برنامج مجاني")} ]</span>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight leading-[1.05] mb-5">{tx("30 Malam Kisah Nabi", "30 Nights of Prophetic Stories", "٣٠ ليلة من القصص النبوية")}</h1>
          <p className="text-lg text-zinc-300 mb-8">
            {tx("Bangun kebiasaan tenang sebelum tidur dalam satu bulan. Setiap malam kamu mendapat semua yang dibutuhkan untuk sepuluh menit bermakna bersama anakmu.", "Build a calm bedtime habit in one month. Each night you get everything you need for ten meaningful minutes with your child.", "ابنِ عادة هادئة قبل النوم في شهر واحد. كل ليلة تحصل على كل ما تحتاجه لعشر دقائق هادفة مع طفلك.")}
          </p>
          <ul className="space-y-3 mb-2">
            {[
              { icon: BookOpen, en: "A short story grounded in the Qur'an, Sunnah or Sirah", ar: "قصة قصيرة مستندة إلى القرآن أو السنة أو السيرة", id: "Cerita pendek berdasarkan Al-Qur'an, Sunnah, atau Sirah" },
              { icon: MessageCircle, en: "One discussion question to ask together", ar: "سؤال نقاش واحد تطرحانه معاً", id: "Satu pertanyaan diskusi untuk ditanyakan bersama" },
              { icon: Zap, en: "One small action challenge for the next day", ar: "تحدٍّ عملي صغير لليوم التالي", id: "Satu tantangan aksi kecil untuk hari berikutnya" },
            ].map(({ icon: Icon, en, ar, id }) => (
              <li key={en} className="flex items-start gap-3 text-zinc-200"><Icon className="w-5 h-5 mt-0.5 shrink-0 text-white/80" />{tx(id, en, ar)}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/15 bg-zinc-900/60 p-6 sm:p-8">
          {!submitted ? (
            <form onSubmit={submit} className="space-y-4">
              <Mail className="w-6 h-6" />
              <h2 className="text-2xl font-heading">{tx("Dapatkan Malam 1 sekarang", "Get Night 1 now", "احصل على الليلة الأولى الآن")}</h2>
              <p className="text-sm text-zinc-400">{tx("Masukkan emailmu dan mulai malam ini. Gratis, tanpa perlu akun.", "Enter your email and start tonight. Free, no account needed.", "أدخل بريدك وابدأ الليلة. مجاني، بلا حساب.")}</p>
              <label className="sr-only" htmlFor="lm-email">{tx("Email", "Email", "البريد الإلكتروني")}</label>
              <input id="lm-email" type="email" className={input} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              <button type="submit" className={btn.primary + " w-full"} disabled={!emailOk}>{tx("Mulai 30 malam", "Start the 30 nights", "ابدأ الثلاثين ليلة")}</button>
              <p className="text-xs text-zinc-500">{tx("Kami hanya menggunakan emailmu untuk program ini. Berhenti kapan saja. ", "We only use your email for this program. Unsubscribe anytime. ", "نستخدم بريدك لهذا البرنامج فقط. يمكنك إلغاء الاشتراك في أي وقت. ")}<Link to="/privacy" className="underline underline-offset-2">{tx("Privasi", "Privacy", "الخصوصية")}</Link></p>
              <p className="text-[11px] text-amber-200/80 flex items-start gap-1.5"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />{tx("Pengiriman email harian memerlukan penyedia email; di versi ini malam-malammu tersedia di halaman ini.", "Daily email delivery requires connecting an email provider; in this version your nights are available on this page.", "يتطلب الإرسال اليومي بالبريد ربط مزوّد بريد؛ في هذه النسخة تتوفر لياليك في هذه الصفحة.")}</p>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-sm mb-4"><Check className="w-4 h-4" />{tx("Kamu sudah terdaftar! Ini Malam 1.", "You're in! Here is Night 1.", "تم التسجيل! إليك الليلة الأولى.")}</div>
              {night1 && (
                <div className="space-y-4">
                  <div className="text-xs font-mono text-zinc-400">{tx("Malam 1", "Night 1", "الليلة ١")} · <ValueChip id={night1.value} /></div>
                  {night1.story && (
                    <Link to={`/stories/${night1.story.slug}`} className="flex gap-4 items-center rounded-2xl border border-white/10 p-3 hover:border-white/30">
                      <StoryCover story={night1.story} className="w-20 h-20 rounded-xl shrink-0" />
                      <div>
                        <div className="font-heading">{loc(night1.story.title, language)}</div>
                        <div className="text-xs text-zinc-400">{tx("Baca cerita malam ini →", "Read tonight's story →", "اقرأ قصة الليلة ←")}</div>
                      </div>
                    </Link>
                  )}
                  {night1.story && (
                    <div className="rounded-2xl bg-black/30 p-4">
                      <div className="text-xs font-mono text-zinc-400 mb-1 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{tx("Tanyakan bersama", "Ask together", "اسألا معاً")}</div>
                      <p>{loc(night1.story.discussion.questions[0], language)}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-black/30 p-4">
                    <div className="text-xs font-mono text-zinc-400 mb-1 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{tx("Aksi besok", "Tomorrow's action", "عمل الغد")}</div>
                    <p>{loc(night1.action, language)}</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-zinc-300 mb-3">{tx("Ingin ini dipersonalisasi untuk anakmu?", "Want this personalised for your child?", "هل تريد تخصيص ذلك لطفلك؟")}</p>
                    <Link to="/onboarding" className={btn.primary}>{tx("Coba Kidstorypedia", "Try Kidstorypedia", "جرّب كيدستوريبيديا")}</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 sm:px-8 max-w-6xl mx-auto py-16 border-t border-white/10">
        <h2 className="text-2xl sm:text-3xl font-light mb-2">{tx("Minggu pertamamu", "Your first week", "أسبوعك الأول")}</h2>
        <p className="text-sm text-zinc-400 mb-8">{tx("Satu nilai setiap malam, dengan cerita yang menghidupkannya.", "A value a night, with a story that brings it to life.", "قيمة كل ليلة، مع قصة تجسّدها.")}</p>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nights.map(n => (
            <li key={n.day} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 inline-flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" />{tx(`Malam ${n.day}`, `Night ${n.day}`, `الليلة ${n.day}`)}</span>
                <ValueChip id={n.value} />
              </div>
              {n.story ? (
                <Link to={`/stories/${n.story.slug}`} className="font-heading leading-snug hover:underline underline-offset-4">{loc(n.story.title, language)}</Link>
              ) : (
                <span className="font-heading text-zinc-300">{tx("Malam refleksi keluarga", "Family reflection night", "ليلة تأمل عائلي")}</span>
              )}
              <p className="text-xs text-zinc-400">{loc(n.action, language)}</p>
            </li>
          ))}
          <li className="rounded-2xl border border-dashed border-white/15 p-5 flex flex-col justify-center text-sm text-zinc-400">
            {tx("...dan 23 malam lagi, diakhiri dengan refleksi keluarga tentang nilai mana yang paling berkembang.", "…and 23 more nights, ending with a family reflection on which value grew most.", "…و٢٣ ليلة أخرى، تنتهي بتأمل عائلي في القيمة التي نمت أكثر.")}
          </li>
        </ol>
      </section>
    </PublicShell>
  );
}

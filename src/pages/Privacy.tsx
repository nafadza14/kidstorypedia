import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { useStore } from "@/store";
import { useSeo } from "@/hooks/useSeo";

export default function Privacy() {
  const { tx } = useLanguage();
  const retention = useStore(s => s.settings.dataRetentionMonths);
  const hasParent = useStore(s => !!s.parent);

  useSeo({
    title: tx("Privacy & Child Safety | Kidstorypedia", "الخصوصية وسلامة الأطفال | كيدستوريبيديا"),
    description: tx(
      "How Kidstorypedia protects children and families: minimal data, parent-controlled accounts, no advertising, parental consent, deletion and export.",
      "كيف تحمي كيدستوريبيديا الأطفال والعائلات: أقل قدر من البيانات، حسابات بتحكم الوالدين، بلا إعلانات، موافقة الوالدين، الحذف والتصدير.",
    ),
    canonical: "/privacy",
  });

  const sections: { id: string; h: string; body: React.ReactNode }[] = [
    {
      id: "summary",
      h: tx("The short version", "باختصار"),
      body: (
        <ul className="list-disc ps-5 space-y-1.5">
          <li>{tx("We collect as little as possible: for a child, only a first name and age.", "نجمع أقل قدر ممكن: للطفل الاسم الأول والعمر فقط.")}</li>
          <li>{tx("Accounts belong to parents. Children cannot sign up or contact anyone.", "الحسابات ملك للوالدين. لا يستطيع الأطفال التسجيل أو التواصل مع أي أحد.")}</li>
          <li>{tx("No advertising. No behavioural advertising. We never sell data.", "بلا إعلانات. بلا إعلانات سلوكية. لا نبيع البيانات أبداً.")}</li>
          <li>{tx("You can export or delete everything at any time.", "يمكنك تصدير كل شيء أو حذفه في أي وقت.")}</li>
        </ul>
      ),
    },
    {
      id: "data",
      h: tx("What we collect", "ما نجمعه"),
      body: (
        <>
          <p><strong className="text-white">{tx("Parent:", "الوالد:")}</strong> {tx("name, email, the goals you choose, and the time you gave consent.", "الاسم والبريد الإلكتروني والأهداف التي تختارها ووقت الموافقة.")}</p>
          <p><strong className="text-white">{tx("Child:", "الطفل:")}</strong> {tx("first name, age, reading level, preferred language and daily reading goal. We do not ask for surnames, photos, birthdays, location, school or voice recordings.", "الاسم الأول والعمر ومستوى القراءة واللغة المفضلة وهدف القراءة اليومي. لا نطلب اسم العائلة أو الصور أو تاريخ الميلاد أو الموقع أو المدرسة أو التسجيلات الصوتية.")}</p>
          <p><strong className="text-white">{tx("Learning activity:", "نشاط التعلم:")}</strong> {tx("stories read, discussions and actions you mark as done, reflections and observations you write. This powers the Character Journal and recommendations — it is never used to score or rank a child.", "القصص المقروءة والنقاشات والأعمال التي تسجّلها، والتأملات والملاحظات التي تكتبها. يُستخدم ذلك لدفتر الأخلاق والتوصيات — ولا يُستخدم أبداً لتقييم الطفل أو ترتيبه.")}</p>
          <p><strong className="text-white">{tx("Product analytics:", "تحليلات المنتج:")}</strong> {tx("simple usage events (e.g. \"story completed\") to improve the product. No third-party advertising trackers, no cross-site tracking, no fingerprinting.", "أحداث استخدام بسيطة (مثل «اكتملت القصة») لتحسين المنتج. بلا متتبعات إعلانية خارجية أو تتبع عبر المواقع أو بصمة الجهاز.")}</p>
        </>
      ),
    },
    {
      id: "storage",
      h: tx("Where your data lives", "أين تُحفظ بياناتك"),
      body: (
        <p>{tx("In this version, your family's data is stored locally in this browser on this device (local-first). It is not uploaded to our servers. If you clear your browser data or switch devices, it won't come with you — use export in Settings to keep a copy. When cloud sync is introduced we will ask for your consent first and update this page.", "في هذه النسخة، تُحفظ بيانات عائلتك محلياً في هذا المتصفح على هذا الجهاز. لا تُرفع إلى خوادمنا. إذا مسحت بيانات المتصفح أو غيّرت الجهاز فلن تنتقل معك — استخدم التصدير في الإعدادات للاحتفاظ بنسخة. عند إضافة المزامنة السحابية سنطلب موافقتك أولاً ونحدّث هذه الصفحة.")}</p>
      ),
    },
    {
      id: "consent",
      h: tx("Parental consent & control", "موافقة الوالدين والتحكم"),
      body: (
        <>
          <p>{tx("A parent or legal guardian must create the account and give consent before any child profile is created. We record when consent was given.", "يجب أن ينشئ الوالد أو الوصي القانوني الحساب ويعطي الموافقة قبل إنشاء أي ملف طفل. نسجّل وقت إعطاء الموافقة.")}</p>
          <p>{tx("Parents control screen-time limits, narration, reminders and a parental PIN for parent-only areas. The kids' space has no chat, no public profiles, no external links and no purchases.", "يتحكم الوالدان في حدود وقت الشاشة والسرد والتذكيرات ورمز PIN للمناطق الخاصة بالوالدين. مساحة الأطفال بلا دردشة أو ملفات عامة أو روابط خارجية أو مشتريات.")}</p>
        </>
      ),
    },
    {
      id: "ai",
      h: tx("AI processing", "معالجة الذكاء الاصطناعي"),
      body: (
        <>
          <p>{tx("Some features (for example, adapting a story or the parent assistant) send a request to Google Gemini through our server. The request contains the story content, the chosen value, age band and language.", "بعض الميزات (مثل تكييف قصة أو مساعد الوالدين) ترسل طلباً إلى Google Gemini عبر خادمنا. يتضمن الطلب محتوى القصة والقيمة المختارة والفئة العمرية واللغة.")}</p>
          <p>{tx("No child personal data is sent, except a child's first name if you choose to personalise a story. Requests are not used by us for advertising. AI output is checked against approved sources before it is shown, and AI never replaces scholar review.", "لا تُرسل بيانات شخصية للطفل، باستثناء الاسم الأول إن اخترت تخصيص القصة. لا نستخدم الطلبات للإعلانات. يُفحص ناتج الذكاء الاصطناعي مقابل المصادر المعتمدة قبل عرضه، ولا يحل محل المراجعة العلمية.")}</p>
        </>
      ),
    },
    {
      id: "rights",
      h: tx("Deletion, export & retention", "الحذف والتصدير ومدة الاحتفاظ"),
      body: (
        <>
          <p>
            {tx("You can export all your family's data as a file, or delete a child profile or your whole account, from ", "يمكنك تصدير كل بيانات عائلتك في ملف، أو حذف ملف طفل أو حسابك كاملاً، من ")}
            {hasParent ? <Link to="/dashboard/settings" className="underline underline-offset-4 text-white">{tx("Settings", "الإعدادات")}</Link> : tx("Settings", "الإعدادات")}
            {tx(". Deletion is immediate and cannot be undone.", ". الحذف فوري ولا يمكن التراجع عنه.")}
          </p>
          <p>{tx(`You choose how long learning activity is kept (default ${retention} months) in Settings. Email addresses collected for the free 30-night program are used only for that program and removed when you unsubscribe.`, `تختار في الإعدادات مدة الاحتفاظ بنشاط التعلم (الافتراضي ${retention} شهراً). تُستخدم عناوين البريد المسجّلة لبرنامج الثلاثين ليلة لهذا البرنامج فقط وتُحذف عند إلغاء الاشتراك.`)}</p>
        </>
      ),
    },
    {
      id: "law",
      h: tx("Children's privacy laws", "قوانين خصوصية الأطفال"),
      body: (
        <p>{tx("We design for the principles of COPPA (United States), GDPR and the UK Age Appropriate Design Code (GDPR-K), and Indonesia's Personal Data Protection Law (UU PDP No. 27/2022). Specific legal obligations will be reviewed with counsel for each launch market before public launch, and this page will be updated accordingly.", "نصمّم وفق مبادئ قانون COPPA (الولايات المتحدة) واللائحة الأوروبية GDPR وقواعد التصميم المناسب للعمر في المملكة المتحدة، وقانون حماية البيانات الشخصية الإندونيسي (رقم ٢٧/٢٠٢٢). ستُراجع الالتزامات القانونية مع مستشار قانوني لكل سوق قبل الإطلاق العام، وستُحدَّث هذه الصفحة.")}</p>
      ),
    },
    {
      id: "contact",
      h: tx("Contact", "التواصل"),
      body: (
        <p>{tx("Questions or requests about your family's data: privacy@kidstorypedia.com. Kidstorypedia is supported by Yayasan Omah Dongeng Kalasan.", "للاستفسارات أو الطلبات المتعلقة ببيانات عائلتك: privacy@kidstorypedia.com. كيدستوريبيديا بدعم من مؤسسة أوماه دونغينغ كالاسان.")}</p>
      ),
    },
  ];

  return (
    <PublicShell>
      <div className="px-5 sm:px-8 max-w-3xl mx-auto pt-10 pb-20">
        <span className="text-xs text-zinc-400 font-mono mb-3 block">[ {tx("Privacy & child safety", "الخصوصية وسلامة الأطفال")} ]</span>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">{tx("Privacy & child safety", "الخصوصية وسلامة الأطفال")}</h1>
        <p className="text-zinc-400 mb-10">{tx("Written for parents, in plain language.", "مكتوبة للوالدين بلغة واضحة.")}</p>
        <nav className="mb-12 rounded-2xl border border-white/10 bg-zinc-900/50 p-5" aria-label={tx("Contents", "المحتويات")}>
          <ol className="grid sm:grid-cols-2 gap-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`} className="text-zinc-300 hover:text-white">{i + 1}. {s.h}</a></li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12">
          {sections.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl font-heading mb-4">{s.h}</h2>
              <div className="space-y-3 text-zinc-300 leading-relaxed">{s.body}</div>
            </section>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-16">{tx("Last updated: ", "آخر تحديث: ")}{new Date().getFullYear()}</p>
      </div>
    </PublicShell>
  );
}

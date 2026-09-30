import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { useStore } from "@/store";
import { useSeo } from "@/hooks/useSeo";

export default function Privacy() {
  const { tx, language } = useLanguage();
  const retention = useStore(s => s.settings.dataRetentionMonths);
  const hasParent = useStore(s => !!s.parent);

  useSeo({
    title: tx("Privasi & Keamanan Anak | Kidstorypedia", "Privacy & Child Safety | Kidstorypedia", "الخصوصية وسلامة الأطفال | كيدستوريبيديا"),
    description: tx(
      "Bagaimana Kidstorypedia melindungi anak dan keluarga: data minimal, akun dikontrol orang tua, tanpa iklan, persetujuan orang tua, penghapusan dan ekspor.",
      "How Kidstorypedia protects children and families: minimal data, parent-controlled accounts, no advertising, parental consent, deletion and export.",
      "كيف تحمي كيدستوريبيديا الأطفال والعائلات: أقل قدر من البيانات، حسابات بتحكم الوالدين، بلا إعلانات، موافقة الوالدين، الحذف والتصدير.",
    ),
    canonical: "/privacy",
    alternates: true,
    lang: language,
  });

  const sections: { id: string; h: string; body: React.ReactNode }[] = [
    {
      id: "summary",
      h: tx("Versi singkat", "The short version", "باختصار"),
      body: (
        <ul className="list-disc ps-5 space-y-1.5">
          <li>{tx("Kami mengumpulkan seminimal mungkin: untuk anak, hanya nama depan dan usia.", "We collect as little as possible: for a child, only a first name and age.", "نجمع أقل قدر ممكن: للطفل الاسم الأول والعمر فقط.")}</li>
          <li>{tx("Akun milik orang tua. Anak tidak bisa mendaftar atau menghubungi siapa pun.", "Accounts belong to parents. Children cannot sign up or contact anyone.", "الحسابات ملك للوالدين. لا يستطيع الأطفال التسجيل أو التواصل مع أي أحد.")}</li>
          <li>{tx("Tanpa iklan. Tanpa iklan berbasis perilaku. Kami tidak pernah menjual data.", "No advertising. No behavioural advertising. We never sell data.", "بلا إعلانات. بلا إعلانات سلوكية. لا نبيع البيانات أبداً.")}</li>
          <li>{tx("Kamu bisa mengekspor atau menghapus semuanya kapan saja.", "You can export or delete everything at any time.", "يمكنك تصدير كل شيء أو حذفه في أي وقت.")}</li>
        </ul>
      ),
    },
    {
      id: "data",
      h: tx("Apa yang kami kumpulkan", "What we collect", "ما نجمعه"),
      body: (
        <>
          <p><strong className="text-white">{tx("Orang tua:", "Parent:", "الوالد:")}</strong> {tx("nama, email, tujuan yang dipilih, dan waktu pemberian persetujuan.", "name, email, the goals you choose, and the time you gave consent.", "الاسم والبريد الإلكتروني والأهداف التي تختارها ووقت الموافقة.")}</p>
          <p><strong className="text-white">{tx("Anak:", "Child:", "الطفل:")}</strong> {tx("nama depan, usia, tingkat membaca, bahasa pilihan, dan target membaca harian. Kami tidak meminta nama keluarga, foto, tanggal lahir, lokasi, sekolah, atau rekaman suara.", "first name, age, reading level, preferred language and daily reading goal. We do not ask for surnames, photos, birthdays, location, school or voice recordings.", "الاسم الأول والعمر ومستوى القراءة واللغة المفضلة وهدف القراءة اليومي. لا نطلب اسم العائلة أو الصور أو تاريخ الميلاد أو الموقع أو المدرسة أو التسجيلات الصوتية.")}</p>
          <p><strong className="text-white">{tx("Aktivitas belajar:", "Learning activity:", "نشاط التعلم:")}</strong> {tx("cerita yang dibaca, diskusi dan aksi yang ditandai selesai, refleksi dan catatan yang ditulis. Ini menggerakkan Jurnal Karakter dan rekomendasi - tidak pernah digunakan untuk menilai atau merangking anak.", "stories read, discussions and actions you mark as done, reflections and observations you write. This powers the Character Journal and recommendations - it is never used to score or rank a child.", "القصص المقروءة والنقاشات والأعمال التي تسجّلها، والتأملات والملاحظات التي تكتبها. يُستخدم ذلك لدفتر الأخلاق والتوصيات - ولا يُستخدم أبداً لتقييم الطفل أو ترتيبه.")}</p>
          <p><strong className="text-white">{tx("Analitik produk:", "Product analytics:", "تحليلات المنتج:")}</strong> {tx("kejadian penggunaan sederhana (misal \"cerita selesai\") untuk meningkatkan produk. Tanpa pelacak iklan pihak ketiga, tanpa pelacakan lintas situs, tanpa fingerprinting.", "simple usage events (e.g. \"story completed\") to improve the product. No third-party advertising trackers, no cross-site tracking, no fingerprinting.", "أحداث استخدام بسيطة (مثل «اكتملت القصة») لتحسين المنتج. بلا متتبعات إعلانية خارجية أو تتبع عبر المواقع أو بصمة الجهاز.")}</p>
        </>
      ),
    },
    {
      id: "storage",
      h: tx("Di mana datamu disimpan", "Where your data lives", "أين تُحفظ بياناتك"),
      body: (
        <p>{tx("Dalam versi ini, data keluargamu disimpan secara lokal di browser pada perangkat ini (local-first). Data tidak diunggah ke server kami. Jika kamu menghapus data browser atau berganti perangkat, data tidak akan ikut - gunakan ekspor di Pengaturan untuk menyimpan salinan. Saat sinkronisasi cloud diperkenalkan, kami akan meminta persetujuanmu terlebih dahulu dan memperbarui halaman ini.", "In this version, your family's data is stored locally in this browser on this device (local-first). It is not uploaded to our servers. If you clear your browser data or switch devices, it won't come with you - use export in Settings to keep a copy. When cloud sync is introduced we will ask for your consent first and update this page.", "في هذه النسخة، تُحفظ بيانات عائلتك محلياً في هذا المتصفح على هذا الجهاز. لا تُرفع إلى خوادمنا. إذا مسحت بيانات المتصفح أو غيّرت الجهاز فلن تنتقل معك - استخدم التصدير في الإعدادات للاحتفاظ بنسخة. عند إضافة المزامنة السحابية سنطلب موافقتك أولاً ونحدّث هذه الصفحة.")}</p>
      ),
    },
    {
      id: "consent",
      h: tx("Persetujuan & kontrol orang tua", "Parental consent & control", "موافقة الوالدين والتحكم"),
      body: (
        <>
          <p>{tx("Orang tua atau wali sah harus membuat akun dan memberikan persetujuan sebelum profil anak dibuat. Kami mencatat kapan persetujuan diberikan.", "A parent or legal guardian must create the account and give consent before any child profile is created. We record when consent was given.", "يجب أن ينشئ الوالد أو الوصي القانوني الحساب ويعطي الموافقة قبل إنشاء أي ملف طفل. نسجّل وقت إعطاء الموافقة.")}</p>
          <p>{tx("Orang tua mengontrol batas waktu layar, narasi, pengingat, dan PIN orang tua untuk area khusus orang tua. Ruang anak tidak memiliki chat, profil publik, tautan eksternal, atau pembelian.", "Parents control screen-time limits, narration, reminders and a parental PIN for parent-only areas. The kids' space has no chat, no public profiles, no external links and no purchases.", "يتحكم الوالدان في حدود وقت الشاشة والسرد والتذكيرات ورمز PIN للمناطق الخاصة بالوالدين. مساحة الأطفال بلا دردشة أو ملفات عامة أو روابط خارجية أو مشتريات.")}</p>
        </>
      ),
    },
    {
      id: "ai",
      h: tx("Pemrosesan AI", "AI processing", "معالجة الذكاء الاصطناعي"),
      body: (
        <>
          <p>{tx("Beberapa fitur (misalnya, menyesuaikan cerita atau asisten orang tua) mengirim permintaan ke Google Gemini melalui server kami. Permintaan berisi konten cerita, nilai yang dipilih, rentang usia, dan bahasa.", "Some features (for example, adapting a story or the parent assistant) send a request to Google Gemini through our server. The request contains the story content, the chosen value, age band and language.", "بعض الميزات (مثل تكييف قصة أو مساعد الوالدين) ترسل طلباً إلى Google Gemini عبر خادمنا. يتضمن الطلب محتوى القصة والقيمة المختارة والفئة العمرية واللغة.")}</p>
          <p>{tx("Tidak ada data pribadi anak yang dikirim, kecuali nama depan anak jika kamu memilih untuk mempersonalisasi cerita. Permintaan tidak kami gunakan untuk iklan. Output AI diperiksa terhadap sumber yang disetujui sebelum ditampilkan, dan AI tidak pernah menggantikan tinjauan ulama.", "No child personal data is sent, except a child's first name if you choose to personalise a story. Requests are not used by us for advertising. AI output is checked against approved sources before it is shown, and AI never replaces scholar review.", "لا تُرسل بيانات شخصية للطفل، باستثناء الاسم الأول إن اخترت تخصيص القصة. لا نستخدم الطلبات للإعلانات. يُفحص ناتج الذكاء الاصطناعي مقابل المصادر المعتمدة قبل عرضه، ولا يحل محل المراجعة العلمية.")}</p>
        </>
      ),
    },
    {
      id: "rights",
      h: tx("Penghapusan, ekspor & retensi", "Deletion, export & retention", "الحذف والتصدير ومدة الاحتفاظ"),
      body: (
        <>
          <p>
            {tx("Kamu bisa mengekspor semua data keluarga sebagai file, atau menghapus profil anak atau seluruh akunmu, dari ", "You can export all your family's data as a file, or delete a child profile or your whole account, from ", "يمكنك تصدير كل بيانات عائلتك في ملف، أو حذف ملف طفل أو حسابك كاملاً، من ")}
            {hasParent ? <Link to="/dashboard/settings" className="underline underline-offset-4 text-white">{tx("Pengaturan", "Settings", "الإعدادات")}</Link> : tx("Pengaturan", "Settings", "الإعدادات")}
            {tx(". Penghapusan bersifat langsung dan tidak bisa dibatalkan.", ". Deletion is immediate and cannot be undone.", ". الحذف فوري ولا يمكن التراجع عنه.")}
          </p>
          <p>{tx(`Kamu memilih berapa lama aktivitas belajar disimpan (default ${retention} bulan) di Pengaturan. Alamat email yang dikumpulkan untuk program 30 malam gratis hanya digunakan untuk program tersebut dan dihapus saat berhenti berlangganan.`, `You choose how long learning activity is kept (default ${retention} months) in Settings. Email addresses collected for the free 30-night program are used only for that program and removed when you unsubscribe.`, `تختار في الإعدادات مدة الاحتفاظ بنشاط التعلم (الافتراضي ${retention} شهراً). تُستخدم عناوين البريد المسجّلة لبرنامج الثلاثين ليلة لهذا البرنامج فقط وتُحذف عند إلغاء الاشتراك.`)}</p>
        </>
      ),
    },
    {
      id: "law",
      h: tx("Undang-undang privasi anak", "Children's privacy laws", "قوانين خصوصية الأطفال"),
      body: (
        <p>{tx("Kami mendesain berdasarkan prinsip COPPA (Amerika Serikat), GDPR dan UK Age Appropriate Design Code (GDPR-K), serta Undang-Undang Perlindungan Data Pribadi Indonesia (UU PDP No. 27/2022). Kewajiban hukum spesifik akan ditinjau bersama penasihat hukum untuk setiap pasar peluncuran sebelum peluncuran publik, dan halaman ini akan diperbarui sesuai.", "We design for the principles of COPPA (United States), GDPR and the UK Age Appropriate Design Code (GDPR-K), and Indonesia's Personal Data Protection Law (UU PDP No. 27/2022). Specific legal obligations will be reviewed with counsel for each launch market before public launch, and this page will be updated accordingly.", "نصمّم وفق مبادئ قانون COPPA (الولايات المتحدة) واللائحة الأوروبية GDPR وقواعد التصميم المناسب للعمر في المملكة المتحدة، وقانون حماية البيانات الشخصية الإندونيسي (رقم ٢٧/٢٠٢٢). ستُراجع الالتزامات القانونية مع مستشار قانوني لكل سوق قبل الإطلاق العام، وستُحدَّث هذه الصفحة.")}</p>
      ),
    },
    {
      id: "contact",
      h: tx("Kontak", "Contact", "التواصل"),
      body: (
        <p>{tx("Pertanyaan atau permintaan tentang data keluargamu: privacy@kidstorypedia.com. Kidstorypedia didukung oleh Yayasan Omah Dongeng Kalasan.", "Questions or requests about your family's data: privacy@kidstorypedia.com. Kidstorypedia is supported by Yayasan Omah Dongeng Kalasan.", "للاستفسارات أو الطلبات المتعلقة ببيانات عائلتك: privacy@kidstorypedia.com. كيدستوريبيديا بدعم من مؤسسة أوماه دونغينغ كالاسان.")}</p>
      ),
    },
  ];

  return (
    <PublicShell>
      <div className="px-5 sm:px-8 max-w-3xl mx-auto pt-10 pb-20">
        <span className="text-xs text-zinc-400 font-mono mb-3 block">[ {tx("Privasi & keamanan anak", "Privacy & child safety", "الخصوصية وسلامة الأطفال")} ]</span>
        <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">{tx("Privasi & keamanan anak", "Privacy & child safety", "الخصوصية وسلامة الأطفال")}</h1>
        <p className="text-zinc-400 mb-10">{tx("Ditulis untuk orang tua, dalam bahasa yang mudah dipahami.", "Written for parents, in plain language.", "مكتوبة للوالدين بلغة واضحة.")}</p>
        <nav className="mb-12 rounded-2xl border border-white/10 bg-zinc-900/50 p-5" aria-label={tx("Daftar isi", "Contents", "المحتويات")}>
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
        <p className="text-xs text-zinc-500 mt-16">{tx("Terakhir diperbarui: ", "Last updated: ", "آخر تحديث: ")}{new Date().getFullYear()}</p>
      </div>
    </PublicShell>
  );
}

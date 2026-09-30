/**
 * Indonesian (Bahasa Indonesia) text for the canonical stories.
 *
 * Kept as an overlay so the English/Arabic source data in `stories.ts` stays
 * untouched. `applyIndonesian()` merges these strings into each story's
 * Localized fields (`.id`). Arrays follow the same order as the source story.
 */

export interface StoryIdText {
  title: string;
  description: string;
  pages: { text: string; variants?: Partial<Record<"4-5" | "6-8" | "9-12", string>> }[];
  discussion: { questions: string[]; action: string; reflection: string; dua?: string };
  quiz?: { q: string; options: string[] }[];
  glossary?: { term: string; meaning: string }[];
  historicalContext?: string;
}

export const STORIES_ID: Record<string, StoryIdText> = {
  "yusuf-1": {
    title: "Nabi Yusuf (Bagian 1): Mimpi",
    description: "Belajar tentang sabar dan tawakal kepada Allah melalui masa kecil Nabi Yusuf.",
    pages: [
      {
        text: "Dahulu kala, di negeri Kanaan, hiduplah Nabi Ya'qub bersama dua belas putranya. Di antara mereka ada Yusuf, seorang anak yang hatinya penuh cahaya dan kebaikan.",
        variants: { "4-5": "Dahulu kala, Nabi Ya'qub punya dua belas anak laki-laki. Salah satunya bernama Yusuf. Yusuf sangat baik hati." },
      },
      {
        text: "Suatu malam, Yusuf bermimpi sesuatu yang menakjubkan. Ia melihat sebelas bintang, matahari, dan bulan bersujud kepadanya. Ia pun pergi menemui ayahnya untuk menceritakannya.",
        variants: { "4-5": "Suatu malam Yusuf bermimpi istimewa. Ia melihat sebelas bintang, matahari, dan bulan. Ia bercerita kepada ayahnya." },
      },
      {
        text: "Nabi Ya'qub berkata kepada putranya, 'Wahai anakku, janganlah engkau ceritakan mimpimu kepada saudara-saudaramu, nanti mereka membuat tipu daya terhadapmu.' Yusuf mendengarkan nasihat bijak ayahnya.",
        variants: { "4-5": "Ayahnya berkata, 'Rahasiakan mimpimu dari saudara-saudaramu.' Yusuf mendengarkan ayahnya." },
      },
    ],
    discussion: {
      questions: [
        "Mengapa Nabi Ya'qub meminta Yusuf untuk tidak menceritakan mimpinya?",
        "Bagaimana kita bisa bersabar saat sedang sangat bersemangat akan sesuatu?",
        "Kepada siapa kamu bisa meminta nasihat yang baik, seperti Yusuf kepada ayahnya?",
      ],
      action: "Hari ini, saat kamu ingin sesuatu segera, tunggulah dengan tenang dan ucapkan 'Insya Allah'.",
      reflection: "Kapan hari ini kamu perlu bersabar?",
      dua: "Maka kesabaran yang baik itulah (kesabaranku).",
    },
    quiz: [
      { q: "Apa yang dilihat Yusuf dalam mimpinya?", options: ["Sebelas bintang, matahari, dan bulan", "Sebuah kapal besar", "Sebuah taman"] },
      { q: "Kepada siapa Yusuf menceritakan mimpinya?", options: ["Saudara-saudaranya", "Ayahnya", "Tidak kepada siapa pun"] },
    ],
    glossary: [{ term: "Kanaan", meaning: "Nama lama untuk sebuah negeri di dekat Palestina." }, { term: "Nabi", meaning: "Orang yang dipilih Allah untuk membimbing manusia." }],
    historicalContext: "Surah Yusuf disebut dalam Al-Qur'an sebagai 'kisah yang paling baik' (12:3).",
  },

  "nuh-1": {
    title: "Nabi Nuh: Bahtera yang Besar",
    description: "Kisah tentang ketekunan dan iman yang luar biasa meski terus diejek.",
    pages: [
      { text: "Nabi Nuh mengajak kaumnya menyembah Allah saja dalam waktu yang sangat, sangat lama, seribu tahun kurang lima puluh. Hanya sedikit yang beriman, tetapi beliau tidak pernah menyerah." },
      { text: "Allah memerintahkan Nuh membuat sebuah kapal besar, yaitu bahtera. Ketika orang-orang lewat, mereka menertawakannya. Tetapi Nuh terus membangun, percaya kepada Allah." },
      { text: "Ketika air datang, Nuh berkata, 'Naiklah kalian ke dalamnya dengan menyebut nama Allah pada waktu berlayar dan berlabuhnya.' Orang-orang beriman dan hewan-hewan berpasangan pun selamat." },
    ],
    discussion: {
      questions: [
        "Apa yang akan kamu lakukan jika orang lain lama tidak mau mendengarkanmu?",
        "Bagaimana Nabi Nuh menunjukkan keberanian saat ditertawakan?",
        "Hal sulit apa yang bisa terus kamu usahakan minggu ini?",
      ],
      action: "Pilih satu tugas yang sulit hari ini dan selesaikan tanpa menyerah.",
      reflection: "Kapan hari ini kamu ingin menyerah, dan apa yang membuatmu tetap bertahan?",
      dua: "Dengan nama Allah pada waktu berlayar dan berlabuhnya.",
    },
    quiz: [
      { q: "Apa yang Allah perintahkan kepada Nuh untuk dibuat?", options: ["Sebuah rumah", "Bahtera (kapal besar)", "Sebuah tembok"] },
      { q: "Apa yang dilakukan Nuh saat orang-orang menertawakannya?", options: ["Ia berhenti", "Ia terus membangun"] },
    ],
    glossary: [{ term: "bahtera", meaning: "Kapal yang sangat besar." }],
  },

  "yunus-1": {
    title: "Nabi Yunus dan Ikan Paus",
    description: "Di tempat yang paling gelap, Yunus mengingat Allah, dan Allah menjawabnya.",
    pages: [
      {
        text: "Nabi Yunus mengajak kaumnya kepada Allah, tetapi mereka tidak mau mendengar. Yunus meninggalkan mereka dalam keadaan marah dan naik ke sebuah kapal.",
        variants: { "4-5": "Kaum Yunus tidak mau mendengar. Yunus kecewa, lalu ia naik kapal." },
      },
      {
        text: "Badai datang dan Yunus terlempar ke laut. Seekor ikan paus besar menelannya. Di dalam perut ikan itu gelap, di dalam laut, pada malam hari.",
        variants: { "4-5": "Yunus jatuh ke laut dan seekor ikan paus besar menelannya. Di sana gelap sekali." },
      },
      {
        text: "Dalam kegelapan itu Yunus berseru: 'Tidak ada tuhan selain Engkau, Mahasuci Engkau, sungguh aku termasuk orang-orang yang zalim.' Allah mendengarnya dan menyelamatkannya dari kesedihan.",
        variants: { "4-5": "Yunus meminta maaf kepada Allah dan memuji-Nya. Allah mendengar Yunus dan menyelamatkannya." },
      },
    ],
    discussion: {
      questions: [
        "Apa yang dilakukan Yunus ketika berada dalam kegelapan?",
        "Mengapa meminta maaf itu baik ketika kita berbuat salah?",
        "Ketika kamu merasa takut atau sedih, apa yang bisa kamu ucapkan kepada Allah?",
      ],
      action: "Jika hari ini kamu berbuat salah, minta maaflah kepada orang itu dan berdoalah.",
      reflection: "Adakah sesuatu yang ingin kamu mintakan maaf hari ini?",
      dua: "Tidak ada tuhan selain Engkau, Mahasuci Engkau, sungguh aku termasuk orang-orang yang zalim.",
    },
    quiz: [
      { q: "Apa yang menelan Yunus?", options: ["Seekor ikan paus", "Sebuah ombak", "Seekor burung"] },
      { q: "Siapa yang menyelamatkan Yunus?", options: ["Para pelaut", "Allah"] },
    ],
  },

  "ibrahim-kabah": {
    title: "Ibrahim dan Ismail Membangun Rumah Allah",
    description: "Seorang ayah dan anaknya bekerja sama untuk Allah dan memohon agar amal mereka diterima.",
    pages: [
      { text: "Nabi Ibrahim dan putranya Ismail diberi tugas penting: meninggikan fondasi Rumah Allah, yaitu Ka'bah, di Makkah." },
      { text: "Batu demi batu, mereka bekerja bersama. Pekerjaan itu berat di bawah terik matahari, tetapi mereka tidak mengeluh." },
      { text: "Sambil membangun, mereka berdoa: 'Ya Tuhan kami, terimalah (amal) dari kami. Sungguh, Engkaulah Yang Maha Mendengar, Maha Mengetahui.' Mereka tidak menyombongkan diri, mereka memohon agar Allah menerima." },
    ],
    discussion: {
      questions: [
        "Bagaimana Ibrahim dan Ismail saling membantu?",
        "Mengapa mereka memohon agar Allah menerima amal mereka, bukan menyombongkannya?",
        "Pekerjaan rumah apa yang bisa kita kerjakan bersama sebagai keluarga?",
      ],
      action: "Kerjakan satu tugas rumah bersama orang tua hari ini, dari awal sampai selesai.",
      reflection: "Bagaimana rasanya menyelesaikan pekerjaan bersama-sama?",
      dua: "Ya Tuhan kami, terimalah (amal) dari kami. Sungguh, Engkaulah Yang Maha Mendengar, Maha Mengetahui.",
    },
    quiz: [
      { q: "Apa yang dibangun Ibrahim dan Ismail?", options: ["Ka'bah", "Sebuah kapal"] },
    ],
  },

  "musa-sea": {
    title: "Nabi Musa di Tepi Laut",
    description: "Dengan laut di depan dan pasukan di belakang, Musa yakin Allah bersamanya.",
    pages: [
      { text: "Nabi Musa memimpin Bani Israil keluar dari Mesir pada malam hari, menjauh dari kekejaman Fir'aun." },
      { text: "Mereka sampai di tepi laut. Di belakang mereka datang pasukan Fir'aun. Orang-orang berseru, 'Kita pasti akan tersusul!'" },
      { text: "Musa berkata, 'Sekali-kali tidak! Sesungguhnya Tuhanku bersamaku, Dia akan memberi petunjuk kepadaku.' Allah menyuruhnya memukul laut dengan tongkatnya, lalu laut terbelah menjadi jalan yang kering." },
    ],
    discussion: {
      questions: [
        "Apa yang dirasakan orang-orang ketika melihat pasukan itu?",
        "Apa yang dikatakan Musa yang menunjukkan keberaniannya?",
        "Apa yang terasa menakutkan bagimu? Bagaimana mengingat Allah bisa membantu?",
      ],
      action: "Cobalah satu hal kecil yang berani hari ini, seperti berbicara di kelas atau mencoba makanan baru, dan ucapkan Bismillah dulu.",
      reflection: "Hal berani apa yang kamu lakukan hari ini?",
      dua: "Sesungguhnya Tuhanku bersamaku, Dia akan memberi petunjuk kepadaku.",
    },
  },

  "sulaiman-ant": {
    title: "Nabi Sulaiman dan Semut",
    description: "Seorang raja besar mendengar seekor semut kecil, lalu tersenyum dan bersyukur.",
    pages: [
      { text: "Nabi Sulaiman adalah seorang raja dengan pasukan yang besar. Allah mengajarinya memahami bahasa burung dan hewan." },
      { text: "Ketika pasukannya melewati lembah semut, seekor semut berseru: 'Wahai semut-semut, masuklah ke sarang kalian, agar kalian tidak diinjak Sulaiman dan pasukannya tanpa mereka sadari!'" },
      { text: "Sulaiman tersenyum mendengar perkataan semut itu. Bukannya merasa sombong, ia bersyukur kepada Allah: 'Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau berikan kepadaku.'" },
    ],
    discussion: {
      questions: [
        "Bagaimana semut kecil itu menjaga semut-semut lainnya?",
        "Sulaiman adalah raja yang kuat. Apa yang ia lakukan, bukannya sombong?",
        "Bagaimana kita bisa bersikap lembut kepada makhluk-makhluk kecil?",
      ],
      action: "Sebutkan tiga nikmat yang Allah berikan kepadamu hari ini dan ucapkan Alhamdulillah untuk masing-masing.",
      reflection: "Makhluk kecil apa yang kamu perhatikan hari ini?",
      dua: "Ya Tuhanku, anugerahkanlah aku ilham untuk tetap mensyukuri nikmat-Mu yang telah Engkau berikan kepadaku.",
    },
  },

  "al-amin": {
    title: "Al-Amin: Orang yang Dapat Dipercaya",
    description: "Bahkan sebelum menjadi Nabi, penduduk Makkah sangat memercayai Muhammad ﷺ.",
    pages: [
      { text: "Di Makkah, Muhammad ﷺ muda dikenal selalu berkata jujur dan menjaga amanah yang dititipkan kepadanya. Orang-orang memanggilnya 'Al-Amin', yang artinya orang yang dapat dipercaya." },
      { text: "Ketika suku-suku Quraisy membangun kembali Ka'bah, mereka berselisih tentang siapa yang berhak meletakkan Hajar Aswad. Perselisihan itu menjadi sangat serius." },
      { text: "Mereka sepakat membiarkan orang pertama yang masuk untuk memutuskan. Ternyata ia adalah Al-Amin! Beliau meletakkan batu itu di atas sehelai kain, meminta pemimpin setiap suku memegang ujungnya, lalu beliau sendiri yang meletakkannya di tempatnya. Semua orang merasa puas." },
    ],
    discussion: {
      questions: [
        "Mengapa orang-orang memanggil Nabi ﷺ 'Al-Amin'?",
        "Bagaimana ide beliau membuat semua orang merasa dilibatkan?",
        "Apa yang pernah dipercayakan seseorang kepadamu? Bagaimana kamu menjaganya?",
      ],
      action: "Tepati satu janji hari ini, meskipun kecil, lalu ceritakan kepada orang tuamu setelah kamu melakukannya.",
      reflection: "Bagaimana perasaanmu ketika seseorang menepati janjinya kepadamu?",
    },
  },

  "hijrah-cave": {
    title: "Gua Tsur",
    description: "Dalam perjalanan hijrah, Nabi ﷺ menenangkan sahabatnya: 'Allah bersama kita.'",
    pages: [
      { text: "Ketika Nabi ﷺ diperintahkan meninggalkan Makkah menuju Madinah, sahabat dekatnya Abu Bakar ikut menemani perjalanan beliau." },
      { text: "Mereka bersembunyi di sebuah gua bernama Tsur. Orang-orang yang mencari mereka datang mendekat, begitu dekat sampai Abu Bakar khawatir akan keselamatan Nabi ﷺ." },
      { text: "Nabi ﷺ berkata kepadanya, 'Jangan bersedih, sesungguhnya Allah bersama kita.' Allah menurunkan ketenangan, dan mereka melanjutkan perjalanan dengan selamat." },
    ],
    discussion: {
      questions: [
        "Mengapa Abu Bakar merasa khawatir di dalam gua?",
        "Kata-kata apa yang digunakan Nabi ﷺ untuk menenangkan sahabatnya?",
        "Bagaimana kamu bisa menghibur teman yang sedang khawatir?",
      ],
      action: "Ketika ada anggota keluarga yang merasa khawatir hari ini, ingatkan ia dengan lembut bahwa Allah bersama kita.",
      reflection: "Apa yang membuatmu merasa tenang ketika sedang khawatir?",
      dua: "Jangan bersedih, sesungguhnya Allah bersama kita.",
    },
  },

  "taif-mercy": {
    title: "Hari di Thaif",
    description: "Disakiti dan ditolak, Nabi ﷺ memilih kasih sayang dan harapan, bukan balas dendam.",
    pages: [
      { text: "Nabi ﷺ pergi ke kota Thaif untuk mengajak penduduknya kepada Allah. Tetapi mereka menolak beliau dengan kasar dan menyuruh orang-orang mengusir beliau." },
      { text: "Dalam keadaan lelah dan sedih, beliau didatangi malaikat Jibril bersama malaikat penjaga gunung, yang menawarkan untuk menimpakan gunung-gunung ke atas kota itu." },
      { text: "Tetapi Nabi ﷺ menolak. Beliau berharap dari keturunan mereka akan lahir orang-orang yang menyembah Allah saja. Beliau memilih kasih sayang." },
    ],
    discussion: {
      questions: [
        "Menurutmu bagaimana perasaan Nabi ﷺ setelah peristiwa Thaif?",
        "Beliau bisa saja memilih membalas. Apa yang beliau pilih, dan mengapa?",
        "Adakah seseorang yang bisa kamu maafkan minggu ini?",
      ],
      action: "Jika ada yang membuatmu kesal hari ini, tarik napas dan pilihlah tanggapan yang baik.",
      reflection: "Bagaimana rasanya memaafkan daripada terus marah?",
      dua: "Ya Tuhan kami, ampunilah kami dan saudara-saudara kami ... dan janganlah Engkau tanamkan kedengkian dalam hati kami.",
    },
  },

  "abubakr-generosity": {
    title: "Abu Bakar Memberikan Segalanya",
    description: "Ketika Nabi ﷺ mengajak bersedekah, Abu Bakar dan Umar berlomba-lomba dalam kebaikan.",
    pages: [
      { text: "Suatu hari Nabi ﷺ mengajak para sahabat untuk bersedekah. Umar berpikir, 'Hari ini aku akan mengalahkan Abu Bakar dalam kebaikan!' Ia membawa setengah dari hartanya." },
      { text: "Nabi ﷺ bertanya kepada Umar, 'Apa yang kamu tinggalkan untuk keluargamu?' Ia menjawab, 'Sebanyak ini juga.' Kemudian Abu Bakar datang membawa seluruh hartanya." },
      { text: "'Apa yang kamu tinggalkan untuk keluargamu?' Abu Bakar menjawab, 'Aku tinggalkan untuk mereka Allah dan Rasul-Nya.' Umar berkata ia tidak akan pernah bisa mengungguli Abu Bakar dalam kebaikan." },
    ],
    discussion: {
      questions: [
        "'Perlombaan' seperti apa yang dilakukan Umar dan Abu Bakar?",
        "Mengapa berlomba dalam kebaikan lebih baik daripada berlomba memiliki lebih banyak?",
        "Apa yang bisa keluarga kita berikan atau bagikan minggu ini?",
      ],
      action: "Pilih salah satu barangmu yang masih bagus untuk diberikan kepada orang yang membutuhkan.",
      reflection: "Bagaimana perasaanmu setelah memberi?",
      dua: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.",
    },
  },

  "bilal-ahad": {
    title: "Bilal: Ahad, Ahad",
    description: "Bilal teguh memegang imannya, dan kelak menjadi muazin pertama dalam Islam.",
    pages: [
      { text: "Bilal adalah salah satu orang pertama di Makkah yang beriman kepada Allah. Tuannya marah dan berusaha memaksanya meninggalkan imannya." },
      { text: "Bahkan ketika diperlakukan dengan keras di bawah terik matahari, Bilal terus mengulang: 'Ahad, Ahad', Allah Maha Esa, Allah Maha Esa." },
      { text: "Abu Bakar menebus kemerdekaan Bilal. Bertahun-tahun kemudian, di Madinah, suara Bilal yang indah dipilih untuk mengumandangkan azan bagi kaum Muslimin." },
    ],
    discussion: {
      questions: [
        "Kata-kata apa yang terus diucapkan Bilal, dan apa artinya?",
        "Bagaimana Abu Bakar menolong Bilal?",
        "Apa artinya tetap teguh pada hal yang benar?",
      ],
      action: "Dengarkan azan berikutnya bersama-sama dan ulangi lafaznya dengan pelan.",
      reflection: "Kapan terasa sulit melakukan hal yang benar ketika orang lain tidak melakukannya?",
      dua: "Ya Tuhan kami, janganlah Engkau condongkan hati kami kepada kesesatan setelah Engkau beri petunjuk kepada kami.",
    },
  },

  "uthman-well": {
    title: "Utsman dan Sumur Rumah",
    description: "Kota yang kehausan, satu sumur, dan seorang sahabat yang menggratiskannya untuk semua orang.",
    pages: [
      { text: "Di Madinah, air bersih sulit didapat. Ada sebuah sumur bernama Rumah, tetapi orang-orang harus membayar untuk minum darinya." },
      { text: "Nabi ﷺ menganjurkan agar ada yang membeli sumur itu untuk kaum Muslimin. Utsman bin Affan membelinya dengan hartanya sendiri." },
      { text: "Utsman menjadikan airnya gratis untuk semua orang, baik yang kaya maupun yang miskin. Kini setiap keluarga bisa minum." },
    ],
    discussion: {
      questions: [
        "Mengapa sumur itu sangat penting bagi penduduk Madinah?",
        "Bagaimana kedermawanan Utsman menolong banyak orang sekaligus?",
        "Apa yang kita gunakan setiap hari yang mungkin tidak dimiliki orang lain?",
      ],
      action: "Hemat air hari ini: matikan keran saat menggosok gigi.",
      reflection: "Siapa yang bisa dibantu keluarga kita dengan sesuatu yang mereka butuhkan?",
      dua: "Ya Tuhan kami, terimalah (amal) dari kami. Sungguh, Engkaulah Yang Maha Mendengar, Maha Mengetahui.",
    },
  },

  "fable-1": {
    title: "Semut yang Bersyukur",
    description: "Seekor semut kecil belajar pelajaran besar tentang mengucapkan Alhamdulillah.",
    pages: [
      {
        text: "Di sebuah sarang semut yang sibuk, Zaid si semut kecil menemukan remah roti yang besar. 'Alhamdulillah!' serunya, karena ia ingat bahwa setiap rezeki datang dari Allah.",
        variants: { "4-5": "Zaid si semut menemukan roti. Ia berkata, 'Alhamdulillah!'" },
      },
      { text: "Remah roti itu terlalu besar untuk dibawa sendirian. Teman-teman Zaid datang membantu, dan bersama-sama mereka membawanya pulang." },
      { text: "Di rumah, Zaid membagikan roti itu kepada semua yang telah membantu. 'Allah memberikannya kepadaku, jadi aku ingin berbagi,' katanya dengan gembira." },
    ],
    discussion: {
      questions: [
        "Apa yang sebaiknya kita ucapkan ketika menerima sesuatu yang baik?",
        "Bagaimana Zaid berterima kasih kepada teman-temannya?",
        "Apa satu hal yang kamu syukuri hari ini?",
      ],
      action: "Saat makan malam nanti, setiap orang menyebutkan satu hal yang mereka syukuri.",
      reflection: "Apa yang membuatmu mengucapkan Alhamdulillah hari ini?",
      dua: "Segala puji bagi Allah, Tuhan semesta alam.",
    },
    quiz: [
      { q: "Apa yang diucapkan Zaid ketika menemukan roti?", options: ["Alhamdulillah", "Tidak mengucapkan apa-apa"] },
    ],
  },

  "tariq-coin": {
    title: "Tariq dan Koin yang Hilang",
    description: "Tariq menemukan koin berkilau di pasar. Menyimpannya memang mudah, tapi apakah itu benar?",
    pages: [
      { text: "Tariq sedang berjalan di pasar bersama ibunya ketika ia melihat sebuah koin berkilau di tanah." },
      { text: "'Aku bisa membeli jajanan!' pikirnya. Lalu ia melihat seorang kakek sedang mencari-cari di tanah dengan wajah cemas." },
      { text: "Tariq berlari menghampirinya. 'Kek, apakah ini milik Kakek?' Kakek itu tersenyum lega. 'Terima kasih, Nak. Kamu anak yang jujur.' Hati Tariq terasa ringan dan bahagia." },
    ],
    discussion: {
      questions: [
        "Apa yang awalnya ingin Tariq lakukan dengan koin itu?",
        "Menurutmu bagaimana perasaan kakek itu ketika koinnya kembali?",
        "Apa yang sebaiknya kita lakukan jika menemukan barang yang bukan milik kita?",
      ],
      action: "Hari ini, berkatalah jujur meskipun sulit, lalu ceritakan kepada orang tuamu nanti malam.",
      reflection: "Kapan hari ini kamu memilih untuk jujur?",
    },
    quiz: [
      { q: "Apa yang dilakukan Tariq dengan koin itu?", options: ["Membeli jajanan", "Mengembalikannya"] },
    ],
  },

  "little-gardener": {
    title: "Janji Si Tukang Kebun Kecil",
    description: "Aisyah berjanji menyiram tanaman tetangganya. Apa yang terjadi saat ia lebih ingin bermain?",
    pages: [
      { text: "Bibi Khadijah akan bepergian. 'Aisyah, maukah kamu menyiram tanamanku setiap hari?' Aisyah mengangguk: 'Aku janji, insya Allah!'" },
      { text: "Pada hari ketiga, teman-teman Aisyah mengajaknya bermain. Matahari sangat terik. Ia teringat tanaman-tanaman yang kehausan." },
      { text: "Aisyah menyiram tanaman terlebih dahulu, baru kemudian pergi bermain. Ketika Bibi Khadijah pulang, kebunnya tetap hijau. 'Kamu menepati janjimu!' katanya." },
    ],
    discussion: {
      questions: [
        "Apa yang dijanjikan Aisyah?",
        "Mengapa sulit menepati janjinya pada hari ketiga?",
        "Apa satu tugas yang menjadi tanggung jawabmu di rumah?",
      ],
      action: "Pilih satu tugas harian (seperti menyiram tanaman) dan kerjakan setiap hari minggu ini.",
      reflection: "Bagaimana rasanya menyelesaikan tugasmu sebelum bermain?",
    },
  },

  "kind-words": {
    title: "Kekuatan Kata-Kata yang Baik",
    description: "Adik Yusra merobohkan menaranya. Akankah ia berteriak, atau memilih kata-kata yang baik?",
    pages: [
      { text: "Yusra menghabiskan sepanjang pagi membangun menara balok yang tinggi. Itu menara terbaiknya!" },
      { text: "Brak! Adiknya, Hamzah, menabraknya. Balok berserakan di mana-mana. Yusra merasa wajahnya panas karena marah." },
      { text: "Yusra menarik napas dalam-dalam dan berkata, 'Tidak apa-apa, Hamzah. Ayo kita bangun yang lebih besar bersama-sama.' Hamzah tersenyum, dan mereka membangun menara paling tinggi yang pernah ada." },
    ],
    discussion: {
      questions: [
        "Bagaimana perasaan Yusra ketika menaranya roboh?",
        "Apa yang ia lakukan untuk menenangkan diri?",
        "Kata-kata baik apa yang bisa kamu ucapkan ketika merasa kesal?",
      ],
      action: "Latihan: ketika kamu merasa marah hari ini, tarik napas pelan tiga kali sebelum berbicara.",
      reflection: "Kapan hari ini kata-kata yang baik membuat seseorang tersenyum?",
    },
  },
};

import type { Story } from "@/types";

/** Merge Indonesian strings into a story's Localized fields. */
export function applyIndonesian(s: Story): Story {
  const t = STORIES_ID[s.id];
  if (!t) return s;
  const withId = <T extends { en: string }>(x: T, id?: string): T => (id ? { ...x, id } : x);
  return {
    ...s,
    title: withId(s.title, t.title),
    description: withId(s.description, t.description),
    historicalContext: s.historicalContext && withId(s.historicalContext, t.historicalContext),
    pages: s.pages.map((p, i) => {
      const tp = t.pages[i];
      if (!tp) return p;
      const variants = p.variants
        ? Object.fromEntries(Object.entries(p.variants).map(([band, v]) => [band, v && withId(v, tp.variants?.[band as "4-5"])]))
        : p.variants;
      return { ...p, text: withId(p.text, tp.text), variants };
    }),
    discussion: {
      ...s.discussion,
      questions: s.discussion.questions.map((q, i) => withId(q, t.discussion.questions[i])),
      action: withId(s.discussion.action, t.discussion.action),
      reflection: withId(s.discussion.reflection, t.discussion.reflection),
      dua: s.discussion.dua && { ...s.discussion.dua, meaning: withId(s.discussion.dua.meaning, t.discussion.dua) },
    },
    quiz: s.quiz?.map((q, i) => ({
      ...q,
      q: withId(q.q, t.quiz?.[i]?.q),
      options: q.options.map((o, j) => withId(o, t.quiz?.[i]?.options[j])),
    })),
    glossary: s.glossary?.map((g, i) => {
      const tg = t.glossary?.[i];
      return tg ? { ...g, termId: tg.term, meaning: withId(g.meaning, tg.meaning) } : g;
    }),
  };
}

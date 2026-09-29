export type StoryCategory = "Prophets" | "Seerah" | "Sahabah" | "Fables";
export type CoreValue = "Honesty" | "Patience" | "Gratitude" | "Courage" | "Generosity";

export interface Story {
  id: string;
  title: string;
  titleAr?: string;
  category: StoryCategory;
  description: string;
  descriptionAr?: string;
  coverImage: string;
  durationMin: number;
  coreValues: CoreValue[];
  content: {
    page: number;
    text: string;
    textAr?: string;
    image: string;
    audioUrl?: string; // Mock audio
  }[];
  discussionPrompts: string[];
  discussionPromptsAr?: string[];
}

export const MOCK_STORIES: Story[] = [
  {
    id: "yusuf-1",
    title: "Prophet Yusuf (Part 1): The Dream",
    titleAr: "النبي يوسف (الجزء الأول): الرؤيا",
    category: "Prophets",
    description: "Learn about patience and trust in Allah through the early life of Prophet Yusuf.",
    descriptionAr: "تعلم عن الصبر والتوكل على الله من خلال الحياة المبكرة للنبي يوسف.",
    coverImage: "https://i.pinimg.com/1200x/21/ab/76/21ab76bd4cadf77c0d05ba82d636746f.jpg",
    durationMin: 10,
    coreValues: ["Patience", "Honesty"],
    content: [
      {
        page: 1,
        text: "Long ago, in the land of Canaan, lived Prophet Yaqub and his twelve sons. Among them was Yusuf, a boy with a heart full of light and a face shining with kindness.",
        textAr: "منذ زمن بعيد، في أرض كنعان، عاش النبي يعقوب وأبناؤه الاثني عشر. وكان من بينهم يوسف، صبي قلبه مليء بالنور ووجهه يشرق باللطف.",
        image: "https://i.pinimg.com/1200x/21/ab/76/21ab76bd4cadf77c0d05ba82d636746f.jpg",
      },
      {
        page: 2,
        text: "One night, Yusuf had a wondrous dream. He saw eleven stars, the sun, and the moon bowing down to him. He ran to his father to share this amazing sight.",
        textAr: "في إحدى الليالي، رأى يوسف حلماً عجيباً. رأى أحد عشر كوكباً والشمس والقمر يسجدون له. فركض إلى والده ليشاركه هذا المشهد المذهل.",
        image: "https://i.pinimg.com/1200x/21/ab/76/21ab76bd4cadf77c0d05ba82d636746f.jpg",
      },
      {
        page: 3,
        text: "Prophet Yaqub smiled but warned his son, 'O my dear son, do not relate your vision to your brothers, or they will plot against you.' This taught Yusuf the value of patience and keeping secrets when necessary.",
        textAr: "ابتسم النبي يعقوب لكنه حذر ابنه قائلاً: 'يا بني لا تقصص رؤياك على إخوتك فيكيدوا لك كيداً'. علم هذا يوسف قيمة الصبر وكتمان الأسرار عند الضرورة.",
        image: "https://i.pinimg.com/1200x/21/ab/76/21ab76bd4cadf77c0d05ba82d636746f.jpg",
      }
    ],
    discussionPrompts: [
      "Why did Prophet Yaqub tell Yusuf not to share his dream?",
      "How can we show patience when we are excited about something?",
      "What do you think the eleven stars represented?"
    ],
    discussionPromptsAr: [
      "لماذا طلب النبي يعقوب من يوسف ألا يشارك حلمه؟",
      "كيف يمكننا إظهار الصبر عندما نكون متحمسين لشيء ما؟",
      "ماذا تعتقد أن الأحد عشر كوكباً كانت تمثل؟"
    ]
  },
  {
    id: "nuh-1",
    title: "Prophet Nuh: The Great Ark",
    titleAr: "النبي نوح: السفينة العظيمة",
    category: "Prophets",
    description: "A story of incredible perseverance and faith in the face of mockery.",
    descriptionAr: "قصة عن المثابرة المذهلة والإيمان في وجه السخرية.",
    coverImage: "https://i.pinimg.com/1200x/61/80/91/61809156c147c511cdc29785ea6589b9.jpg",
    durationMin: 15,
    coreValues: ["Patience", "Courage"],
    content: [
      {
        page: 1,
        text: "Prophet Nuh preached to his people for 950 years, but only a few believed. Yet, he never gave up hope and continued to invite them to the truth with patience.",
        textAr: "دعا النبي نوح قومه لمدة ٩٥٠ عاماً، لكن القليل منهم آمن. ومع ذلك، لم يفقد الأمل أبداً واستمر في دعوتهم إلى الحق بصبر.",
        image: "https://i.pinimg.com/1200x/61/80/91/61809156c147c511cdc29785ea6589b9.jpg",
      }
    ],
    discussionPrompts: [
      "What would you do if people didn't listen to you for a long time?",
      "How did Prophet Nuh show courage?"
    ],
    discussionPromptsAr: [
      "ماذا ستفعل إذا لم يستمع الناس إليك لفترة طويلة؟",
      "كيف أظهر النبي نوح الشجاعة؟"
    ]
  },
  {
    id: "fable-1",
    title: "The Grateful Ant",
    titleAr: "النملة الشاكرة",
    category: "Fables",
    description: "A tiny ant learns a big lesson about saying Alhamdulillah.",
    descriptionAr: "نملة صغيرة تتعلم درساً كبيراً عن قول الحمد لله.",
    coverImage: "https://i.pinimg.com/736x/41/39/61/413961dcfc707e3af434ea5f7fe9e1d4.jpg",
    durationMin: 5,
    coreValues: ["Gratitude"],
    content: [
      {
        page: 1,
        text: "In a bustling anthill, little Zayd the ant found a massive crumb of bread. 'Alhamdulillah!' he cheered, realizing that every provision comes from Allah.",
        textAr: "في تلة نمل مزدحمة، وجد النملة الصغير زيد فتات خبز ضخمة. هتف قائلاً: 'الحمد لله!'، مدركاً أن كل رزق يأتي من الله.",
        image: "https://i.pinimg.com/736x/41/39/61/413961dcfc707e3af434ea5f7fe9e1d4.jpg",
      }
    ],
    discussionPrompts: [
      "What should we say when we receive something good?",
      "How can we be grateful like Zayd the ant?"
    ],
    discussionPromptsAr: [
      "ماذا يجب أن نقول عندما نتلقى شيئاً جيداً؟",
      "كيف يمكننا أن نكون شاكرين مثل النملة زيد؟"
    ]
  }
];

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  badges: string[];
  completedStories: string[];
  characterProgress: Record<CoreValue, number>; // 0 to 100
}

export const MOCK_CHILD: ChildProfile = {
  id: "child-1",
  name: "Ahmad",
  age: 7,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad&backgroundColor=b6e3f4",
  badges: ["Truthful One", "Patience Guardian", "Heart of Gratitude", "Nightly Reciter"],
  completedStories: ["yusuf-1", "fable-1", "nuh-1"],
  characterProgress: {
    Honesty: 85,
    Patience: 70,
    Gratitude: 90,
    Courage: 65,
    Generosity: 80
  }
};

export const MOCK_CHILDREN: ChildProfile[] = [
  MOCK_CHILD,
  {
    id: "child-2",
    name: "Maryam",
    age: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maryam&backgroundColor=ffd5dc",
    badges: ["Heart of Gratitude", "Kind Companion"],
    completedStories: ["fable-1"],
    characterProgress: {
      Honesty: 75,
      Patience: 60,
      Gratitude: 95,
      Courage: 50,
      Generosity: 85
    }
  },
  {
    id: "child-3",
    name: "Zayd",
    age: 9,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zayd&backgroundColor=c0ebd7",
    badges: ["Truthful One", "Courageous Explorer", "Seerah Scholar"],
    completedStories: ["yusuf-1", "nuh-1"],
    characterProgress: {
      Honesty: 90,
      Patience: 80,
      Gratitude: 75,
      Courage: 85,
      Generosity: 70
    }
  }
];

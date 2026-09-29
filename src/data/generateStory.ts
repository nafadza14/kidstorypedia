import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "./mock";

export async function generateStory(apiKey: string, language: 'en' | 'ar' = 'en'): Promise<Story> {
  const ai = new GoogleGenAI({ apiKey });

  console.log("Generating story text...");
  
  const prompt = language === 'ar' 
    ? "اكتب قصة إسلامية قصيرة للأطفال (3 صفحات) عن الصدق لطفل عمره 6 سنوات. الشخصية الرئيسية هي صبي اسمه طارق يجد عملة معدنية مفقودة. أرجع JSON مع titleAr, descriptionAr, coreValues (مصفوفة نصوص إنجليزية), و content (مصفوفة كائنات تحتوي على 'page' رقم، 'textAr' نص، و 'imagePrompt' نص بالإنجليزية يصف المشهد للرسام)."
    : "Write a short Islamic children's story (3 pages) about Honesty for a 6-year-old. The main character is a boy named Tariq who finds a lost coin. Return JSON with title, description, coreValues (array of strings), and content (array of objects with 'page' number, 'text' string, and 'imagePrompt' string describing the scene for an illustrator).";

  const textResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          titleAr: { type: Type.STRING },
          description: { type: Type.STRING },
          descriptionAr: { type: Type.STRING },
          coreValues: { type: Type.ARRAY, items: { type: Type.STRING } },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                page: { type: Type.INTEGER },
                text: { type: Type.STRING },
                textAr: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  const storyData = JSON.parse(textResponse.text || "{}");
  console.log("Story generated:", storyData.title || storyData.titleAr);

  const finalContent = [];
  const stylePrompt = "Children's book illustration. Islamic theme. VERY IMPORTANT: Characters MUST be completely FACELESS (blank faces, no eyes, no nose, no mouth, just smooth skin tone). Cute rounded characters wearing modest Islamic clothing (kufi for boys, hijab for girls). Soft warm pastel colors, cozy atmosphere, clean vector art style.";

  // Generate Cover Image
  console.log("Generating cover image...");
  const coverPrompt = `${stylePrompt} Scene: ${storyData.title || storyData.titleAr}. A young Muslim boy named Tariq holding a shiny coin, looking thoughtful.`;
  let coverUrl = "https://picsum.photos/seed/tariq-cover/800/600";
  try {
    const coverRes = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: coverPrompt,
      config: { imageConfig: { aspectRatio: "4:3", imageSize: "1K" } }
    });
    
    let coverBase64 = "";
    for (const part of coverRes.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        coverBase64 = part.inlineData.data;
        break;
      }
    }
    if (coverBase64) {
      coverUrl = `data:image/png;base64,${coverBase64}`;
    }
  } catch (e: any) {
    console.error("Failed to generate cover:", e.message);
  }

  // Generate Page Images
  for (const page of storyData.content) {
    console.log(`Generating image for page ${page.page}...`);
    const imgPrompt = `${stylePrompt} Scene: ${page.imagePrompt}`;
    let imageUrl = `https://picsum.photos/seed/tariq-${page.page}/800/600`;
    
    try {
      const imgRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: imgPrompt,
        config: { imageConfig: { aspectRatio: "4:3", imageSize: "1K" } }
      });

      let imgBase64 = "";
      for (const part of imgRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imgBase64 = part.inlineData.data;
          break;
        }
      }
      
      if (imgBase64) {
        imageUrl = `data:image/png;base64,${imgBase64}`;
      }
    } catch (e: any) {
         console.error(`Failed to generate page ${page.page}:`, e.message);
    }

    finalContent.push({
      page: page.page,
      text: page.text || page.textAr,
      textAr: page.textAr || page.text,
      image: imageUrl
    });
  }

  return {
    id: "tariq-honesty-" + Date.now(),
    title: storyData.title || storyData.titleAr,
    titleAr: storyData.titleAr || storyData.title,
    category: "Fables",
    description: storyData.description || storyData.descriptionAr,
    descriptionAr: storyData.descriptionAr || storyData.description,
    coverImage: coverUrl,
    durationMin: 5,
    coreValues: storyData.coreValues || ["Honesty"],
    content: finalContent,
    discussionPrompts: [
      "Why did Tariq decide to return the coin?",
      "How do you think the owner felt when they got their coin back?",
      "What does Allah promise those who are honest?"
    ],
    discussionPromptsAr: [
      "لماذا قرر طارق إعادة العملة المعدنية؟",
      "كيف تعتقد أن المالك شعر عندما استعاد عملته؟",
      "بماذا يعد الله الصادقين؟"
    ]
  };
}

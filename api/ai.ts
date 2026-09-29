import { handleAI } from "../server/ai";

/** Vercel serverless function: POST /api/ai */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0] || "anon";
  const result = await handleAI(body, process.env.GEMINI_API_KEY, ip);
  res.status(result.status).json(result.body);
}

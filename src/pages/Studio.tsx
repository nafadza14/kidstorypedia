import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageShell, StaffTopBar, TabNav } from "./studio/shared";
import StoriesTab from "./studio/StoriesTab";
import EditorTab from "./studio/EditorTab";
import ReviewTab from "./studio/ReviewTab";
import GenerateTab from "./studio/GenerateTab";
import SourcesTab from "./studio/SourcesTab";
import AuditTab from "./studio/AuditTab";

type Tab = "stories" | "editor" | "review" | "generate" | "sources" | "audit";
const TABS: Tab[] = ["stories", "editor", "review", "generate", "sources", "audit"];

/** Content Studio (PRD §22–27, §65–67, §90). */
export default function Studio() {
  const { tx } = useLanguage();
  const { tab } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState("Editor");
  const active: Tab = TABS.includes(tab as Tab) ? (tab as Tab) : "stories";
  const id = params.get("id") || undefined;

  const go = (t: Tab, storyId?: string) => navigate(`/studio/${t}${storyId ? `?id=${encodeURIComponent(storyId)}` : ""}`);

  const labels: Record<Tab, string> = {
    stories: tx("Cerita", "Stories", "القصص"),
    editor: tx("Editor", "Editor", "المحرر"),
    review: tx("Antrian tinjauan", "Review queue", "قائمة المراجعة"),
    generate: tx("Generator AI", "AI generator", "المولّد الذكي"),
    sources: tx("Sumber & grafik", "Sources & graph", "المصادر"),
    audit: tx("Audit AI", "AI audit", "سجل الذكاء"),
  };

  return (
    <div className="min-h-screen">
      <StaffTopBar title={tx("Studio Konten", "Content Studio", "استوديو المحتوى")}>
        <label className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
          {tx("Nama editor", "Editor name", "اسم المحرر")}
          <input value={editor} onChange={e => setEditor(e.target.value)} className="w-32 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/50" />
        </label>
      </StaffTopBar>
      <PageShell>
        <div className="sm:hidden mb-4">
          <input value={editor} onChange={e => setEditor(e.target.value)} placeholder={tx("Nama editor", "Editor name", "اسم المحرر")} className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <TabNav tabs={TABS.map(t => ({ id: t, label: labels[t] }))} active={active} onChange={t => go(t, t === "editor" || t === "review" ? id : undefined)} />
        {active === "stories" && <StoriesTab onOpen={sid => go("editor", sid)} onReview={sid => go("review", sid)} />}
        {active === "editor" && <EditorTab id={id} editor={editor} onPick={sid => go("editor", sid)} onReview={sid => go("review", sid)} />}
        {active === "review" && <ReviewTab id={id} editor={editor} onPick={sid => go("review", sid)} onEdit={sid => go("editor", sid)} />}
        {active === "generate" && <GenerateTab editor={editor} onOpen={sid => go("editor", sid)} onReview={sid => go("review", sid)} />}
        {active === "sources" && <SourcesTab onOpen={sid => go("editor", sid)} />}
        {active === "audit" && <AuditTab onOpen={sid => go("editor", sid)} />}
      </PageShell>
    </div>
  );
}

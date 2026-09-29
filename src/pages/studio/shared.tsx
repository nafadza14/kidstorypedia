import React from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { loc } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { GeneratedStory } from "@/lib/ai/validate";
import type { Lang, Story } from "@/types";

/** Shared chrome for staff/teacher tools (Studio, Admin, Classroom). */
export function StaffTopBar({ title, children }: { title: string; children?: React.ReactNode }) {
  const { tx } = useLanguage();
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur border-b border-white/10 print:hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <span className="font-heading text-lg tracking-tight">Kidstorypedia®</span>
          <span className="select-none">✳︎</span>
        </Link>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full border border-white/15 text-zinc-300 truncate">{title}</span>
        <div className="flex-1" />
        {children}
        <LanguageSwitcher />
        <Link to="/dashboard" className="text-xs text-zinc-400 hover:text-white whitespace-nowrap">{tx("← Dashboard", "← لوحة التحكم")}</Link>
      </div>
    </header>
  );
}

export function TabNav<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-6 print:hidden" role="tablist">
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn("px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all", active === t.id ? "bg-white text-black" : "text-zinc-400 border border-white/10 hover:text-white hover:bg-white/5")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export const th = "text-start text-[10px] font-mono uppercase tracking-wide text-zinc-500 px-3 py-2 border-b border-white/10 whitespace-nowrap";
export const td = "px-3 py-2 border-b border-white/5 align-top text-sm";
export const sel = "bg-black/40 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/50";
export const inp = "w-full bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/50";

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[10px] font-mono uppercase tracking-wide text-zinc-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export function Toggle({ on, onClick, children, color }: { on: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all", on ? "bg-white/15 border-white/50 text-white" : "border-white/10 text-zinc-500 hover:text-zinc-200")}
      style={on && color ? { borderColor: color, background: color + "22" } : undefined}
    >
      {children}
    </button>
  );
}

/** Minor version bump: "1.1" → "1.2" (PRD §66). */
export function bumpVersion(v: string): string {
  const n = parseFloat(v);
  return (Math.round((isNaN(n) ? 0 : n) * 10 + 1) / 10).toFixed(1);
}

/** Canonical religious content — requires scholar sign-off before publishing (PRD §24). */
export function requiresScholar(story: Story) {
  return story.origin === "canonical" || ["prophets", "seerah", "sahabah"].includes(story.category);
}

export function storyToGenerated(story: Story, lang: Lang): GeneratedStory {
  return {
    story_id: story.id,
    title: loc(story.title, lang),
    description: loc(story.description, lang),
    age_range: story.ageRange,
    language: lang,
    category: story.category,
    primary_values: story.values,
    pages: story.pages.map(p => ({ page: p.page, narrative: loc(p.text, lang), illustration_prompt: p.illustrationPrompt || "", source_refs: p.sourceRefs })),
    discussion: { questions: story.discussion.questions.map(q => loc(q, lang)), action: loc(story.discussion.action, lang), reflection: loc(story.discussion.reflection, lang) },
  };
}

export const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—");
export const usd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: n < 100 ? 2 : 0 })}`;
export const pct = (n: number) => `${(n * 100).toFixed(n > 0 && n < 0.1 ? 1 : 0)}%`;

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">{children}</main>;
}

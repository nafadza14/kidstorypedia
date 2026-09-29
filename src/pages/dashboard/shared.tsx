import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { VALUE_MAP } from "@/data/values";
import { loc } from "@/lib/content";
import { activeChild, useStore, type AppState } from "@/store";
import { cn } from "@/lib/utils";
import { toast } from "@/components/kit";
import type { ChildProfile, Lang, ValueId } from "@/types";

/** Common per-section context: whole store snapshot + active child + language helpers. */
export function useDash(): { state: AppState; child: ChildProfile | undefined; language: Lang; tx: (id: string, en: string, ar?: string) => string } {
  const state = useStore(s => s);
  const { language, tx } = useLanguage();
  return { state, child: activeChild(state), language, tx };
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="text-2xl font-heading font-light tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function valueName(id: ValueId, lang: Lang) {
  return loc(VALUE_MAP[id]?.name, lang);
}

export function fmtDate(iso: string | undefined, lang: Lang) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export async function copyText(text: string, okMsg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMsg);
  } catch {
    // clipboard blocked - fall back to a prompt the user can copy from
    window.prompt("Copy:", text);
  }
}

export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label className={cn("flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0", disabled ? "opacity-50" : "cursor-pointer")}>
      <span>
        <span className="block text-sm text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500 mt-0.5">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer", checked ? "bg-white" : "bg-zinc-700")}
      >
        <span className={cn("absolute top-1 w-4 h-4 rounded-full transition-all", checked ? "bg-black left-5" : "bg-zinc-300 left-1")} />
      </button>
    </label>
  );
}

/**
 * Print isolation: only elements inside `.ksp-print` are printed.
 * Rendered as an inline <style> so each printable view carries its own rules.
 */
export function PrintStyle() {
  return (
    <style>{`
      @media print {
        @page { margin: 12mm; }
        html, body { background: #fff !important; }
        body * { visibility: hidden !important; }
        * { backdrop-filter: none !important; }
        .h-screen, .overflow-hidden, .overflow-y-auto, [role="dialog"] { height: auto !important; max-height: none !important; overflow: visible !important; transform: none !important; }
        .ksp-print, .ksp-print * { visibility: visible !important; }
        .ksp-print { position: absolute !important; left: 0; top: 0; width: 100%; color: #111 !important; background: #fff !important; box-shadow: none !important; }
        .ksp-print .ksp-noprint { display: none !important; }
      }
    `}</style>
  );
}

export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "amber" | "emerald" | "rose" }) {
  const tones = {
    default: "border-white/15 text-zinc-300",
    amber: "border-amber-300/40 text-amber-200 bg-amber-300/5",
    emerald: "border-emerald-400/40 text-emerald-300 bg-emerald-400/5",
    rose: "border-rose-400/40 text-rose-300 bg-rose-400/5",
  };
  return <span className={cn("inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full border", tones[tone])}>{children}</span>;
}

export function NoChild() {
  const { tx } = useLanguage();
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">{tx("Tambahkan profil anak untuk memulai.", "Add a child profile to get started.", "أضف ملف طفل للبدء.")}</div>;
}

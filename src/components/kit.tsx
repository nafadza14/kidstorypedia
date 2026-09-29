import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Lock, ShieldCheck, X } from "lucide-react";
import { VALUE_MAP, STATE_LABEL } from "@/data/values";
import { coverGradient, loc } from "@/lib/content";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { ContentState, Story, ValueId } from "@/types";

/** Story cover - uses the illustration when present, otherwise a calm generated gradient. */
export function StoryCover({ story, className, locked }: { story: Story; className?: string; locked?: boolean }) {
  const { language } = useLanguage();
  const src = story.coverImage || story.pages.find(p => p.image)?.image;
  const [failed, setFailed] = useState<string | null>(null);
  const img = src && failed !== src ? src : undefined;
  return (
    <div className={cn("relative overflow-hidden bg-zinc-900", className)} style={img ? undefined : { background: coverGradient(story.id) }}>
      {img ? (
        <img src={img} alt="" loading="lazy" onError={() => setFailed(img)} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <svg viewBox="0 0 100 100" className="absolute w-2/3 opacity-15" aria-hidden>
            <path d="M50 5 L61 39 L95 39 L67 60 L78 95 L50 73 L22 95 L33 60 L5 39 L39 39 Z" fill="none" stroke="white" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="0.6" />
          </svg>
          <span className="relative text-center font-heading text-white/90 text-lg leading-snug line-clamp-3">{loc(story.title, language)}</span>
        </div>
      )}
      {locked && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center" title="Premium">
          <Lock className="w-3.5 h-3.5 text-amber-300" />
        </div>
      )}
    </div>
  );
}

export function ValueChip({ id, size = "sm", count }: { id: ValueId; size?: "sm" | "md"; count?: number }) {
  const { language } = useLanguage();
  const v = VALUE_MAP[id];
  if (!v) return null;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border font-mono", size === "sm" ? "text-[10px] px-2.5 py-0.5" : "text-xs px-3 py-1")}
      style={{ borderColor: v.color + "55", background: v.color + "14", color: "#e4e4e7" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />
      {loc(v.name, language)}
      {count !== undefined && <span className="opacity-70">· {count}</span>}
    </span>
  );
}

export function Avatar({ seed, size = 32, className }: { seed: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={cn("rounded-full bg-zinc-700 border border-white/20 shrink-0 inline-flex items-center justify-center font-heading text-white", className)} style={{ width: size, height: size, fontSize: size * 0.42, background: coverGradient(seed) }}>
        {seed.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      onError={() => setFailed(true)}
      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0ebd7,ffd5dc,ffdfbf`}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full bg-zinc-800 border border-white/20 shrink-0", className)}
    />
  );
}

export function ReviewBadge({ state }: { state: ContentState }) {
  const { tx, language } = useLanguage();
  if (state === "published") {
    return <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300"><ShieldCheck className="w-3 h-3" />{tx("Ditinjau", "Reviewed", "مُراجَعة")}</span>;
  }
  return <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 border border-amber-300/30 rounded-full px-2 py-0.5">{loc(STATE_LABEL[state], language)}</span>;
}

export function Modal({ open, onClose, children, title, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ y: 20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            className={cn("bg-zinc-950 border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl", wide ? "max-w-4xl" : "max-w-lg")}
            role="dialog"
            aria-modal
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              {title ? <h3 className="text-xl font-heading">{title}</h3> : <span />}
              <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────── toast ───────────────────────────
type ToastItem = { id: number; text: string };
let pushToast: (t: string) => void = () => {};
export function toast(text: string) { pushToast(text); }

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToast = (text: string) => {
      const id = Date.now() + Math.random();
      setItems(i => [...i, { id, text }]);
      setTimeout(() => setItems(i => i.filter(x => x.id !== id)), 3800);
    };
  }, []);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center pointer-events-none print:hidden">
      <AnimatePresence>
        {items.map(i => (
          <motion.div key={i.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="px-5 py-3 rounded-full bg-white text-black text-sm shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {i.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────── small building blocks ───────────────────────────
export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
      <div className="text-[11px] font-mono text-zinc-400 mb-2">{label}</div>
      <div className="text-3xl font-light tracking-tight">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-1.5">{sub}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-3xl border border-white/10 bg-zinc-900/50 p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          {title && <h3 className="font-heading text-lg">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-zinc-400">{children}</div>;
}

export const btn = {
  primary: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
  ghost: "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
  small: "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-zinc-200 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-40",
};

export const input = "w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/50";
export const label = "block text-xs font-mono text-zinc-400 mb-1.5";

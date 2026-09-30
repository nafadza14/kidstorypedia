import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, Moon, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicShell } from "@/components/PublicNav";
import { ReviewBadge, StoryCover, ValueChip, btn, input } from "@/components/kit";
import { useStore } from "@/store";
import { familyStories, loc } from "@/lib/content";
import { canAccessStory } from "@/lib/entitlements";
import { CATEGORIES, VALUES } from "@/data/values";
import { useSeo } from "@/hooks/useSeo";
import { storiesIndexMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { AgeBand, StoryCategory, ValueId } from "@/types";

const BANDS: { id: AgeBand; range: [number, number] }[] = [
  { id: "4-5", range: [4, 5] },
  { id: "6-8", range: [6, 8] },
  { id: "9-12", range: [9, 12] },
];

const chip = (on: boolean) =>
  cn("px-3.5 py-1.5 rounded-full border text-xs transition-colors cursor-pointer whitespace-nowrap", on ? "bg-white text-black border-white" : "border-white/15 text-zinc-300 hover:bg-white/10");

export default function StoryLibrary() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = (params.get("category") || "") as StoryCategory | "";
  const value = (params.get("value") || "") as ValueId | "";
  const band = (params.get("age") || "") as AgeBand | "";
  const bedtime = params.get("bedtime") === "1";

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const all = useMemo(() => familyStories(state), [state]);
  const stories = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const r = BANDS.find(b => b.id === band)?.range;
    return all.filter(s => {
      if (category && s.category !== category) return false;
      if (value && !s.values.includes(value)) return false;
      if (bedtime && !s.bedtime) return false;
      if (r && (s.ageRange[1] < r[0] || s.ageRange[0] > r[1])) return false;
      if (needle) {
        const hay = [s.title.en, s.title.ar, s.title.id, s.description.en, s.description.ar, s.description.id, ...s.values].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, q, category, value, band, bedtime]);

  useSeo({ ...storiesIndexMeta(language), lang: language });

  const hasFilters = !!(q || category || value || band || bedtime);

  return (
    <PublicShell>
      <section className="px-5 sm:px-8 max-w-7xl mx-auto pt-10 pb-8">
        <span className="text-xs text-zinc-400 font-mono mb-3 block">[ {tx("Perpustakaan cerita", "Story library", "مكتبة القصص")} ]</span>
        <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-4">{tx("Cerita Islami untuk anak-anak", "Islamic stories for kids", "قصص إسلامية للأطفال")}</h1>
        <p className="text-zinc-300 max-w-2xl mb-8">
          {tx(
            "Kisah para Nabi, Sirah, Sahabat, dan cerita moral yang lembut - masing-masing dengan sumbernya, panduan diskusi untuk orang tua, dan aksi keluarga kecil.",
            "Stories of the Prophets, the Seerah, the Sahabah and gentle moral tales - each with its sources, a parent discussion guide and a small family action.",
            "قصص الأنبياء والسيرة والصحابة وحكايات أخلاقية لطيفة - لكل منها مصادرها ودليل نقاش للوالدين وعمل عائلي صغير.",
          )}
        </p>

        <div className="relative max-w-xl mb-6">
          <Search className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            type="search"
            className={input + " ps-11 rounded-full"}
            placeholder={tx("Cari cerita, misal: sabar, Yusuf...", "Search stories, e.g. patience, Yusuf…", "ابحث عن قصة، مثل: الصبر، يوسف…")}
            value={q}
            onChange={e => set("q", e.target.value)}
            aria-label={tx("Cari cerita", "Search stories", "ابحث عن القصص")}
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-mono text-zinc-500 w-16">{tx("Kategori", "Category", "الفئة")}</span>
            <button className={chip(!category)} onClick={() => set("category", "")}>{tx("Semua", "All", "الكل")}</button>
            {CATEGORIES.map(c => <button key={c.id} className={chip(category === c.id)} onClick={() => set("category", category === c.id ? "" : c.id)}>{loc(c.name, language)}</button>)}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-mono text-zinc-500 w-16">{tx("Usia", "Age", "العمر")}</span>
            <button className={chip(!band)} onClick={() => set("age", "")}>{tx("Semua usia", "All ages", "كل الأعمار")}</button>
            {BANDS.map(b => <button key={b.id} className={chip(band === b.id)} onClick={() => set("age", band === b.id ? "" : b.id)}>{b.id}</button>)}
            <button className={chip(bedtime)} onClick={() => set("bedtime", bedtime ? "" : "1")}><Moon className="w-3 h-3 inline me-1" />{tx("Pengantar tidur", "Bedtime", "قبل النوم")}</button>
          </div>
          <div className="flex gap-2 items-center overflow-x-auto pb-1">
            <span className="text-[11px] font-mono text-zinc-500 w-16 shrink-0">{tx("Nilai", "Value", "القيمة")}</span>
            {VALUES.map(v => <button key={v.id} className={chip(value === v.id)} onClick={() => set("value", value === v.id ? "" : v.id)}>{loc(v.name, language)}</button>)}
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-5 text-sm text-zinc-400">
          <span>{tx(`${stories.length} cerita`, `${stories.length} stories`, `${stories.length} قصة`)}</span>
          {hasFilters && <button className={btn.small} onClick={() => setParams(new URLSearchParams(), { replace: true })}><X className="w-3 h-3" />{tx("Hapus filter", "Clear filters", "مسح الفلاتر")}</button>}
        </div>
        {stories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-zinc-400">{tx("Belum ada cerita yang cocok dengan filter ini.", "No stories match these filters yet.", "لا توجد قصص تطابق هذه الفلاتر بعد.")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stories.map(s => {
              const locked = s.premium && !canAccessStory(state, s);
              const cat = CATEGORIES.find(c => c.id === s.category);
              return (
                <Link key={s.id} to={`/stories/${s.slug}`} className="group rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 hover:border-white/40 transition-colors flex flex-col">
                  <StoryCover story={s} locked={locked} className="aspect-[4/3]" />
                  <article className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
                      <span>{cat ? loc(cat.name, language) : s.category}</span>
                      <ReviewBadge state={s.state} />
                    </div>
                    <h2 className="font-heading text-lg leading-snug group-hover:underline underline-offset-4 decoration-white/30">{loc(s.title, language)}</h2>
                    <p className="text-sm text-zinc-400 line-clamp-2">{loc(s.description, language)}</p>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mt-1">
                      <span>{tx(`Usia ${s.ageRange[0]}–${s.ageRange[1]}`, `Ages ${s.ageRange[0]}–${s.ageRange[1]}`, `الأعمار ${s.ageRange[0]}–${s.ageRange[1]}`)}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationMin} {tx("mnt", "min", "د")}</span>
                      {s.premium && <span className="text-amber-300">{locked ? tx("Paket keluarga", "Family plan", "خطة العائلة") : tx("Terbuka", "Unlocked", "مفتوحة")}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">{s.values.map(v => <ValueChip key={v} id={v} />)}</div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </PublicShell>
  );
}

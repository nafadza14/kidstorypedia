import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { StoryCover, ValueChip } from "@/components/kit";
import { SOURCE_MAP } from "@/data/sources";
import { coverGradient, loc, sourceRef } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Lang, ReaderStyle, Story } from "@/types";

type Tx = (id: string, en: string, ar?: string) => string;

export interface ReaderViewProps {
  story: Story;
  /** Logical page the reader is on. */
  page: number;
  total: number;
  /** Rich text (glossary + read-aloud highlight) for the current page. */
  rendered: React.ReactNode;
  /** Plain text for any page (used while a page is mid-animation). */
  plain: (i: number) => string;
  lang: Lang;
  dir: "ltr" | "rtl";
  age: number;
  tx: Tx;
  /** 1 = moved forward, -1 = moved back. */
  direction: 1 | -1;
}

export const READER_STYLES: { id: ReaderStyle; name: { id: string; en: string; ar: string }; hint: { id: string; en: string; ar: string } }[] = [
  {
    id: "book",
    name: { id: "Buku", en: "Book", ar: "كتاب" },
    hint: { id: "Buku terbuka dengan kertas dan halaman yang dibalik.", en: "An open book with paper pages that turn.", ar: "كتاب مفتوح بصفحات ورقية تُقلَّب." },
  },
  {
    id: "cinematic",
    name: { id: "Sinematik", en: "Cinematic", ar: "سينمائي" },
    hint: { id: "Gambar dan teks berdampingan di latar gelap.", en: "Picture and text side by side on a dark stage.", ar: "الصورة والنص جنباً إلى جنب على خلفية داكنة." },
  },
  {
    id: "picture",
    name: { id: "Buku Bergambar", en: "Picture book", ar: "كتاب مصوّر" },
    hint: { id: "Ilustrasi layar penuh, geser untuk lanjut. Cocok untuk si kecil.", en: "Full-screen pictures, swipe to turn. Great for little ones.", ar: "صور بملء الشاشة، اسحب للتقليب. مناسب للصغار." },
  },
  {
    id: "bedtime",
    name: { id: "Mode Tidur", en: "Bedtime", ar: "وقت النوم" },
    hint: { id: "Gelap, hangat, dan tenang untuk sebelum tidur.", en: "Dim, warm and calm for winding down.", ar: "هادئ ودافئ وخافت قبل النوم." },
  },
];

function Sources({ story, page, tx, lang, className }: { story: Story; page: number; tx: Tx; lang: Lang; className?: string }) {
  const refs = story.pages[page]?.sourceRefs || [];
  if (!refs.length) return null;
  return (
    <p className={cn("text-[11px] font-mono", className)}>
      {tx("Sumber", "Source", "المصدر")}: {refs.map(r => sourceRef(SOURCE_MAP[r], lang, r)).join(" · ")}
    </p>
  );
}

function pageImage(story: Story, i: number) {
  return story.pages[i]?.image || story.coverImage;
}

/** Illustration with a graceful gradient fallback when the image is missing or fails. */
function PageImg({ story, src, className }: { story: Story; src?: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <div className="absolute inset-0" style={{ background: coverGradient(story.id) }} />;
  return <img src={src} alt="" onError={() => setFailed(src)} className={cn("absolute inset-0 w-full h-full object-cover", className)} />;
}

/* ─────────────────────────── 1. Cinematic ─────────────────────────── */

export function CinematicView({ story, page, total, rendered, lang, age, tx }: ReaderViewProps) {
  const cur = story.pages[page];
  return (
    <AnimatePresence mode="wait">
      <motion.div key={page} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 bg-[#0a0a0c]">
        {cur.image && <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-105" style={{ backgroundImage: `url(${cur.image})`, filter: "blur(50px)" }} />}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 px-6 pt-24 pb-32 md:p-16 max-w-7xl mx-auto overflow-y-auto">
          <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 relative shrink-0 max-h-[40vh] md:max-h-none">
            <StoryCover story={{ ...story, coverImage: cur.image || story.coverImage }} className="w-full h-full" />
            <div className="absolute bottom-4 start-4 px-3 py-1 rounded-full bg-black/60 border border-white/15 text-[11px] font-mono text-zinc-300">
              {tx(`Halaman ${page + 1} dari ${total}`, `Page ${page + 1} of ${total}`, `الصفحة ${page + 1} من ${total}`)}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="mb-4 flex flex-wrap gap-1.5">{story.values.map(v => <ValueChip key={v} id={v} />)}</div>
            <p className={cn("leading-relaxed text-zinc-100 font-light", age <= 5 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl lg:text-4xl", lang === "ar" && "font-[Amiri,serif] leading-loose")}>
              {rendered}
            </p>
            <Sources story={story} page={page} tx={tx} lang={lang} className="mt-6 text-zinc-500" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────── 2. Picture book ─────────────────────────── */

export function PictureView({ story, page, total, rendered, lang, dir, age, tx, direction }: ReaderViewProps) {
  const reduce = useReducedMotion();
  const sign = (dir === "rtl" ? -1 : 1) * direction;
  const img = pageImage(story, page);
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={sign}>
        <motion.div
          key={page}
          custom={sign}
          variants={{
            enter: (d: number) => ({ x: reduce ? 0 : `${d * 100}%`, opacity: reduce ? 0 : 1 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: reduce ? 0 : `${-d * 35}%`, opacity: reduce ? 0 : 0.4 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <motion.div className="absolute inset-0" initial={{ scale: reduce ? 1 : 1.08 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "easeOut" }}>
            <PageImg story={story} src={img} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />
          <div className="absolute inset-x-0 bottom-28 sm:bottom-32 px-4 flex justify-center">
            <div className="w-full max-w-3xl rounded-[28px] bg-black/45 backdrop-blur-md border border-white/15 px-5 py-5 sm:px-8 sm:py-7 shadow-2xl">
              <p className={cn("text-white leading-snug", age <= 5 ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl", lang === "ar" && "font-[Amiri,serif] leading-loose")}>
                {rendered}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Sources story={story} page={page} tx={tx} lang={lang} className="text-zinc-400" />
                <span className="text-[11px] font-mono text-zinc-400 shrink-0">{page + 1} / {total}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── 3. Bedtime ─────────────────────────── */

export function BedtimeView({ story, page, total, rendered, lang, age, tx }: ReaderViewProps) {
  const img = pageImage(story, page);
  return (
    <div className="absolute inset-0 night-sky overflow-hidden">
      <div className="absolute inset-0 night-sky twinkle opacity-70 pointer-events-none" style={{ backgroundPosition: "37% 11%" }} aria-hidden />
      {/* crescent moon */}
      <svg viewBox="0 0 100 100" className="absolute top-20 end-6 sm:end-14 w-16 sm:w-24 opacity-80" aria-hidden>
        <defs>
          <radialGradient id="moonGlow"><stop offset="0" stopColor="#ffe9b8" stopOpacity=".5" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
          <mask id="moonCut"><rect width="100" height="100" fill="white" /><circle cx="62" cy="40" r="26" fill="black" /></mask>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#moonGlow)" />
        <circle cx="50" cy="50" r="28" fill="#f6e3b4" mask="url(#moonCut)" />
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.4 } }}
          transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-y-auto"
        >
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full overflow-hidden mb-8 sm:mb-10 shrink-0 ring-1 ring-amber-100/20 shadow-[0_0_60px_10px_rgba(255,214,150,.12)]">
            <div className="absolute inset-0 opacity-60"><PageImg story={story} src={img} className="[filter:sepia(.35)_saturate(.8)]" /></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c1024]/60" />
          </div>
          <p className={cn("max-w-2xl text-[#f1e2c2] font-book leading-[1.75]", age <= 5 ? "text-2xl sm:text-4xl" : "text-xl sm:text-3xl", lang === "ar" && "leading-loose")}>
            {rendered}
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-xs font-book italic text-amber-100/40">~ {page + 1} / {total} ~</span>
            <Sources story={story} page={page} tx={tx} lang={lang} className="text-amber-100/30" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── 4. Book (page flip) ─────────────────────────── */

function useIsWide() {
  const q = "(min-width: 768px)";
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return wide;
}

const FLIP_S = 0.9;
const FLIP_EASE = [0.45, 0.05, 0.25, 1] as const;

export function BookView(props: ReaderViewProps) {
  const { story, page, rendered, plain, dir } = props;
  const wide = useIsWide();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(page);
  const [flip, setFlip] = useState<null | { from: number; to: number }>(null);

  useEffect(() => {
    if (flip || page === shown) return;
    if (reduce) { setShown(page); return; }
    setFlip({ from: shown, to: page });
  }, [page, shown, flip, reduce]);

  const finish = () => { if (flip) { setShown(flip.to); setFlip(null); } };
  const textOf = (i: number) => (i === page && !flip ? rendered : plain(i));
  const rtl = dir === "rtl";
  // gutter shading: the illustration sits on the inline-start half, text on the inline-end half
  const startShade = rtl ? "paper-right" : "paper-left";
  const endShade = rtl ? "paper-left" : "paper-right";

  return (
    <div className="absolute inset-0 desk flex items-center justify-center px-3 sm:px-8 pt-20 pb-28 sm:pt-24 sm:pb-32 overflow-hidden">
      {wide ? (
        <div
          className="relative book-cover rounded-[14px] p-[10px] lg:p-[14px]"
          style={{ width: "min(1180px, 100%, calc((100dvh - 13rem) * 1.5))", aspectRatio: "1.5" }}
        >
          <div className="relative w-full h-full flex" style={{ perspective: "2600px" }}>
            {/* static halves */}
            <div className={cn("relative w-1/2 h-full rounded-s-[6px] overflow-hidden", rtl ? "book-edges-right" : "book-edges-left")}>
              <IllusFace {...props} index={flip ? (flip.to > flip.from ? flip.from : flip.to) : shown} shade={startShade} />
              {flip && flip.to < flip.from && <FlipShade reveal />}
            </div>
            <div className={cn("relative w-1/2 h-full rounded-e-[6px] overflow-hidden", rtl ? "book-edges-left" : "book-edges-right")}>
              <TextFace {...props} index={flip ? (flip.to > flip.from ? flip.to : flip.from) : shown} content={flip ? plain(flip.to > flip.from ? flip.to : flip.from) : textOf(shown)} shade={endShade} />
              {flip && flip.to > flip.from && <FlipShade reveal />}
            </div>
            {/* spine */}
            <div className="pointer-events-none absolute inset-y-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[3px] bg-gradient-to-b from-[#6b4a2a]/40 via-[#3d2814]/60 to-[#6b4a2a]/40" />

            {/* turning leaf */}
            {flip && (
              <Leaf
                key={`${flip.from}-${flip.to}`}
                forward={flip.to > flip.from}
                rtl={rtl}
                onDone={finish}
                front={flip.to > flip.from
                  ? <TextFace {...props} index={flip.from} content={plain(flip.from)} shade={endShade} />
                  : <IllusFace {...props} index={flip.from} shade={startShade} />}
                back={flip.to > flip.from
                  ? <IllusFace {...props} index={flip.to} shade={startShade} />
                  : <TextFace {...props} index={flip.to} content={plain(flip.to)} shade={endShade} />}
              />
            )}
          </div>
        </div>
      ) : (
        <div
          className="relative book-cover rounded-[12px] p-[7px]"
          style={{ width: "min(100%, calc((100dvh - 11rem) * 0.68))", aspectRatio: "0.68" }}
        >
          <div className="relative w-full h-full" style={{ perspective: "1800px" }}>
            <div className={cn("relative w-full h-full rounded-[5px] overflow-hidden", rtl ? "book-edges-left" : "book-edges-right")}>
              <SingleFace {...props} index={flip ? (flip.to > flip.from ? flip.to : flip.from) : shown} content={flip ? plain(flip.to > flip.from ? flip.to : flip.from) : textOf(shown)} />
              {flip && <FlipShade reveal />}
            </div>
            {flip && (
              <Leaf
                key={`${flip.from}-${flip.to}`}
                single
                forward={flip.to > flip.from}
                rtl={rtl}
                onDone={finish}
                front={<SingleFace {...props} index={flip.to > flip.from ? flip.from : flip.to} content={plain(flip.to > flip.from ? flip.from : flip.to)} />}
                back={<div className="w-full h-full paper opacity-95" />}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** A sheet that rotates around the spine, with a face on each side. */
function Leaf({ front, back, forward, rtl, single, onDone }: { front: React.ReactNode; back: React.ReactNode; forward: boolean; rtl: boolean; single?: boolean; onDone: () => void }) {
  // Two-page spread: forward turns the inline-end (text) half over the spine;
  // backward turns the inline-start (picture) half back. RTL mirrors everything.
  // Single page: the sheet hinges on the inline-start edge. Forward swings it away,
  // backward swings the previous sheet back into place.
  const turn = rtl ? 180 : -180;
  let style: React.CSSProperties;
  let from: number, to: number;
  if (single) {
    style = { insetInlineStart: 0, width: "100%", transformOrigin: rtl ? "right center" : "left center" };
    [from, to] = forward ? [0, turn] : [turn, 0];
  } else if (forward) {
    style = { insetInlineStart: "50%", width: "50%", transformOrigin: rtl ? "right center" : "left center" };
    [from, to] = [0, turn];
  } else {
    style = { insetInlineStart: 0, width: "50%", transformOrigin: rtl ? "left center" : "right center" };
    [from, to] = [0, -turn];
  }
  const shadeFront = single && !forward ? [0.5, 0] : [0, 0.5];
  const shadeBack = single && !forward ? [0, 0.4] : [0.4, 0];
  return (
    <motion.div
      className="absolute top-0 h-full z-20"
      style={{ ...style, transformStyle: "preserve-3d" }}
      initial={{ rotateY: from }}
      animate={{ rotateY: to }}
      transition={{ duration: FLIP_S, ease: FLIP_EASE }}
      onAnimationComplete={onDone}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[5px] shadow-[0_0_24px_rgba(0,0,0,.35)]" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
        {front}
        <motion.div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/0 via-black/10 to-black/45 rtl:bg-gradient-to-l" initial={{ opacity: shadeFront[0] }} animate={{ opacity: shadeFront[1] }} transition={{ duration: FLIP_S, ease: FLIP_EASE }} />
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-[5px] shadow-[0_0_24px_rgba(0,0,0,.35)]" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
        {back}
        <motion.div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-black/0 via-black/10 to-black/45 rtl:bg-gradient-to-r" initial={{ opacity: shadeBack[0] }} animate={{ opacity: shadeBack[1] }} transition={{ duration: FLIP_S, ease: FLIP_EASE }} />
      </div>
    </motion.div>
  );
}

/** Shadow cast on the page being uncovered while a sheet turns. */
function FlipShade({ reveal }: { reveal?: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none bg-black z-10"
      initial={{ opacity: reveal ? 0.35 : 0 }}
      animate={{ opacity: 0 }}
      transition={{ duration: FLIP_S, ease: FLIP_EASE }}
    />
  );
}

function PageNo({ n, className }: { n: number; className?: string }) {
  return <div className={cn("absolute bottom-3 inset-x-0 text-center text-[11px] font-book italic text-[#8a6a45]", className)}>~ {n} ~</div>;
}

function IllusFace({ story, index, shade, lang }: ReaderViewProps & { index: number; shade: string }) {
  const img = pageImage(story, index);
  return (
    <div className={cn("absolute inset-0 paper flex flex-col p-[6%] pb-[9%]", shade)}>
      {index === 0 && (
        <div className="text-center font-book text-[#7a4a1e] text-sm lg:text-base tracking-wide mb-3 line-clamp-1">{loc(story.title, lang)}</div>
      )}
      <div className="relative flex-1 rounded-[3px] overflow-hidden ring-1 ring-[#b89b6c]/60 shadow-[inset_0_0_0_6px_#f7efdc,inset_0_0_0_7px_rgba(160,120,70,.35)]">
        <PageImg story={story} src={img} className="[filter:sepia(.18)_saturate(.95)_contrast(.97)]" />
        {/* printed-on-paper feel */}
        <div className="absolute inset-0 mix-blend-multiply opacity-40 paper" />
      </div>
      <PageNo n={index * 2 + 1} />
    </div>
  );
}

function TextFace({ story, index, content, shade, lang, age, tx }: ReaderViewProps & { index: number; content: React.ReactNode; shade: string }) {
  return (
    <div className={cn("absolute inset-0 paper flex flex-col p-[7%] pb-[10%]", shade)}>
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-center">
        <p
          className={cn(
            "font-book text-[#2b2217]",
            index === 0 && lang !== "ar" && "drop-cap",
            age <= 5 ? "text-[clamp(1.15rem,2vw,1.9rem)] leading-[1.6]" : "text-[clamp(1rem,1.65vw,1.55rem)] leading-[1.7]",
            lang === "ar" && "leading-[2]",
          )}
        >
          {content}
        </p>
        <Sources story={story} page={index} tx={tx} lang={lang} className="mt-5 text-[#8a6a45]" />
      </div>
      <PageNo n={index * 2 + 2} />
    </div>
  );
}

function SingleFace({ story, index, content, lang, age, tx }: ReaderViewProps & { index: number; content: React.ReactNode }) {
  const img = pageImage(story, index);
  return (
    <div className="absolute inset-0 paper paper-single flex flex-col p-[6%] pb-[10%] gap-4">
      <div className="relative h-[42%] shrink-0 rounded-[3px] overflow-hidden ring-1 ring-[#b89b6c]/60">
        <PageImg story={story} src={img} className="[filter:sepia(.18)]" />
        <div className="absolute inset-0 mix-blend-multiply opacity-40 paper" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <p className={cn("font-book text-[#2b2217]", index === 0 && lang !== "ar" && "drop-cap", age <= 5 ? "text-xl leading-[1.6]" : "text-[1.05rem] leading-[1.7]", lang === "ar" && "text-xl leading-[2]")}>
          {content}
        </p>
        <Sources story={story} page={index} tx={tx} lang={lang} className="mt-3 text-[#8a6a45]" />
      </div>
      <PageNo n={index + 1} />
    </div>
  );
}

export function ReaderView({ style, ...props }: ReaderViewProps & { style: ReaderStyle }) {
  if (style === "book") return <BookView {...props} />;
  if (style === "picture") return <PictureView {...props} />;
  if (style === "bedtime") return <BedtimeView {...props} />;
  return <CinematicView {...props} />;
}

import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight, Award, BarChart2, BookMarked, Bot, Briefcase, Check, ChevronDown, CreditCard, Gift, GraduationCap,
  Library, LogOut, MessageSquare, NotebookPen, PenTool, Plus, Route, Settings, Users, Newspaper,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Avatar } from "@/components/kit";
import { PLANS } from "@/data/catalog";
import { isPremium, trialDaysLeft } from "@/lib/entitlements";
import { loc } from "@/lib/content";
import { cn } from "@/lib/utils";
import { activeChild, setState, useStore } from "@/store";
import Overview from "./dashboard/Overview";
import Children from "./dashboard/Children";
import Journal from "./dashboard/Journal";
import Discussion from "./dashboard/Discussion";
import Programs from "./dashboard/Programs";
import Achievements from "./dashboard/Achievements";
import Digest from "./dashboard/Digest";
import Assistant from "./dashboard/Assistant";
import LibrarySection from "./dashboard/LibrarySection";
import Billing from "./dashboard/Billing";
import Referral from "./dashboard/Referral";
import SettingsSection from "./dashboard/SettingsSection";

type SectionId =
  | "overview" | "children" | "journal" | "discussion" | "programs" | "achievements" | "digest" | "assistant"
  | "library" | "billing" | "referral" | "settings";

interface NavItem { id: SectionId; id_: string; en: string; ar: string; icon: React.ComponentType<{ className?: string }>; el: React.ComponentType }

const FAMILY: NavItem[] = [
  { id: "overview", id_: "Ringkasan", en: "Overview", ar: "نظرة عامة", icon: BarChart2, el: Overview },
  { id: "children", id_: "Anak-anak", en: "Children", ar: "الأطفال", icon: Users, el: Children },
  { id: "journal", id_: "Jurnal Karakter", en: "Character Journal", ar: "دفتر الأخلاق", icon: NotebookPen, el: Journal },
  { id: "discussion", id_: "Diskusi", en: "Discussions", ar: "النقاشات", icon: MessageSquare, el: Discussion },
  { id: "programs", id_: "Program", en: "Programs", ar: "البرامج", icon: Route, el: Programs },
  { id: "achievements", id_: "Pencapaian", en: "Achievements", ar: "الإنجازات", icon: Award, el: Achievements },
  { id: "digest", id_: "Ringkasan Mingguan", en: "Weekly Digest", ar: "الملخص الأسبوعي", icon: Newspaper, el: Digest },
  { id: "assistant", id_: "Asisten Orang Tua", en: "Parent Assistant", ar: "مساعد الوالدين", icon: Bot, el: Assistant },
];
const ACCOUNT: NavItem[] = [
  { id: "library", id_: "Paket & Perpustakaan", en: "Packs & Library", ar: "الباقات والمكتبة", icon: Library, el: LibrarySection },
  { id: "billing", id_: "Langganan", en: "Subscription", ar: "الاشتراك", icon: CreditCard, el: Billing },
  { id: "referral", id_: "Undang Teman", en: "Invite Friends", ar: "ادعُ أصدقاءك", icon: Gift, el: Referral },
  { id: "settings", id_: "Pengaturan", en: "Settings", ar: "الإعدادات", icon: Settings, el: SettingsSection },
];
const ALL = [...FAMILY, ...ACCOUNT];

function PlanPill() {
  const { tx, language } = useLanguage();
  const state = useStore(s => s);
  const sub = state.subscription;
  const plan = PLANS.find(p => p.id === sub.plan);
  if (sub.status === "trialing") {
    const d = trialDaysLeft(state);
    return <Link to="/dashboard/billing" className="text-[11px] font-mono px-3 py-1 rounded-full border border-amber-300/40 text-amber-200 bg-amber-300/5 whitespace-nowrap">{tx(`Uji coba · ${d} hari tersisa`, `Trial · ${d} day${d === 1 ? "" : "s"} left`, `تجربة · ${d} يوم متبقٍ`)}</Link>;
  }
  if (isPremium(state)) {
    return <Link to="/dashboard/billing" className="text-[11px] font-mono px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-400/5 whitespace-nowrap">{plan ? loc(plan.name, language) : tx("Premium", "Premium", "مميز")}{sub.status === "cancelled" ? tx(" · segera berakhir", " · ends soon", " · ينتهي قريباً") : ""}</Link>;
  }
  return <Link to="/dashboard/billing" className="text-[11px] font-mono px-3 py-1 rounded-full border border-white/20 text-zinc-300 whitespace-nowrap hover:bg-white/10">{sub.status === "paused" ? tx("Dijeda", "Paused", "متوقف مؤقتاً") : tx("Paket gratis · Upgrade", "Free plan · Upgrade", "خطة مجانية · ترقية")}</Link>;
}

function ChildSwitcher() {
  const { tx } = useLanguage();
  const state = useStore(s => s);
  const child = activeChild(state);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [open]);
  if (!child) return null;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2.5 bg-zinc-900/80 ps-1.5 pe-3 py-1.5 rounded-full border border-white/10 cursor-pointer hover:border-white/30 transition-all" aria-haspopup="menu" aria-expanded={open}>
        <Avatar seed={child.avatarSeed} size={28} />
        <span className="text-start">
          <span className="font-medium text-xs text-white block leading-tight">{child.name}</span>
          <span className="text-[10px] text-zinc-400 font-mono">{tx(`Usia ${child.age}`, `Age ${child.age}`, `العمر ${child.age}`)}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-56 bg-zinc-950 border border-white/15 rounded-2xl p-2 shadow-2xl z-50" role="menu">
          <div className="text-[10px] font-mono text-zinc-400 px-3 py-1 border-b border-white/10 mb-1">{tx("GANTI ANAK", "SWITCH CHILD", "تبديل الطفل")}</div>
          {state.children.map(c => (
            <button
              key={c.id}
              role="menuitem"
              onClick={() => { setState(s => ({ ...s, activeChildId: c.id })); setOpen(false); }}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-start cursor-pointer transition-colors", c.id === child.id ? "bg-white/15 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-white/5")}
            >
              <Avatar seed={c.avatarSeed} size={20} />
              <span>{c.name} ({c.age})</span>
              {c.id === child.id && <Check className="w-3.5 h-3.5 ms-auto" />}
            </button>
          ))}
          <button onClick={() => { setOpen(false); navigate("/dashboard/children?add=1"); }} className="w-full mt-1 pt-2 border-t border-white/10 flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer">
            <Plus className="w-3.5 h-3.5" />{tx("Tambah anak", "Add child", "إضافة طفل")}
          </button>
        </div>
      )}
    </div>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { tx } = useLanguage();
  const Icon = item.icon;
  return (
    <Link
      to={`/dashboard/${item.id}`}
      aria-current={active ? "page" : undefined}
      className={cn("w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-medium transition-all", active ? "bg-white text-black font-semibold shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5")}
    >
      <Icon className="w-4 h-4" />
      <span>{tx(item.id_, item.en, item.ar)}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { section } = useParams();
  const { tx } = useLanguage();
  const parentName = useStore(s => s.parent?.name || "");
  const current = ALL.find(n => n.id === (section || "overview"));
  if (!current) return <Navigate to="/dashboard" replace />;
  const Section = current.el;
  const hour = new Date().getHours();
  const greet = hour < 12 ? tx("Selamat pagi", "Good morning", "صباح الخير") : hour < 18 ? tx("Selamat siang", "Good afternoon", "مساء الخير") : tx("Selamat malam", "Good evening", "مساء الخير");

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden font-body selection:bg-white selection:text-black">
      {/* SIDEBAR (desktop) */}
      <aside className="w-64 bg-[#0e0e12] border-e border-white/10 hidden md:flex flex-col justify-between shrink-0 print:hidden">
        <div className="overflow-y-auto">
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-lg text-white tracking-tight">Kidstorypedia®</span>
              <span className="text-white text-lg select-none">✳︎</span>
            </Link>
          </div>
          <nav className="p-4 space-y-5" aria-label={tx("Dasbor orang tua", "Parent dashboard", "لوحة الوالدين")}>
            <div className="space-y-1">
              <div className="px-3.5 pb-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{tx("Keluarga", "Family", "العائلة")}</div>
              {FAMILY.map(n => <NavButton key={n.id} item={n} active={n.id === current.id} />)}
            </div>
            <div className="space-y-1">
              <div className="px-3.5 pb-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{tx("Akun", "Account", "الحساب")}</div>
              {ACCOUNT.map(n => <NavButton key={n.id} item={n} active={n.id === current.id} />)}
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link to="/child" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-all">
            <span>{tx("Beralih ke Tampilan Anak", "Switch to Kids View", "الانتقال لواجهة الأطفال")}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/" className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-white/20 text-zinc-400 hover:text-white hover:border-white/40 text-xs transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span>{tx("Keluar ke beranda", "Exit to home", "العودة للرئيسية")}</span>
          </Link>
          <div className="pt-2 space-y-1 text-[11px] text-zinc-500">
            <Link to="/studio" className="flex items-center gap-2 hover:text-zinc-300"><PenTool className="w-3 h-3" />{tx("Studio Konten", "Content Studio", "استوديو المحتوى")}</Link>
            <Link to="/classroom" className="flex items-center gap-2 hover:text-zinc-300"><GraduationCap className="w-3 h-3" />{tx("Kelas (B2B)", "Classroom (B2B)", "الفصل الدراسي (للمؤسسات)")}</Link>
            <Link to="/admin" className="flex items-center gap-2 hover:text-zinc-300"><Briefcase className="w-3 h-3" />{tx("Dasbor bisnis", "Business dashboard", "لوحة الأعمال")}</Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-white/10 print:hidden">
          <div>
            <div className="text-xs text-zinc-400 font-mono mb-1">[ {tx("Portal Keluarga", "Family Portal", "بوابة العائلة")} / {tx(current.id_, current.en, current.ar)} ]</div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight font-heading">
              {greet}{parentName ? `, ${parentName}` : ""}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PlanPill />
            <LanguageSwitcher />
            <ChildSwitcher />
            <Link to="/child" className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-medium">
              <BookMarked className="w-3.5 h-3.5" />{tx("Tampilan Anak", "Kids View", "واجهة الأطفال")}
            </Link>
          </div>
        </header>

        {/* Mobile nav tabs */}
        <nav className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-6 -mx-1 px-1 print:hidden" aria-label={tx("Bagian", "Sections", "الأقسام")}>
          {ALL.map(n => {
            const Icon = n.icon;
            const active = n.id === current.id;
            return (
              <Link key={n.id} to={`/dashboard/${n.id}`} className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all shrink-0", active ? "bg-white text-black font-semibold" : "bg-zinc-900 border border-white/10 text-zinc-400")}>
                <Icon className="w-3.5 h-3.5" />{tx(n.id_, n.en, n.ar)}
              </Link>
            );
          })}
        </nav>

        <div className="max-w-6xl">
          <Section key={current.id} />
        </div>
      </main>
    </div>
  );
}

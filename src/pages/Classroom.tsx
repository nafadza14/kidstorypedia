import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageShell, StaffTopBar, TabNav } from "./studio/shared";
import ClassesTab from "./classroom/ClassesTab";
import PilotTab from "./classroom/PilotTab";
import SponsorshipTab from "./classroom/SponsorshipTab";
import PricingTab from "./classroom/PricingTab";

type Tab = "classes" | "pilot" | "sponsorship" | "pricing";
const TABS: Tab[] = ["classes", "pilot", "sponsorship", "pricing"];

/** Classroom / B2B (PRD §36, §37, §47, §60, §80–81). */
export default function Classroom() {
  const { tx } = useLanguage();
  const [params, setParams] = useSearchParams();
  const active: Tab = TABS.includes(params.get("tab") as Tab) ? (params.get("tab") as Tab) : "classes";
  const labels: Record<Tab, string> = {
    classes: tx("Kelas", "Classes", "الفصول"),
    pilot: tx("Uji coba sekolah", "School pilot", "تجربة المدرسة"),
    sponsorship: tx("Sponsor", "Sponsorship", "الرعاية"),
    pricing: tx("Harga & permintaan uji coba", "Pricing & pilot request", "الأسعار"),
  };
  return (
    <div className="min-h-screen">
      <style>{`@media print {
        html, body, #root, #root > div { background: #fff !important; color: #000 !important; }
        .print-report, .print-report * { color: #000 !important; border-color: #ccc !important; background: transparent !important; }
        @page { margin: 16mm; }
      }`}</style>
      <StaffTopBar title={tx("Kelas & Sekolah", "Classroom · Schools", "الفصول والمدارس")} />
      <PageShell>
        <TabNav tabs={TABS.map(t => ({ id: t, label: labels[t] }))} active={active} onChange={t => setParams({ tab: t })} />
        {active === "classes" && <ClassesTab />}
        {active === "pilot" && <PilotTab />}
        {active === "sponsorship" && <SponsorshipTab />}
        {active === "pricing" && <PricingTab />}
      </PageShell>
    </div>
  );
}

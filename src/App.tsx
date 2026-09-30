/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastHost } from "./components/kit";
import { FamilyGate } from "./components/FamilyGate";
import Landing from "./pages/Landing";
import { NOINDEX_PREFIXES, SEO_TOPICS } from "./lib/seo";

const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const StoryLibrary = lazy(() => import("./pages/StoryLibrary"));
const StoryPreview = lazy(() => import("./pages/StoryPreview"));
const LeadMagnet = lazy(() => import("./pages/LeadMagnet"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChildHome = lazy(() => import("./pages/ChildHome"));
const StoryReader = lazy(() => import("./pages/StoryReader"));
const Studio = lazy(() => import("./pages/Studio"));
const Admin = lazy(() => import("./pages/Admin"));
const Classroom = lazy(() => import("./pages/Classroom"));
const TopicPage = lazy(() => import("./pages/TopicPage"));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Private and per-family routes must never be indexed. */
function RouteRobots() {
  const { pathname } = useLocation();
  useEffect(() => {
    const hide = NOINDEX_PREFIXES.some(p => pathname === p || pathname.startsWith(p.endsWith("/") ? p : p + "/") || (p.endsWith("/") && pathname.startsWith(p)));
    if (!hide) return;
    let el = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const prev = el?.content ?? null;
    if (!el) { el = document.createElement("meta"); el.name = "robots"; document.head.appendChild(el); }
    el.content = "noindex, nofollow";
    const alts = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]'));
    alts.forEach(a => a.remove());
    return () => {
      if (prev === null) el?.remove(); else if (el) el.content = prev;
      alts.forEach(a => document.head.appendChild(a));
    };
  }, [pathname]);
  return null;
}

function Loading() {
  return <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm font-mono">Kidstorypedia ✳︎</div>;
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <ScrollTop />
        <RouteRobots />
        <div className="min-h-screen bg-[#0a0a0c] text-white font-body selection:bg-white selection:text-black">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/join" element={<Onboarding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/stories" element={<StoryLibrary />} />
              <Route path="/stories/:slug" element={<StoryPreview />} />
              <Route path="/30-nights" element={<LeadMagnet />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/dashboard" element={<FamilyGate><Dashboard /></FamilyGate>} />
              <Route path="/dashboard/:section" element={<FamilyGate><Dashboard /></FamilyGate>} />
              <Route path="/child" element={<FamilyGate><ChildHome /></FamilyGate>} />
              <Route path="/story/:id" element={<FamilyGate><StoryReader /></FamilyGate>} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/studio/:tab" element={<Studio />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/classroom" element={<Classroom />} />
              {SEO_TOPICS.map(t => <Route key={t.slug} path={`/${t.slug}`} element={<TopicPage topic={t} />} />)}
              <Route path="*" element={<Landing />} />
            </Routes>
          </Suspense>
          <ToastHost />
        </div>
      </Router>
    </LanguageProvider>
  );
}

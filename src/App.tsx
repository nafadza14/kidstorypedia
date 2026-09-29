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

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
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
              <Route path="*" element={<Landing />} />
            </Routes>
          </Suspense>
          <ToastHost />
        </div>
      </Router>
    </LanguageProvider>
  );
}

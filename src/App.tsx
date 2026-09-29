/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import ChildHome from "./pages/ChildHome";
import StoryReader from "./pages/StoryReader";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0c] text-white font-body selection:bg-white selection:text-black">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/child" element={<ChildHome />} />
            <Route path="/story/:id" element={<StoryReader />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

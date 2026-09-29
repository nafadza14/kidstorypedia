import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Audio narration via the Web Speech API (PRD §16), with read-aloud word
 * highlighting when the browser reports word boundaries. Recorded voice
 * actor audio can replace this later by setting `audioUrl` on pages.
 */
export function useNarration(lang: "en" | "ar") {
  const [speaking, setSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState<number | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setCharIndex(null);
  }, [supported]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : "en-US";
    u.rate = 0.9;
    u.pitch = 1.05;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(lang));
    if (voice) u.voice = voice;
    u.onboundary = e => { if (e.name === "word" || e.charIndex !== undefined) setCharIndex(e.charIndex); };
    u.onend = () => { setSpeaking(false); setCharIndex(null); onEnd?.(); };
    u.onerror = () => { setSpeaking(false); setCharIndex(null); };
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [lang, supported]);

  useEffect(() => stop, [stop]);

  return { supported, speaking, charIndex, speak, stop };
}

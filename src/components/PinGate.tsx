import React, { useState } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getState } from "@/store";
import { Modal, btn, input } from "./kit";

/** Light obfuscation — the PIN protects against children, not attackers. */
export function hashPin(pin: string) {
  let h = 0;
  for (const c of `ksp:${pin}`) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}

export function checkPin(pin: string) {
  const stored = getState().settings.pin;
  return !stored || stored === hashPin(pin);
}

/**
 * Parent-protected exit (PRD §15). If no PIN is set, a simple arithmetic
 * question keeps young children from wandering into the parent area.
 */
export function PinGate({ open, onClose, onPass }: { open: boolean; onClose: () => void; onPass: () => void }) {
  const { tx } = useLanguage();
  const hasPin = !!getState().settings.pin;
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);
  const [q] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 7);
    const b = 3 + Math.floor(Math.random() * 6);
    return { a, b };
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = hasPin ? checkPin(val) : Number(val) === q.a * q.b;
    if (ok) { setVal(""); setErr(false); onPass(); } else setErr(true);
  };

  return (
    <Modal open={open} onClose={onClose} title={tx("Grown-ups only", "للكبار فقط")}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <Lock className="w-4 h-4" />
          {hasPin ? tx("Enter your parent PIN", "أدخل الرقم السري للوالدين") : tx(`What is ${q.a} × ${q.b}?`, `كم يساوي ${q.a} × ${q.b}؟`)}
        </div>
        <input autoFocus inputMode="numeric" className={input} value={val} onChange={e => setVal(e.target.value)} type={hasPin ? "password" : "text"} />
        {err && <p className="text-xs text-rose-300">{tx("That's not right. Please try again.", "غير صحيح، حاول مرة أخرى.")}</p>}
        <button className={btn.primary + " w-full"}>{tx("Continue", "متابعة")}</button>
      </form>
    </Modal>
  );
}

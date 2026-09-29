import { useState } from "react";

/** Single-series weekly bar chart — inline SVG, no libraries. Hover shows value. */
export function WeeklyBars({ data, label }: { data: { week: string; sessions: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 200, pad = { l: 28, r: 8, t: 16, b: 24 };
  const max = Math.max(1, ...data.map(d => d.sessions));
  const nice = Math.ceil(max / 2) * 2 || 2;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const bw = iw / data.length;
  const barW = Math.min(36, bw - 8);
  const y = (v: number) => pad.t + ih - (v / nice) * ih;
  const ticks = [0, nice / 2, nice];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={label}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#71717a" fontFamily="monospace">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * bw + (bw - barW) / 2;
          const h = Math.max(0, pad.t + ih - y(d.sessions));
          const last = i === data.length - 1;
          const r = Math.min(4, h / 2);
          return (
            <g key={d.week} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${pad.t + ih} V${y(d.sessions) + r} Q${x},${y(d.sessions)} ${x + r},${y(d.sessions)} H${x + barW - r} Q${x + barW},${y(d.sessions)} ${x + barW},${y(d.sessions) + r} V${pad.t + ih} Z`}
                  fill={last ? "#e4e4e7" : hover === i ? "#a1a1aa" : "#52525b"}
                />
              )}
              {last && <text x={x + barW / 2} y={y(d.sessions) - 5} textAnchor="middle" fontSize="11" fill="#e4e4e7">{d.sessions}</text>}
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#71717a" fontFamily="monospace">{d.week}</text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="absolute top-0 end-0 text-[11px] font-mono bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 pointer-events-none">
          {data[hover].week}: <span className="text-white">{data[hover].sessions}</span>
        </div>
      )}
      <details className="mt-2 text-xs text-zinc-400">
        <summary className="cursor-pointer text-zinc-500">Table view</summary>
        <table className="mt-1 font-mono">
          <tbody>{data.map(d => <tr key={d.week}><td className="pe-4">{d.week}</td><td>{d.sessions}</td></tr>)}</tbody>
        </table>
      </details>
    </div>
  );
}

/** Horizontal funnel bars with step-to-step conversion. */
export function FunnelBars({ steps }: { steps: { step: string; n: number }[] }) {
  const max = Math.max(1, ...steps.map(s => s.n));
  return (
    <div className="space-y-1.5">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].n : 0;
        const conv = i > 0 && prev > 0 ? s.n / prev : null;
        return (
          <div key={s.step} className="grid grid-cols-[150px_1fr_64px] items-center gap-3 text-xs">
            <span className="text-zinc-300 truncate">{s.step}</span>
            <div className="h-5 bg-white/[0.03] rounded">
              <div className="h-5 rounded bg-zinc-300/80" style={{ width: `${(s.n / max) * 100}%`, minWidth: s.n ? 3 : 0 }} title={`${s.n}`} />
            </div>
            <span className="font-mono text-end"><span className="text-white">{s.n}</span>{conv !== null && <span className="text-zinc-500 block text-[10px]">{Math.round(conv * 100)}%</span>}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Compact labelled bar list for categorical counts. */
export function CountBars({ rows, color }: { rows: { label: string; n: number; color?: string }[]; color?: string }) {
  const max = Math.max(1, ...rows.map(r => r.n));
  if (!rows.length) return <p className="text-xs text-zinc-500">—</p>;
  return (
    <div className="space-y-1">
      {rows.map(r => (
        <div key={r.label} className="grid grid-cols-[110px_1fr_36px] items-center gap-2 text-xs">
          <span className="truncate text-zinc-300">{r.label}</span>
          <div className="h-2.5 bg-white/[0.03] rounded"><div className="h-2.5 rounded" style={{ width: `${(r.n / max) * 100}%`, background: r.color || color || "#a1a1aa" }} /></div>
          <span className="font-mono text-end">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

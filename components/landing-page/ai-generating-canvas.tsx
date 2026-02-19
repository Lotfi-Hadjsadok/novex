"use client";

import { Sparkles } from "lucide-react";

export function AIGeneratingCanvas() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-border">
      <style>{`
        @keyframes scan-line {
          0%   { top: -2px; opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes grid-drift {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes shimmer-text {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .scan-line   { animation: scan-line 2.4s ease-in-out infinite; }
        .grid-drift  { animation: grid-drift 4s linear infinite; }
        .shimmer-txt { animation: shimmer-text 1.8s ease-in-out infinite; }
      `}</style>

      <div className="absolute top-1/4 left-1/3 w-2/3 h-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse [animation-duration:3s]" />
      <div className="absolute bottom-1/4 right-1/3 w-1/2 h-1/3 rounded-full bg-primary/15 blur-3xl animate-pulse [animation-duration:4s] [animation-delay:1s]" />
      <div className="absolute top-2/3 left-1/4 w-1/3 h-1/4 rounded-full bg-primary/10 blur-2xl animate-pulse [animation-duration:3.5s] [animation-delay:0.5s]" />

      <div
        className="absolute inset-0 opacity-[0.07] grid-drift"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="scan-line absolute left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.85) 40%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.85) 60%, transparent 100%)",
          boxShadow: "0 0 12px 3px hsl(var(--primary) / 0.5)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin [animation-duration:6s]" />
          <div className="absolute inset-1 rounded-full border border-primary/30 animate-spin [animation-duration:4s] [animation-direction:reverse]" />
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary border-r-primary/40 animate-spin [animation-duration:2s]"
          />
          <div className="absolute inset-4 rounded-full border border-t-primary animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="size-6 text-primary animate-pulse [animation-duration:1.5s]" />
          </div>
        </div>

        <div className="text-center space-y-1.5 px-6">
          <p className="shimmer-txt text-white/90 font-semibold text-sm tracking-wide">
            Generating your design
          </p>
          <p className="text-white/40 text-xs">AI is crafting your landing page canvas…</p>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((dotIndex) => (
            <div
              key={dotIndex}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${dotIndex * 0.18}s` }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}

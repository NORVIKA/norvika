import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--brand)]">
      <span className="h-px w-8 bg-[var(--brand)]" />
      {children}
    </p>
  );
}

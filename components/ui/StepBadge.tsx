export function StepBadge({ n }: { n: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] font-display text-sm font-semibold text-[var(--brand)] transition-colors duration-300 group-hover:bg-[var(--brand)] group-hover:text-white">
      {n}
    </span>
  );
}

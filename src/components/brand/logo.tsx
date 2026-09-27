import { cn } from '@/lib/utils';

/**
 * Brightwater wordmark. Drawn inline so it themes with the app, needs no network
 * request and stays crisp on a phone screen in a van.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        role="img"
        aria-label="Brightwater Trade Supplies"
      >
        <rect width="32" height="32" rx="7" fill="var(--color-primary)" />
        <path
          d="M16 6.5c0 0-6.2 6.6-6.2 11.2A6.2 6.2 0 0 0 16 24a6.2 6.2 0 0 0 6.2-6.3C22.2 13.1 16 6.5 16 6.5Z"
          fill="var(--color-primary-foreground)"
          fillOpacity="0.95"
        />
        <path
          d="M16 19.8a2.6 2.6 0 0 1-2.6-2.6"
          stroke="var(--color-primary)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Brightwater
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Trade Supplies
          </span>
        </span>
      ) : null}
    </span>
  );
}

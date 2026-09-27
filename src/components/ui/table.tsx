import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Dense data table.
 *
 * Office staff read these all day, so rows are compact, numbers are right
 * aligned and tabular, the header sticks while the body scrolls, and wide tables
 * scroll horizontally inside their own container rather than blowing out the page.
 */

export function TableScroll({
  className,
  maxHeight,
  ...props
}: React.ComponentProps<'div'> & { maxHeight?: string }) {
  return (
    <div
      className={cn(
        'data-scroll relative w-full overflow-y-auto rounded-lg border border-border bg-card',
        className,
      )}
      style={maxHeight ? { maxHeight } : undefined}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      className={cn('w-full border-collapse text-left text-sm', className)}
      {...props}
    />
  );
}

export function THead({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn(
        'sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80',
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export function TFoot({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn('border-t-2 border-border-strong bg-muted/50 font-medium', className)}
      {...props}
    />
  );
}

export function TR({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('transition-colors hover:bg-accent/60 data-[state=selected]:bg-accent', className)}
      {...props}
    />
  );
}

export function TH({
  className,
  numeric,
  ...props
}: React.ComponentProps<'th'> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        numeric && 'text-right',
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  numeric,
  ...props
}: React.ComponentProps<'td'> & { numeric?: boolean }) {
  return (
    <td
      className={cn('px-3 py-2 align-middle', numeric && 'text-right tabular-nums', className)}
      {...props}
    />
  );
}

/** Message row spanning the whole table, for empty results. */
export function TableEmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

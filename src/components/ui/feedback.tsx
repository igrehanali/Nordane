import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The four states every screen in this app must be able to show: loading, empty,
 * error, and a plain informational note. Having them in one place is what keeps
 * 40 screens consistent.
 */

const alertVariants = cva('flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/8 text-foreground',
      success: 'border-success/30 bg-success/8 text-foreground',
      warning: 'border-warning/35 bg-warning/10 text-foreground',
      destructive: 'border-destructive/35 bg-destructive/8 text-foreground',
    },
  },
  defaultVariants: { variant: 'info' },
});

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const;

const iconTones = {
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
} as const;

export function Alert({
  className,
  variant = 'info',
  title,
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants> & { title?: string }) {
  const tone = variant ?? 'info';
  const Icon = alertIcons[tone];
  return (
    <div
      role={tone === 'destructive' ? 'alert' : 'status'}
      className={cn(alertVariants({ variant: tone }), className)}
      {...props}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconTones[tone])} aria-hidden />
      <div className="min-w-0 space-y-0.5">
        {title ? <p className="font-medium leading-tight">{title}</p> : null}
        {children ? <div className="text-muted-foreground">{children}</div> : null}
      </div>
    </div>
  );
}

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className={cn('size-4 animate-spin', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? <Icon className="size-8 text-muted-foreground/70" /> : null}
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

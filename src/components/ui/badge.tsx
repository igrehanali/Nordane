import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary dark:bg-primary/15',
        neutral: 'border-border bg-muted text-muted-foreground',
        success: 'border-transparent bg-success/12 text-success dark:bg-success/18',
        warning: 'border-transparent bg-warning/15 text-warning dark:bg-warning/20',
        destructive: 'border-transparent bg-destructive/12 text-destructive dark:bg-destructive/18',
        info: 'border-transparent bg-info/12 text-info dark:bg-info/18',
        outline: 'border-border-strong text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };

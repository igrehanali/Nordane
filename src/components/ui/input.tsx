import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function Input({ className, type = 'text', ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-sm shadow-xs transition-colors',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
          'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
          'file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-20 w-full rounded-md border border-input bg-card px-2.5 py-2 text-sm shadow-xs',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60',
          'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
          className,
        )}
        {...props}
      />
    );
  },
);

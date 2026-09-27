'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { HardHat, Warehouse } from 'lucide-react';
import { demoLoginAction, loginAction, type LoginState } from './actions';
import { DEMO_ACCOUNTS } from '@/lib/auth/demo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Alert, Separator } from '@/components/ui/feedback';

const EMPTY: LoginState = {};

export function LoginForm({ next, demoMode }: { next?: string; demoMode: boolean }) {
  const [state, submit, pending] = useActionState(loginAction, EMPTY);
  const [demoState, submitDemo, demoPending] = useActionState(demoLoginAction, EMPTY);
  const [persona, setPersona] = React.useState<string | null>(null);

  const error = state.error ?? demoState.error;

  return (
    <div className="space-y-5">
      {demoMode ? (
        <div className="space-y-2.5">
          <form action={submitDemo} className="grid gap-2">
            {(['customer', 'staff'] as const).map((key) => {
              const account = DEMO_ACCOUNTS[key];
              const Icon = key === 'customer' ? HardHat : Warehouse;
              return (
                <Button
                  key={key}
                  type="submit"
                  name="persona"
                  value={key}
                  variant={key === 'customer' ? 'default' : 'outline'}
                  className="h-auto justify-start gap-3 px-3 py-2.5 text-left"
                  loading={demoPending && persona === key}
                  disabled={demoPending || pending}
                  onClick={() => setPersona(key)}
                >
                  <Icon aria-hidden className="shrink-0" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold">
                      {account.label.replace('Explore as ', '')}
                    </span>
                    <span className="truncate text-[11px] font-normal opacity-80">
                      {account.description}
                    </span>
                  </span>
                </Button>
              );
            })}
          </form>
          <p className="text-xs text-muted-foreground">
            One click, no password needed. Demo data resets nightly.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>
        </div>
      ) : null}

      <form action={submit} className="space-y-4" noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {error ? (
          <Alert variant="destructive" title="Could not sign you in">
            {error}
          </Alert>
        ) : null}

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={state.email}
            required
            autoFocus
            aria-invalid={error ? true : undefined}
          />
        </Field>

        <Field label="Password" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={error ? true : undefined}
          />
        </Field>

        <Button type="submit" className="w-full" loading={pending} disabled={demoPending}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

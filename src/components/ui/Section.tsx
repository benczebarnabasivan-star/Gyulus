import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  id?: string;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

/** A consistently-spaced page section with an optional header + action. */
export function Section({
  id,
  className,
  title,
  subtitle,
  action,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn('mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8', className)}
    >
      {(title || action) && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm text-brand-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

import Link from 'next/link';
import { Search, X } from 'lucide-react';

import { filterHref, hasActiveFilters, type FestivalFilters } from '@/lib/festivals/filter';
import { cn } from '@/lib/utils';

type Props = {
  filters: FestivalFilters;
  genres: string[];
  countries: string[];
  months: { value: string; label: string }[];
  resultCount: number;
};

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
        active
          ? 'border-spot/45 bg-spot/15 text-spot'
          : 'border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white',
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Filter bar built from plain links and a GET form, so every combination is a
 * real, shareable URL and the page keeps working without JavaScript.
 */
export function FestivalFilterBar({ filters, genres, countries, months, resultCount }: Props) {
  const base = '/festivals';
  // Toggling a chip that is already active clears it.
  const toggle = (key: keyof FestivalFilters, value: string) =>
    filterHref(base, { ...filters, [key]: filters[key] === value ? undefined : value });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <form action={base} method="get" className="relative flex-1 sm:max-w-md">
          {/* Preserve the other filters when submitting a new search. */}
          {filters.genre && <input type="hidden" name="genre" value={filters.genre} />}
          {filters.country && <input type="hidden" name="country" value={filters.country} />}
          {filters.month && <input type="hidden" name="month" value={filters.month} />}

          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ''}
            placeholder="Search festivals, cities or artists…"
            aria-label="Search festivals, cities or artists"
            className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/35 transition focus:border-white/25 focus:bg-white/[0.07]"
          />
        </form>

        {hasActiveFilters(filters) && (
          <Link
            href={base}
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-xs text-white/55 transition hover:border-white/30 hover:text-white"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear
          </Link>
        )}

        <span className="text-xs text-white/40">
          {resultCount} {resultCount === 1 ? 'festival' : 'festivals'}
        </span>
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {genres.slice(0, 9).map((genre) => (
          <Chip key={genre} href={toggle('genre', genre)} active={filters.genre === genre}>
            {genre}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {countries.map((country) => (
          <Chip key={country} href={toggle('country', country)} active={filters.country === country}>
            {country}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {months.map((month) => (
          <Chip
            key={month.value}
            href={toggle('month', month.value)}
            active={filters.month === month.value}
          >
            {month.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

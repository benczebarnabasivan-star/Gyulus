import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Parses an ISO date ("2026-08-13") as UTC so it never shifts a day by timezone. */
function parseISODate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function formatDayLong(date: string): string {
  return parseISODate(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

export function formatDayShort(date: string): string {
  return parseISODate(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

export function formatWeekday(date: string): string {
  return parseISODate(date).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
}

export function formatDayNumber(date: string): string {
  return parseISODate(date).toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'UTC' });
}

export function formatRange(start: string, end: string): string {
  const s = parseISODate(start);
  const e = parseISODate(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear();
  const month = e.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
  const year = e.getUTCFullYear();

  if (sameMonth) {
    return `${s.getUTCDate()}–${e.getUTCDate()} ${month} ${year}`;
  }
  const startPart = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${startPart} – ${e.getUTCDate()} ${month} ${year}`;
}

/** Whole days from today (UTC) until the given date. Negative when past. */
export function daysUntil(date: string): number {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((parseISODate(date).getTime() - today) / 86_400_000);
}

export function countdownLabel(date: string): string {
  const days = daysUntil(date);
  if (days < 0) return 'Finished';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 30) return `In ${days} days`;
  const months = Math.round(days / 30);
  return months <= 1 ? 'In a month' : `In ${months} months`;
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** Deterministic 0–1 value from a string, for stable procedural artwork. */
export function hashUnit(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Compact number formatting in Hungarian style.
 * 1234 -> "1,2 E", 1_200_000 -> "1,2 M".
 */
export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace('.', ',')} E`;
  return `${(n / 1_000_000).toFixed(1).replace('.', ',')} M`;
}

/** Relative time in Hungarian (e.g. "3 napja"). */
export function timeAgoHu(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return 'most';
  if (min < 60) return `${min} perce`;
  if (hour < 24) return `${hour} órája`;
  if (day < 30) return `${day} napja`;
  if (month < 12) return `${month} hónapja`;
  return `${year} éve`;
}

/** Full Hungarian date, e.g. "2026. május 21.". */
export function formatDateHu(iso: string): string {
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

/** mm:ss duration. */
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Build a TikTok oEmbed-friendly embed URL for a given video URL. */
export function tiktokEmbedUrl(videoUrl: string): string {
  const match = videoUrl.match(/video\/(\d+)/);
  const id = match?.[1];
  return id ? `https://www.tiktok.com/embed/v2/${id}` : videoUrl;
}

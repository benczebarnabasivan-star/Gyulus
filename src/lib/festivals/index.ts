import { FESTIVALS } from './data';
import type { Festival } from './types';

/**
 * Single access point for festival data. Swap the body of `getFestivals` for a
 * live listings provider and everything downstream keeps working.
 */
export function getFestivals(): Festival[] {
  return [...FESTIVALS].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getFestivalBySlug(slug: string): Festival | undefined {
  return FESTIVALS.find((f) => f.slug === slug);
}

export * from './types';
export * from './match';

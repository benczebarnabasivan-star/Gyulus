import Image from 'next/image';
import { Music4 } from 'lucide-react';

import { Equalizer } from '@/components/visual/Equalizer';
import type { NowPlaying as NowPlayingData, RecentPlay } from '@/lib/spotify/types';
import { formatDuration, timeAgo } from '@/lib/utils';

type Props = {
  nowPlaying: NowPlayingData | null;
  lastPlay: RecentPlay | null;
};

/**
 * Shows the live track when Spotify reports one, and quietly falls back to the
 * most recent play so the panel is never empty.
 */
export function NowPlayingPanel({ nowPlaying, lastPlay }: Props) {
  const track = nowPlaying?.track ?? lastPlay?.track ?? null;
  const live = Boolean(nowPlaying?.isPlaying);

  if (!track) {
    return (
      <div className="glass flex items-center gap-4 rounded-3xl p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
          <Music4 className="h-6 w-6 text-white/30" aria-hidden />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">Nothing playing</div>
          <p className="mt-1 text-sm text-white/55">Start something on Spotify and refresh.</p>
        </div>
      </div>
    );
  }

  const progress = nowPlaying ? nowPlaying.progressMs / Math.max(1, track.durationMs) : 0;

  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5">
      {/* Album art bleeding into the panel background. */}
      {track.image && (
        <div aria-hidden className="absolute inset-0 -z-10 opacity-25 blur-2xl">
          <Image src={track.image} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/[0.06]">
          {track.image ? (
            <Image src={track.image} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-spot/30 to-violet/30">
              <Music4 className="h-6 w-6 text-white/70" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {live && <Equalizer />}
            <span className="text-xs uppercase tracking-[0.2em] text-white/40">
              {live ? 'Now playing' : lastPlay ? `Last played · ${timeAgo(lastPlay.playedAt)}` : 'Paused'}
            </span>
          </div>
          <a
            href={track.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1.5 block truncate text-lg font-semibold tracking-tight transition hover:text-spot"
          >
            {track.name}
          </a>
          <div className="truncate text-sm text-white/55">{track.artists.join(', ')}</div>
        </div>
      </div>

      {live && (
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-spot transition-all"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-white/40">
            <span>{formatDuration(nowPlaying?.progressMs ?? 0)}</span>
            <span>{formatDuration(track.durationMs)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

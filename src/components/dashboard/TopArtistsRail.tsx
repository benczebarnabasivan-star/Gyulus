import { ArtistAvatar } from '@/components/visual/ArtistAvatar';
import type { SpotifyArtist } from '@/lib/spotify/types';

type Props = {
  artists: SpotifyArtist[];
  /** Names that appear on at least one upcoming lineup. */
  playingSoon: Set<string>;
};

/** Horizontally scrolling rail of the listener's top artists. */
export function TopArtistsRail({ artists, playingSoon }: Props) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
      {artists.map((artist, i) => {
        const soon = playingSoon.has(artist.id);
        return (
          <a
            key={artist.id}
            href={artist.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex w-[104px] shrink-0 flex-col items-center text-center"
          >
            <div className="relative">
              {/* Green halo marks artists you can actually go and see. */}
              {soon && (
                <span
                  aria-hidden
                  className="absolute -inset-1 rounded-full bg-spot/30 blur-md transition group-hover:bg-spot/50"
                />
              )}
              <ArtistAvatar
                name={artist.name}
                image={artist.image}
                size={88}
                className="relative transition duration-300 group-hover:scale-105"
                ring
              />
              <span className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-semibold text-white/70 ring-1 ring-white/15">
                {i + 1}
              </span>
              {soon && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-spot px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                  Live
                </span>
              )}
            </div>
            <span className="mt-3.5 line-clamp-2 text-xs font-medium leading-snug text-white/75 transition group-hover:text-white">
              {artist.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}

import type { Metadata } from 'next';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { polls } from '@/lib/data/timeline';
import { Section } from '@/components/ui/Section';
import { PollCard } from '@/components/community/PollCard';
import { SubmissionForm } from '@/components/community/SubmissionForm';

export const metadata: Metadata = {
  title: 'Közösség',
  description:
    'Csatlakozz a Vadász Gyula rajongói közösséghez: szavazz a kedvenc klipekre, küldd be a legviccesebb videókat és olvasd a rajongói véleményeket.',
  alternates: { canonical: '/community' },
};

export const revalidate = 3600;

// Illustrative fan comments for the community wall (demo content).
const fanComments = [
  { id: 'c1', name: 'Anna K.', text: 'Gyula bácsi mindig feldobja a napom! 😂', when: '2 napja' },
  { id: 'c2', name: 'Tibor', text: 'A fűnyírós videó a kedvencem, sírtam a nevetéstől!', when: '5 napja' },
  { id: 'c3', name: 'Zsófi', text: 'Annyira aranyosak a kutyusok is! ❤️🐕', when: '1 hete' },
  { id: 'c4', name: 'Bence', text: 'Nagyrábé büszke lehet rá! Hajrá Gyula!', when: '1 hete' },
  { id: 'c5', name: 'Marcsi', text: 'A pörköltös recept tényleg működik, kipróbáltam 🍲', when: '2 hete' },
  { id: 'c6', name: 'Laci', text: 'Ez a fesztiválos sorozat zseniális volt!', when: '3 hete' },
];

export default function CommunityPage() {
  return (
    <>
      <Section
        title={<>👥 Közösség</>}
        subtitle="A rajongók helye — szavazz, szólj hozzá és küldd be a kedvenceidet!"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      </Section>

      <Section
        title={
          <span className="flex items-center gap-2">
            <ThumbsUp className="h-6 w-6 text-brand-pink" /> Küldd be a kedvenc klipedet
          </span>
        }
        subtitle="Találtál egy különösen vicces videót? Oszd meg velünk!"
      >
        <div className="mx-auto max-w-2xl">
          <SubmissionForm />
        </div>
      </Section>

      <Section
        title={
          <span className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-brand-cyan" /> Rajongói fal
          </span>
        }
      >
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {fanComments.map((c) => (
            <div key={c.id} className="surface break-inside-avoid p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-pink to-brand-cyan text-sm font-bold text-white">
                  {c.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-brand-muted">{c.when}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-brand-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

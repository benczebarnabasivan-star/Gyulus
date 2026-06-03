import type { Metadata } from 'next';
import Image from 'next/image';
import { creator } from '@/lib/data/creator';
import { milestones } from '@/lib/data/timeline';
import { Section } from '@/components/ui/Section';
import { Timeline } from '@/components/timeline/Timeline';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Rólunk · Vadász Gyula',
  description:
    'Ki az a Vadász Gyula? Ismerd meg a Nagyrábéról induló magyar TikTokost és ezt a rajongói oldalt.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-[200px_1fr]">
          <Image
            src={creator.avatarUrl}
            alt={creator.displayName}
            width={200}
            height={200}
            className="mx-auto h-40 w-40 rounded-full border-4 border-brand-card object-cover shadow-glow md:h-48 md:w-48"
          />
          <div>
            <Badge variant="pink" className="mb-3">
              Magyar TikTokos
            </Badge>
            <h1 className="text-3xl font-black sm:text-4xl">
              {creator.displayName}
            </h1>
            <p className="mt-1 text-brand-cyan">@{creator.handle}</p>
            <p className="mt-4 max-w-2xl text-brand-muted">{creator.bio}</p>
            <p className="mt-2 text-sm text-brand-muted">📍 {creator.location}</p>
          </div>
        </div>
      </Section>

      <Section title={<>Ki az a Vadász Gyula?</>}>
        <div className="surface max-w-3xl space-y-4 p-6 text-brand-muted">
          <p>
            Vadász Gyula egy Nagyrábéról származó magyar tartalom-készítő, aki a
            TikTokon (<code className="text-brand-cyan">@vadasz_gyula</code>) oszt
            meg videókat a mindennapjairól. Tartalmai a hétköznapi pillanatokról,
            őszinte humorról és közvetlen stílusról szólnak — ezért is alakult ki
            körülötte egy lelkes magyar rajongótábor.
          </p>
          <p>
            Ez egy <strong className="text-white">nem hivatalos</strong> rajongói
            oldal, amelyet a közönség hozott létre a legviccesebb és legjobb
            pillanatok összegyűjtésére. Az oldal nem áll kapcsolatban sem a
            TikTokkal, sem közvetlenül a tartalom-készítővel.
          </p>
          <p className="text-sm">
            ℹ️ A megjelenített statisztikák tájékoztató jellegűek. Az élő adatok
            akkor jelennek meg, ha az oldal egy hivatalos vagy engedélyezett
            adatforráshoz csatlakozik (lásd a projekt dokumentációját).
          </p>
        </div>
      </Section>

      <Section title={<>📈 A sikertörténet</>} subtitle="Fontosabb mérföldkövek.">
        <Timeline milestones={milestones} />
      </Section>
    </>
  );
}

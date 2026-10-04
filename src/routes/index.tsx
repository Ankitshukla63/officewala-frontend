import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { VideoPlayer } from "@/components/office/VideoPlayer";
import { videosQuery } from "@/lib/queries";
import { CATEGORY_TILES, TONE_CLASS } from "@/lib/categories";
import heroArt from "@/assets/hero-truckart.jpg";

export const Route = createFileRoute("/")({
  errorComponent: ({ error }) => (
    <p role="alert" className="p-8 text-center">
      {(error as Error).message}
    </p>
  ),
  notFoundComponent: () => <p className="p-8 text-center">Nothing here.</p>,
  component: Home,
});

function Home() {
  const { data: clips } = useSuspenseQuery(videosQuery());
  const [index, setIndex] = useState(0);
  const count = Math.max(clips.length, 1);

  return (
    <div>
      <section className="relative overflow-hidden border-b-3 border-border">
        <img
          src={heroArt}
          alt="Hand-painted Indian truck art desk with chai, laptop and office files"
          width={1920}
          height={912}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <span className="sticker-label bg-brick text-primary-foreground">Corporate Life FM</span>
          <h1 className="mt-4 font-display text-5xl leading-none sm:text-8xl">OFFICE WALA</h1>
          <p className="mt-3 font-hand text-3xl text-brick sm:text-4xl">
            Corporate Life, One Clip at a Time 😂
          </p>
          <p className="mt-2 text-base font-semibold text-ink/80">
            Because every office has a story.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/random"
              className="press-btn rounded-md bg-brick px-5 py-2.5 font-semibold text-primary-foreground active:press-btn-active"
            >
              🎲 Random Clip
            </Link>
            <Link
              to="/chai"
              className="press-btn rounded-md bg-mustard px-5 py-2.5 font-semibold text-ink active:press-btn-active"
            >
              ☕ Add a Chai Break
            </Link>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b-3 border-border bg-forest py-1.5 text-primary-foreground">
        <div className="marquee-track whitespace-nowrap font-semibold tracking-wide">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="px-4">
              ⭐ Just one small change ⭐ Can we have a quick call? ⭐ You're on mute ⭐ Need this by
              EOD ⭐ 5 minute chai break ⭐ Meeting could have been an email ⭐
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <VideoPlayer
          clip={clips[index] ?? null}
          onPrev={() => setIndex((i) => (i - 1 + count) % count)}
          onNext={() => setIndex((i) => (i + 1) % count)}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-5 text-center font-display text-3xl sm:text-4xl">Pick Your Poison</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className={`press-btn flex flex-col gap-1 rounded-xl p-4 transition-transform hover:-translate-y-1 ${TONE_CLASS[tile.tone]}`}
            >
              <span className="text-3xl">{tile.emoji}</span>
              <span className="font-display text-xl leading-tight">{tile.title}</span>
              <span className="text-xs font-semibold opacity-85">{tile.blurb}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

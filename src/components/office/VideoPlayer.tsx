import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Coffee,
} from "lucide-react";
import { CATEGORY_LABEL, type Clip } from "@/lib/categories";

type Props = {
  clip: Clip | null;
  loading?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ clip, loading, onPrev, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
    setDuration(0);
  }, [clip?.id]);

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="paint-panel mx-auto w-full max-w-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-border bg-brick px-3 py-1.5 text-primary-foreground">
        <p className="font-display text-base tracking-wide">NOW PLAYING</p>
        <span className="sticker-label border-primary-foreground/70 bg-mustard py-0.5 text-xs text-ink">
          {clip ? (CATEGORY_LABEL[clip.category] ?? clip.category) : "—"}
        </span>
      </div>

      <div ref={wrapperRef} className="bg-ink p-2 sm:p-2.5">
        <div className="relative overflow-hidden rounded-lg border-2 border-mustard bg-background/5">
          {loading ? (
            <div className="flex aspect-video max-h-64 items-center justify-center text-mustard">
              <Loader2 className="size-7 animate-spin" />
            </div>
          ) : clip?.video_url ? (
            <video
              key={clip.id}
              ref={videoRef}
              src={clip.video_url}
              poster={clip.thumbnail_url ?? undefined}
              className="aspect-video max-h-64 w-full bg-black object-contain"
              preload="metadata"
              playsInline
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => {
                setPlaying(false);
                onNext?.();
              }}
            />
          ) : (
            <div className="flex aspect-video max-h-60 flex-col items-center justify-center gap-1.5 px-4 py-4 text-center">
              <Coffee className="size-8 text-mustard" />
              <p className="font-display text-lg text-mustard">No office drama loaded yet</p>
              <p className="text-xs text-background/70">
                Upload a clip from the Chai Break page to get started.
              </p>
            </div>
          )}
        </div>

        <div className="mt-2.5 rounded-md border-2 border-mustard/70 bg-background/10 px-2.5 py-1.5">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            aria-label="Progress"
            onChange={(e) => {
              const el = videoRef.current;
              if (el) el.currentTime = Number(e.target.value);
              setProgress(Number(e.target.value));
            }}
            className="accent-mustard h-1.5 w-full cursor-pointer"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous clip"
              className="press-btn rounded-md border-mustard bg-mustard px-2 py-1 text-ink active:press-btn-active"
            >
              <SkipBack className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="press-btn rounded-md border-mustard bg-tangerine px-2.5 py-1 text-ink active:press-btn-active"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next clip"
              className="press-btn rounded-md border-mustard bg-mustard px-2 py-1 text-ink active:press-btn-active"
            >
              <SkipForward className="size-3.5" />
            </button>

            <span className="ml-1 font-mono text-[11px] text-mustard">
              {formatTime(progress)} / {formatTime(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
                onClick={() => {
                  const el = videoRef.current;
                  const next = volume === 0 ? 1 : 0;
                  if (el) el.volume = next;
                  setVolume(next);
                }}
                className="text-mustard"
              >
                {volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                aria-label="Volume"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (videoRef.current) videoRef.current.volume = next;
                  setVolume(next);
                }}
                className="accent-mustard w-14 cursor-pointer sm:w-20"
              />
              <button
                type="button"
                aria-label="Fullscreen"
                onClick={() => void videoRef.current?.requestFullscreen?.()}
                className="text-mustard"
              >
                <Maximize className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t-3 border-border bg-card px-3 py-2">
        <div>
          <p className="font-display text-base leading-tight">
            {clip ? clip.title : "Nothing playing"}
          </p>
          <p className="text-xs text-muted-foreground">
            Category: {clip ? (CATEGORY_LABEL[clip.category] ?? clip.category) : "—"}
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="press-btn rounded-md bg-forest px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-foreground active:press-btn-active"
        >
          NEXT CLIP →
        </button>
      </div>
    </div>
  );
}

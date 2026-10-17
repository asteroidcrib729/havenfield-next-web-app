"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false),
    [allowed, setAllowed] = useState(false),
    [failed, setFailed] = useState(false),
    [loaded, setLoaded] = useState(false),
    [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)"),
      desktop = window.matchMedia("(min-width: 768px)");
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          addEventListener?: (type: string, callback: () => void) => void;
          removeEventListener?: (type: string, callback: () => void) => void;
        };
      }
    ).connection;
    let ready = false,
      timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      setAllowed(ready && !reduced.matches && !connection?.saveData);
      setAutoplay(desktop.matches);
    };
    const defer = () => {
      timer = setTimeout(() => {
        ready = true;
        update();
      }, 750);
    };
    if (document.readyState === "complete") defer();
    else window.addEventListener("load", defer, { once: true });
    reduced.addEventListener("change", update);
    desktop.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", defer);
      reduced.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);
  return (
    <>
      {allowed && !failed && (
        <video
          ref={video}
          muted
          autoPlay={autoplay}
          loop
          playsInline
          preload="none"
          onLoadedData={() => setLoaded(true)}
          onError={() => setFailed(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${loaded ? "" : "opacity-0"}`}
        >
          <source src="/media/havenfield-hero.mp4" type="video/mp4" />
        </video>
      )}
      {allowed && !failed && (
        <button
          type="button"
          aria-label={playing ? "Pause hero film" : "Play hero film"}
          onClick={() => {
            if (playing) video.current?.pause();
            else void video.current?.play().catch(() => setFailed(true));
          }}
          className="absolute right-6 bottom-6 z-10 flex items-center gap-2 border border-white/50 bg-black/25 px-3 py-2 text-[10px] text-white backdrop-blur-sm"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}{" "}
          {playing ? "Pause hero film" : "Play hero film"}
        </button>
      )}
    </>
  );
}

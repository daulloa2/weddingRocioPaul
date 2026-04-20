// components/BackgroundAudio.tsx
"use client";

import * as React from "react";
import { setupMediaSession } from "@/lib/mediaSession";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

type Props = {
  src: string;
  title?: string;
  artist?: string;
  cover?: string;
  initialVolume?: number; // 0..1
  loop?: boolean;
  className?: string;
  /** Reproducir automáticamente si el navegador lo permite (por defecto: false) */
  autoplay?: boolean;
  /** Pausar al ocultar la página / cambiar de app (por defecto: true) */
  stopWhenHidden?: boolean;
};

export default function BackgroundAudio({
  src,
  title = "Música de fondo",
  artist = "Daniel & Nicole",
  cover = "/assets/cover.jpg",
  initialVolume = 0.6,
  loop = true,
  className,
  autoplay = false,
  stopWhenHidden = true,
}: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false); // autoplay bloqueado
  const [ready, setReady] = React.useState(false);

  // Preferencia guardada
  React.useEffect(() => {
    const pref = localStorage.getItem("bg-music");
    if (pref === "off") {
      setIsPlaying(false);
      setBlocked(true);
    }
  }, []);

  // Setup + (auto)play opcional
  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.volume = initialVolume;
    el.muted = false;

    const cleanupMs = setupMediaSession(el, {
      title,
      artist,
      artwork: cover ? [{ src: cover, sizes: "512x512", type: "image/png" }] : [],
    });

    const tryAutoplay = async () => {
      try {
        await el.play();
        setIsPlaying(true);
        setBlocked(false);
      } catch {
        setBlocked(true);
      } finally {
        setReady(true);
      }
    };

    // Solo intentamos autoplay si:
    // - el prop autoplay está en true
    // - el usuario no desactivó la música
    // - la página está visible
    if (
      autoplay &&
      localStorage.getItem("bg-music") !== "off" &&
      document.visibilityState === "visible"
    ) {
      void tryAutoplay();
    } else {
      setReady(true);
    }

    // Primer gesto (si el autoplay fue bloqueado)
    const onFirstGesture = async () => {
      if (!audioRef.current || isPlaying) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setBlocked(false);
      } catch {}
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };

    window.addEventListener("pointerdown", onFirstGesture, { once: true, passive: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    window.addEventListener("touchstart", onFirstGesture, { once: true, passive: true });

    return () => {
      cleanupMs();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, title, artist, cover, autoplay, initialVolume]);

  // Pausar cuando la página se oculta / sales de la app (iOS/Android)
  React.useEffect(() => {
    if (!stopWhenHidden) return;

    const hardPause = () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("bg-music", "off");
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") hardPause();
    };
    const onPageHide = () => hardPause();
    const onBlur = () => hardPause(); // fallback

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("blur", onBlur);
    };
  }, [stopWhenHidden]);

  const play = async () => {
    try {
      await audioRef.current?.play();
      setIsPlaying(true);
      setBlocked(false);
      localStorage.setItem("bg-music", "on");
    } catch {
      setBlocked(true);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    localStorage.setItem("bg-music", "off");
  };

  const toggle = () => (isPlaying ? pause() : play());

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(audioRef.current.muted);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        loop={loop}
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      <div
        className={
          "pointer-events-auto fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black/60 text-white backdrop-blur px-3 py-2 shadow-lg " +
          "flex items-center gap-2 " +
          (className ?? "")
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <button
          onClick={toggle}
          className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
          aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          title={isPlaying ? " Pausar" : " Reproducir"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          <span>{isPlaying ? " Pausar" : blocked ? " Reproducir" : " Reproducir"}</span>
        </button>

        <button
          onClick={toggleMute}
          className="rounded-full hover:bg-white/10"
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          title={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      {ready && blocked && (
        <span className="sr-only">
          La reproducción automática fue bloqueada por tu navegador. Toca “Reproducir” para iniciar la música.
        </span>
      )}
    </>
  );
}

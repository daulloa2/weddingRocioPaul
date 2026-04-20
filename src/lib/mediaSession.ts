// src/lib/mediaSession.ts
export type MediaArtwork = { src: string; sizes?: string; type?: string };

type MediaSessionActionLocal =
  | "play" | "pause" | "stop"
  | "seekbackward" | "seekforward" | "seekto"
  | "previoustrack" | "nexttrack";

type MediaSessionActionDetailsLocal = {
  action: MediaSessionActionLocal;
  seekOffset?: number;
  seekTime?: number;
  fastSeek?: boolean;
};

// Constructor de MediaMetadata que devuelve MediaMetadata (no unknown)
type MediaMetadataInitCompat = {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: MediaArtwork[];
};
type MediaMetadataCtor = new (init?: MediaMetadataInitCompat) => MediaMetadata;

// API mínima de MediaSession que necesitamos, con metadata tipada
interface MediaSessionLike {
  metadata: MediaMetadata | null;
  playbackState?: "none" | "paused" | "playing";
  setActionHandler?: (
    action: MediaSessionActionLocal,
    handler: ((details: MediaSessionActionDetailsLocal) => void) | null
  ) => void;
  setPositionState?: (state: { duration: number; position: number; playbackRate: number }) => void;
}

export function setupMediaSession(
  audio: HTMLAudioElement,
  opts: { title: string; artist?: string; album?: string; artwork?: MediaArtwork[] }
) {
  const ms = (navigator as Navigator & { mediaSession?: MediaSessionLike }).mediaSession;
  if (!ms) return () => {};

  // Usa el ctor global si existe y asigna un MediaMetadata real
  const MediaMetadataCtor =
    (window as unknown as { MediaMetadata?: MediaMetadataCtor }).MediaMetadata;
  if (MediaMetadataCtor) {
    ms.metadata = new MediaMetadataCtor({
      title: opts.title,
      artist: opts.artist,
      album: opts.album,
      artwork: opts.artwork ?? [],
    });
  }

  // Estado de reproducción
  const updatePosition = () => {
    try {
      ms.setPositionState?.({
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        position: audio.currentTime,
        playbackRate: audio.playbackRate || 1,
      });
    } catch {
      // noop
    }
  };

  const play = async () => { await audio.play(); };
  const pause = () => { audio.pause(); };
  const stop = () => { audio.pause(); audio.currentTime = 0; };

  const seekBy = (offset = 10) => {
    const next = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + offset));
    audio.currentTime = next;
    updatePosition();
  };

  // Soporte opcional para fastSeek sin any
  type FastSeekAudio = HTMLAudioElement & { fastSeek?: (time: number) => void };
  const audioWithFast = audio as FastSeekAudio;

  const onAction = (details: MediaSessionActionDetailsLocal) => {
    switch (details.action) {
      case "play": return void play();
      case "pause": return pause();
      case "stop": return stop();
      case "seekbackward": return seekBy(-(details.seekOffset ?? 10));
      case "seekforward": return seekBy(details.seekOffset ?? 10);
      case "seekto":
        if (typeof details.seekTime === "number") {
          if (audioWithFast.fastSeek && details.fastSeek) {
            audioWithFast.fastSeek(details.seekTime);
          } else {
            audio.currentTime = details.seekTime;
          }
          updatePosition();
        }
        return;
      default: return;
    }
  };

  // Handlers
const actions: MediaSessionActionLocal[] = [
  "play", "pause", "stop", "seekbackward", "seekforward", "seekto",
  "previoustrack", "nexttrack",
];
  actions.forEach((a) =>
  ms.setActionHandler?.(a, (details: MediaSessionActionDetailsLocal) => onAction(details))
);

  // Sincronizar estado
  const onTime = () => updatePosition();
  const onRate = () => updatePosition();
  const onPlay = () => { ms.playbackState = "playing"; };
  const onPause = () => { ms.playbackState = "paused"; };
  const onEnded = () => { ms.playbackState = "none"; };

  audio.addEventListener("timeupdate", onTime);
  audio.addEventListener("ratechange", onRate);
  audio.addEventListener("play", onPlay);
  audio.addEventListener("pause", onPause);
  audio.addEventListener("ended", onEnded);

  updatePosition();

  // Limpieza
  return () => {
    actions.forEach((a) => ms.setActionHandler?.(a, null));
    audio.removeEventListener("timeupdate", onTime);
    audio.removeEventListener("ratechange", onRate);
    audio.removeEventListener("play", onPlay);
    audio.removeEventListener("pause", onPause);
    audio.removeEventListener("ended", onEnded);
  };
}

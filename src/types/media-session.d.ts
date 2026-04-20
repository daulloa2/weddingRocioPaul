// src/types/media-session.d.ts
export {};

declare global {
  interface Navigator {
    // opcional (en algunos TS ya existe, esto solo amplía)
    mediaSession?: unknown;
  }
}

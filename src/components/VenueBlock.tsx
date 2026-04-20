"use client";

import { Great_Vibes, Cormorant_Garamond, Mea_Culpa } from "next/font/google";

// --- Paleta de colores ---
const LILA_BORDER = "#D6C6D9"; // Lila Suave para los bordes
const LILA_BG_BTN = "rgba(214, 198, 217, 0.25)"; // Fondo lila transparente para el botón
const TEXT_MAIN = "#334155"; // Gris Cenizo para títulos y textos principales
const TEXT_MUTED = "#475569"; // Gris cenizo ligeramente más claro para direcciones/hora

const mea_culpa = Mea_Culpa({ subsets: ["latin"], weight: "400", variable: "--font-meaculpa", display: "swap" });
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-greatvibes",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

type Props = {
  title?: string;      // ej: "Ceremonia"
  name: string;        // ej: "Parroquia San Juan..."
  address?: string;    // dirección
  time?: string;       // ej: "08:00 PM"
  mapUrl: string;
  className?: string;
};

export default function VenueBlock({
  title,
  name,
  address,
  time,
  mapUrl,
  className,
}: Props) {
  return (
    <section className={`w-full ${className ?? ""}`}>
      <div className="relative mx-auto w-full max-w-[520px] py-6">
        {/* Hoja trasera (ligeramente girada) */}
        <div
          aria-hidden
          className="absolute inset-x-3 top-3 bottom-3 rounded-2xl bg-white/85"
          style={{
            backgroundColor: "#FFFFFF",
            border: `1px solid ${LILA_BORDER}`, // 👈 Borde lila
            boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
            transform: "rotate(-1.2deg)",
          }}
        />
        {/* Tarjeta principal */}
        <div
          className="relative rounded-2xl px-7 py-7 text-center bg-white"
          style={{
            border: `1px solid ${LILA_BORDER}`, // 👈 Borde lila
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          {title && (
            <div
              className={`${mea_culpa.className} text-[32px] sm:text-[38px] leading-none`}
              style={{ color: TEXT_MAIN }} // 👈 Gris cenizo
            >
              {title}
            </div>
          )}

          {time && (
            <div
              className="mt-2 text-[12px] sm:text-[13px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_MUTED }} // 👈 Gris cenizo suave
            >
              {time}
            </div>
          )}

          <h3
            className={`${cormorant.className} mt-3 uppercase text-[15px] sm:text-[18px]`}
            style={{ color: TEXT_MAIN, letterSpacing: "0.12em" }} // 👈 Gris cenizo
          >
            {name}
          </h3>

          {address && (
            <p 
              className={`${cormorant.className} mt-3 text-sm leading-relaxed`}
              style={{ color: TEXT_MUTED }} // 👈 Gris cenizo suave
            >
              {address}
            </p>
          )}

          <div className="mt-5">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver ${name} en el mapa`}
              className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition hover:opacity-80"
              style={{
                backgroundColor: LILA_BG_BTN, // 👈 Fondo lila súper suave
                border: `1px solid ${LILA_BORDER}`, // 👈 Borde lila
                color: TEXT_MAIN, // 👈 Texto gris cenizo
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              Ver mapa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
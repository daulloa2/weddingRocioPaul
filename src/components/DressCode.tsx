// components/DressCode.tsx
"use client";

import Image from "next/image";
import { Venus } from "lucide-react";
import { Great_Vibes } from "next/font/google";

type Swatch = { color: string; name?: string };

const SOFT_ACCENT = "#8FBFD9";
const DRESS_IMAGE = "/couple3.png"; // cámbiala si quieres otra ilustración

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-greatvibes",
  display: "swap",
});

export default function DressCode({
  title = "Código de Vestimenta",
  brideMessage = "",
  generalMessage = "",
  
  womenColors,
  className,
  titleClassName,
  captionClassName,
}: {
  title?: string;
  brideMessage?: string;
  generalMessage?: string;
  colors?: Swatch[];
  womenColors?: Swatch[];
  className?: string;
  titleClassName?: string;
  captionClassName?: string;
}) {
  // solo usamos colores de damas (primeros 4 por defecto)
  

  return (
    <section
      className={[
        "relative w-full",
        className ?? "",
      ].join(" ")}
    >
      {/* TARJETA BLANCA */}
      <div
        className="
          mx-auto w-full max-w-[640px]
          bg-white
          shadow-[0_4px_14px_rgba(0,0,0,0.04)]
          px-4 sm:px-6 py-5 sm:py-6
        "
      >
        <div className="text-center">
          {/* título */}
          <h3
            className={`font-medium text-slate-500 ${
              titleClassName ?? ""
            }`}
          >
            {title}
          </h3>

          {/* línea "Formal" debajo del título */}
          <p className={`mt-1 text-[25px] sm:text-[29px] text-slate-500 ${
              titleClassName ?? ""}`}>
            Formal
          </p>

          {/* imagen de referencia */}
          <Image
            src={DRESS_IMAGE}
            alt="Código de vestimenta"
            width={110}
            height={110}
            className="pointer-events-none mx-auto mt-3"
            style={{ height: "auto" }}
            priority={false}
          />

          {/* texto: blanco reservado para la novia */}
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <p
            className={`mt-3 text-xs sm:text-sm text-slate-600 leading-snug ${
              captionClassName ?? ""
            }`}
          >
            {brideMessage}
          </p>

            
          </div>

          {/* texto general opcional */}
          {generalMessage && (
            <p
              className={`mt-4 text-xs sm:text-sm text-slate-600 leading-snug ${
                captionClassName ?? ""
              }`}
            >
              {generalMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function PaletteInline({
  label,
  colors,
}: {
  label: string;
  colors: Swatch[];
}) {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* label + icono */}
      <div
        className={`
          inline-flex items-center gap-1.5
          text-[18px] sm:text-[20px] font-semibold tracking-wider text-slate-500
          ${greatVibes.className}
        `}
      >
        <Venus className="size-3.5" style={{ color: SOFT_ACCENT }} />
        <span>{label}</span>
      </div>

      {/* swatches en la misma línea, más pequeños */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2">
        {colors.slice(0, 4).map((s, i) => (
          <span
            key={i}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-1 shadow-inner"
            style={{
              backgroundColor: s.color,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
            }}
            aria-label={s.name ?? s.color}
            title={s.name ?? s.color}
          />
        ))}
      </div>
    </div>
  );
}

// paleta por defecto
const DEFAULT_COLORS: Swatch[] = [
  // Mujeres
  { color: "#77C3EC" },
  { color: "#89CFF0" },
  { color: "#9DD9F3" },
  { color: "#B8E2F2" },
  // Hombres (no usados aquí)
  { color: "#9C867C" },
  { color: "#C9B2A6" },
  { color: "#EBD8CD" },
  { color: "#C9C2BC" },
];

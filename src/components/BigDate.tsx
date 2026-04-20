"use client";

import * as React from "react";

const MONTHS = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];
const WEEKDAYS = [
  "DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"
];

export default function BigDate({
  date,
  location = "Loja",
  className,
  dayClassName,
  labelsClassName,
}: {
  date: Date | string | number;
  location?: string;
  className?: string;
  dayClassName?: string;
  labelsClassName?: string;
}) {
  const d = new Date(date);
  const year = d.getFullYear();
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const dow = WEEKDAYS[d.getDay()];

  // Colores extraídos de tu paleta
  const textColor = "#334155"; // Gris oscuro legible
  const numberColor = "#1E293B"; // Casi negro para el número
  const borderColor = "#D6C6D9"; // Lila Suave para las líneas y la píldora

  return (
    <section className={`w-full max-w-3xl mx-auto flex justify-center ${className ?? ""}`}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full">
        
        {/* --- LADO IZQUIERDO --- */}
        <div className="text-center py-3 border-y" style={{ borderColor: borderColor }}>
          <span className={`inline-block whitespace-nowrap uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[10px] sm:text-xs font-medium ${labelsClassName ?? ""}`} style={{ color: textColor }}>
            {dow}
          </span>
        </div>

        {/* --- CENTRO --- */}
        {/* Se eliminó mx-3 sm:mx-5 de este contenedor para que se una a los bordes */}
        <div className="border rounded-full flex flex-col items-center justify-center py-6 sm:py-8 px-5 sm:px-8 bg-transparent transition-colors duration-300 hover:bg-[#F4DDE1]/20 relative z-10" style={{ borderColor: borderColor }}>
          <span className={`uppercase tracking-[0.2em] text-[11px] sm:text-sm font-medium mb-3 ${labelsClassName ?? ""}`} style={{ color: textColor }}>
            {location}
          </span>
          <span className={`leading-none font-serif font-light ${dayClassName ?? ""}`} style={{ fontSize: "clamp(56px, 10vw, 85px)", color: numberColor }} aria-label={`Día ${day}`}>
            {day}
          </span>
          <span className={`uppercase tracking-[0.2em] text-[11px] sm:text-sm font-medium mt-3 ${labelsClassName ?? ""}`} style={{ color: textColor }}>
            {year}
          </span>
        </div>

        {/* --- LADO DERECHO --- */}
        <div className="text-center py-3 border-y" style={{ borderColor: borderColor }}>
          <span className={`inline-block whitespace-nowrap uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[10px] sm:text-xs font-medium ${labelsClassName ?? ""}`} style={{ color: textColor }}>
            {month}
          </span>
        </div>

      </div>
    </section>
  );
}
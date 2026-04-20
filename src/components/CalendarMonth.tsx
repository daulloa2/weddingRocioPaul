"use client";

import * as React from "react";
import { Heart } from "lucide-react";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }

// Colores de la paleta botánica
const SOFT_BORDER = "#D6C6D9"; // Lila Suave
const SOFT_ACCENT = "#D6C6D9"; // Azul Sereno
const TEXT_COLOR = "#334155";  // Azul oscuro para legibilidad

export default function CalendarMonth({
  date,
  highlightDate,
  startOnSunday = false,
  className,
}: {
  date: Date;
  highlightDate?: Date;
  startOnSunday?: boolean;
  className?: string;
}) {
  const base = startOfMonth(date);
  const total = daysInMonth(date);
  const highlight = highlightDate ? new Date(highlightDate) : undefined;
  const startOffset = startOnSunday ? base.getDay() : ((base.getDay() + 6) % 7);
  const weeks: (number | null)[] = Array.from({ length: startOffset + total }, (_, i) =>
    (i < startOffset ? null : i - startOffset + 1)
  );
  while (weeks.length % 7 !== 0) weeks.push(null);
  const daysShort = startOnSunday ? ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"] : ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className={`relative w-full select-none ${className ?? ""}`}>
      <div className="border-t" style={{ borderColor: SOFT_BORDER }}>
        {/* cabecera compacta */}
        <div
          className="grid grid-cols-7 text-center text-[11px] uppercase tracking-wide"
          style={{ color: TEXT_COLOR }}
        >
          {daysShort.map((d) => (
            <div key={d} className="py-1.5">{d}</div>
          ))}
        </div>

        <div className="border-t" style={{ borderColor: SOFT_BORDER }} />

        {/* filas compactas y simétricas */}
        <div className="grid grid-cols-7 gap-y-1">
          {weeks.map((day, idx) => {
            const isHighlight =
              day !== null &&
              highlight &&
              highlight.getFullYear() === date.getFullYear() &&
              highlight.getMonth() === date.getMonth() &&
              highlight.getDate() === day;

            return (
              <div key={idx} className="h-9 sm:h-10 grid place-items-center text-sm">
                {day === null ? (
                  <span className="invisible">-</span>
                ) : (
                  <div className="relative grid place-items-center h-8 w-8 sm:h-9 sm:w-9">
                    {isHighlight && (
                      <Heart
                        aria-hidden
                        className="absolute z-0 pointer-events-none size-8 sm:size-9 fill-current"
                        style={{ color: SOFT_ACCENT, transform: "scale(1.35)" }}
                      />
                    )}
                    <span
                      className="relative z-10"
                      style={{
                        color: isHighlight ? "#000000" : TEXT_COLOR,
                        fontWeight: isHighlight ? "700" : "400"
                      }}
                    >
                      {day}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
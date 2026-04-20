// components/InfoCard.tsx
"use client";

import * as React from "react";

const SOFT_ACCENT = "#8FBFD9";

export default function InfoCard({
  icon,
  title,
  children,
  className,
  titleClassName,
  bodyClassName,
  iconWrapperClassName,
  accentColor = SOFT_ACCENT,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;             // ← ahora acepta ReactNode
  children: React.ReactNode;
  className?: string;                 // ← wrapper
  titleClassName?: string;            // ← clases para el título
  bodyClassName?: string;             // ← clases para el contenido (children)
  iconWrapperClassName?: string;      // ← clases para el contenedor del ícono
  accentColor?: string;               // ← opcional: cambiar color de acento
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[520px] rounded-3xl px-6 py-6 ${className ?? ""}`}
    >
      {icon && (
        <div
          className={`mx-auto grid size-12 place-items-center rounded-2xl shadow-sm ${iconWrapperClassName ?? ""}`}
          style={{ color: accentColor }}
        >
          {icon}
        </div>
      )}

      <div className="mt-4 text-center">
        <div className={`text-xs font-semibold tracking-wider text-slate-500 ${titleClassName ?? ""}`}>
          {title}
        </div>
        <div className={`mt-2 text-sm text-slate-700 ${bodyClassName ?? ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

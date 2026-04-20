"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle2, CalendarCheck2, XCircle } from "lucide-react";
import RsvpButton from "@/components/RsvpButton";

import {
  Mea_Culpa,
} from "next/font/google";

// --- Paleta botánica unificada ---
const SOFT_ACCENT = "#a785ad";

// Colores de estado suavizados para la paleta
const COLOR_SUCCESS = "#759280"; // Verde salvia suave
const COLOR_DECLINE = "#B5838D"; // Rosa empolvado suave

const CORNER_IMAGE = "/lili1.png";

const mea_culpa = Mea_Culpa({ subsets: ["latin"], weight: "400", variable: "--font-meaculpa", display: "swap" });

type Family = { id: string; nombreFamilia: string; nroPersonas: number };

export default function ConfirmCard({
  confirmed,
  declined = false,
  checking,
  prefillFamilyId,
  prefillFamily,
  onConfirmed,
  onDeclined,
  className,
  titleClassName,   
  textClassName,    
  deadlineText = "Por favor confirma tu asistencia antes del 28 de abril de 2026",
  titleWhenOpen = "Confirmar asistencia",
  titleWhenDone = "¡Gracias por confirmar!",
  titleWhenDeclined = "¡Respuesta registrada!", 
  hideIfNoPrefill = true,
  messageWhenConfirmed = "¡Nos hace mucha ilusión compartir este día contigo! 💙",
  messageWhenDeclined = "No hay problema, nos encontraremos en una siguiente ocasión",
}: {
  confirmed: boolean;
  declined?: boolean;
  checking?: boolean;
  prefillFamilyId?: string;
  prefillFamily?: Family;
  onConfirmed?: () => void;
  onDeclined?: () => void;
  className?: string;
  titleClassName?: string;
  textClassName?: string;
  deadlineText?: string;
  titleWhenOpen?: string;
  titleWhenDone?: string;
  titleWhenDeclined?: string;
  hideIfNoPrefill?: boolean;
  messageWhenConfirmed?: string;
  messageWhenDeclined?: string;
}) {
  const hasPrefill = Boolean(prefillFamilyId || prefillFamily);
  if (hideIfNoPrefill && !hasPrefill) return null;

  const showForm = !confirmed && !declined;

  return (
    <section className={`w-full ${className ?? ""}`}>
      <div
        className="relative overflow-visible mx-auto w-full max-w-[520px] sm:max-w-[720px] px-6 py-10 text-center"
      >
        {/* Adorno superior izquierdo */}
        <Image
          src={CORNER_IMAGE}
          alt=""
          width={150}
          height={150}
          aria-hidden
          className="pointer-events-none select-none absolute z-0"
          style={{ 
            right: "-4%",
            top: "-8%",
            transform: "rotate(55deg)", 
            width: "7rem", height: "auto" }}
          priority={false}
        />
        
        {/* Contenedor relativo para que el texto esté por encima de las flores */}
        <div className="relative z-10">
          {/* encabezado */}
          <div className="mx-auto grid place-items-center">
            <div
          className={`mx-auto grid size-12 place-items-center rounded-2xl shadow-sm`}
          style={{ color: SOFT_ACCENT }}
        >
              {confirmed ? (
                <CheckCircle2 className="size-6" style={{ color: COLOR_SUCCESS }} />
              ) : declined ? (
                <XCircle className="size-6" style={{ color: COLOR_DECLINE }} />
              ) : (
                <CalendarCheck2 className="size-6" style={{ color: SOFT_ACCENT }} />
              )}
            </div>
          </div>

          <h3 className={`${mea_culpa.className} text-[40px] sm:text-[50px] leading-tight mb-2 text-stone-600 `}>
            
            {confirmed ? titleWhenDone : (declined ? titleWhenDeclined : titleWhenOpen)}
          </h3>

          {showForm ? (
            <>
              <p className={`mt-3 text-[15px] ${textClassName ?? ""}`} style={{ color: "#475569" }}>
                {deadlineText}
              </p>

              {hasPrefill && !checking && (
                <div className="mt-6 mb-2">
                  <RsvpButton
                    triggerLabel="Confirmar"
                    prefillFamilyId={prefillFamilyId}
                    prefillFamily={prefillFamily}
                    greetingTemplate="{{nombre}}"
                    titleClassName={titleClassName}
                    textClassName={textClassName}
                    note="Nos encantará contar con tu presencia. Con su confirmación, nos ayudará a planificar mejor este día tan especial."
                    requirePrefill
                    onConfirmed={onConfirmed}
                    onDeclined={onDeclined}   
                  />
                </div>
              )}

              <p className={`mt-4 text-xs ${textClassName ?? ""}`} style={{ color: "#64748B", lineHeight: 1.5 }}>
                Si necesitas actualizar tu respuesta más adelante, contáctanos.
              </p>
            </>
          ) : confirmed ? (
            <p className={`mt-3 text-[15px] ${textClassName ?? ""}`} style={{ color: "#475569" }}>
              {messageWhenConfirmed}
            </p>
          ) : (
            <p className={`mt-3 text-[15px] ${textClassName ?? ""}`} style={{ color: "#475569" }}>
              {messageWhenDeclined}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

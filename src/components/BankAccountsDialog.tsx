"use client";

import * as React from "react";
import Image from "next/image";
import { Copy, Check, Banknote, QrCode } from "lucide-react";
import {
  Mea_Culpa,
} from "next/font/google";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// --- Paleta botánica unificada ---
const SOFT_BORDER = "#D6C6D9"; // Lila Suave (bordes)
const SOFT_ACCENT = "#7A96AD"; // Azul Sereno oscuro para el icono
const SOFT_TEXT = "#334155"; // Gris Cenizo
const BG_LILA = "#F0EBF2"; // Lila muy suave y elegante para el fondo principal del modal
const BG_HUESO = "#FAFAFA"; // Blanco roto / Crema muy sutil para las tarjetas internas

// Usamos la misma flor de la sección de regalos
const CORNER_IMAGE = "/lili1.png";

const mea_culpa = Mea_Culpa({ subsets: ["latin"], weight: "400", variable: "--font-meaculpa", display: "swap" });

export type BankAccount = {
  bank: string;
  holder: string;
  account: string;
  dni: string;
  qr?: string; 
};

export default function BankAccountsDialog({
  open,
  onOpenChange,
  accounts,
  title = "Cuentas para regalo",
  description = "Gracias por tu cariño. Puedes usar cualquiera de estas cuentas:",
  titleClassName,
  textClassName,
  onShowQR, 
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accounts: BankAccount[];
  title?: string;
  description?: string;
  titleClassName?: string;
  textClassName?: string;
  onShowQR?: (account: BankAccount) => void; 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Hemos quitado "overflow-hidden" si estaba bloqueando la X (que suele renderizarse fuera o en el borde superior derecho)
        // y añadido estilos para asegurar que la X se vea sobre el fondo.
        className="sm:max-w-2xl rounded-[28px] p-0 border"
        style={{
          borderColor: SOFT_BORDER,
          backgroundColor: BG_LILA, // 1️⃣ Fondo lila suave y plano
        }}
      >
        {/* Contenedor relativo interior para los adornos sin tapar los controles del Dialog base */}
        <div className="relative w-full h-full overflow-hidden rounded-[28px]">
          {/* Adorno superior derecho */}
          <Image
            src={CORNER_IMAGE}
            alt=""
            width={192}
            height={192}
            aria-hidden
            className="pointer-events-none select-none absolute right-[-2%] top-[-5%]"
            style={{ transform: "rotate(100deg)", opacity: 0.85, width: "7rem", height: "auto" }}
            priority={false}
          />
          {/* Adorno inferior izquierdo */}
          <Image
            src={CORNER_IMAGE}
            alt=""
            width={192}
            height={192}
            aria-hidden
            className="pointer-events-none select-none absolute left-[-2%] bottom-[-5%]"
            style={{ transform: "rotate(-80deg)", opacity: 0.85, width: "7rem", height: "auto" }}
            priority={false}
          />

          {/* header */}
          <DialogHeader className="pt-8 pb-2 text-center relative z-10 px-6 mt-4">
            <div
              className="mx-auto grid place-items-center size-12 rounded-2xl border"
              style={{ borderColor: SOFT_BORDER, backgroundColor: BG_HUESO }}
            >
              <Banknote className="size-6" style={{ color: SOFT_ACCENT }} />
            </div>
            <DialogTitle
              className={`text-[40px] sm:text-[50px] leading-tight text-center text-stone-600 ${mea_culpa.className} ${titleClassName ?? ""}`}
              style={{ color: SOFT_TEXT }}
            >
              {title}
            </DialogTitle>
            <DialogDescription className={`mt-2 text-[15px] text-center ${textClassName ?? ""}`} style={{ color: "#475569" }}>
              {description}
            </DialogDescription>
            <div className="mx-auto mt-4 h-[1.5px] w-24" style={{ backgroundColor: SOFT_BORDER }} />
          </DialogHeader>

          {/* contenido */}
          <div className="relative z-10 px-5 pb-8 pt-2">
            <ul className="grid gap-4 sm:grid-cols-2">
              {accounts.map((acc, i) => (
                <li
                  key={i}
                  className="rounded-2xl border p-5 shadow-sm"
                  style={{ 
                    borderColor: SOFT_BORDER,
                    backgroundColor: BG_HUESO // 2️⃣ Blanco suavizado (tono hueso/crema)
                  }}
                >
                  <div className="mb-3 text-lg font-semibold" style={{ color: SOFT_TEXT }}>{acc.bank}</div>

                  <FieldRow label="Titular" value={acc.holder} textClassName={textClassName} />
                  <FieldRow label="Nro. de cuenta" value={acc.account} copyable textClassName={textClassName} />
                  <FieldRow label="DNI" value={acc.dni} copyable textClassName={textClassName} />

                  <div className="mt-5 flex flex-wrap gap-2">
                    <CopyAllButton acc={acc} />
                    {acc.qr && (
                      <Button
                        type="button"
                        className="rounded-xl transition-colors"
                        onClick={() => onShowQR?.(acc)}
                        style={{
                          backgroundColor: "rgba(214, 198, 217, 0.4)", // Fondo lila suave un poco más notorio sobre el crema
                          border: `1px solid ${SOFT_BORDER}`,
                          color: SOFT_TEXT,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        <QrCode className="mr-2 size-4" />
                        Ver QR
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({
  label,
  value,
  copyable = false,
  textClassName,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  textClassName?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className={`text-[15px] ${textClassName ?? ""}`}>
        <span style={{ color: "#64748B" }}>{label}:</span>{" "}
        <span className="font-medium" style={{ color: "#334155" }}>{value}</span>
      </div>

      {copyable && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-xl transition-colors hover:bg-slate-100"
          onClick={handleCopy}
          aria-label={`Copiar ${label}`}
          style={{
            backgroundColor: "transparent", // Transparente para que se funda con el fondo crema
            borderColor: SOFT_BORDER,
            color: SOFT_TEXT,
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      )}
    </div>
  );
}

function CopyAllButton({ acc }: { acc: BankAccount }) {
  const [copied, setCopied] = React.useState(false);
  const text = `Banco: ${acc.bank}\nTitular: ${acc.holder}\nCuenta: ${acc.account}\nDNI: ${acc.dni}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <Button
      onClick={handleCopy}
      className="rounded-xl transition-colors"
      style={{
        backgroundColor: "rgba(214, 198, 217, 0.4)", // Fondo lila suave un poco más notorio sobre el crema
        border: `1px solid ${SOFT_BORDER}`,
        color: SOFT_TEXT,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {copied ? (
        <>
          <Check className="mr-2 size-4" /> Copiado
        </>
      ) : (
        <>
          <Copy className="mr-2 size-4" /> Copiar datos
        </>
      )}
    </Button>
  );
}
"use client";

import * as React from "react";
import Image from "next/image";
import { Gift, Banknote } from "lucide-react";
import InfoCard from "@/components/InfoCard";
import { Button } from "@/components/ui/button";
import BankAccountsDialog, { type BankAccount } from "@/components/BankAccountsDialog";
import QRImageDialog from "@/components/QRImageDialog";

// --- Paleta botánica ---
const SOFT_BTN_BG = "rgba(214, 198, 217, 0.3)"; 
const SOFT_BTN_BG_HOVER = "rgba(214, 198, 217, 0.5)"; 
const SOFT_TEXT = "#334155"; 
const ICON_COLOR = "#a785ad"; 

export default function RecGiftsSection({
  gifts = "Tu presencia es lo más valioso para nosotros. Si deseas hacernos un regalo, hemos preparado algunas opciones para facilitarte el proceso.",
  registryLabel,
  registryUrl,
  accounts = [],
  className,
  titleClassName,
  itemClassName,
}: {
  recommendations?: string;
  gifts?: string;
  registryLabel?: string;
  registryUrl?: string;
  accounts?: BankAccount[];
  className?: string;
  titleClassName?: string;
  itemClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedQR, setSelectedQR] = React.useState<string | null>(null);
  
  return (
    <section
      className={[
        "relative overflow-visible w-full px-3",
        "[--corner:clamp(52px,12vw,90px)]",
        "sm:[--corner:clamp(68px,9vw,112px)]",
        className ?? "",
      ].join(" ")}
    >
      <Image
        src="/lili1.png"
        alt=""
        width={300}
        height={300}
        aria-hidden
        className="pointer-events-none select-none absolute z-0 -top-[25px] -left-[25px] sm:top-2 sm:-left-5"
        style={{ 
          width: "7rem",
          height: "auto",
          transform: "rotate(-60deg) scaleX(-1)",
        }}
        priority={false}
      />

      <div className="relative z-10 mx-auto grid max-w-[880px] gap-6 mt-10 sm:mt-2">
        <InfoCard
          title={<span className={titleClassName}>{`Mesa de Regalos`}</span>}
          icon={<Gift className="size-6" style={{ color: ICON_COLOR }} />}
        >
          <p className={itemClassName} style={{ color: SOFT_TEXT }}>{gifts}</p>

          <div className={`mt-6 flex items-center justify-center gap-3 flex-wrap text-center ${itemClassName ?? ""}`}>
            {accounts.length > 0 && (
              <Button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl px-5 py-2 w-auto text-[15px] sm:text-[15px] font-serif leading-relaxed transition-colors duration-300"
                style={{
                  backgroundColor: SOFT_BTN_BG,
                  color: SOFT_TEXT,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(214, 198, 217, 0.5)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SOFT_BTN_BG_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SOFT_BTN_BG)}
              >
                <Banknote className="mr-2 size-5" />
                Ver cuentas
              </Button>
            )}

            {registryUrl && (
              <a
                href={registryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2 text-lg sm:text-xl font-serif leading-relaxed transition-colors duration-300"
                style={{
                  backgroundColor: SOFT_BTN_BG,
                  color: SOFT_TEXT,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(214, 198, 217, 0.5)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SOFT_BTN_BG_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SOFT_BTN_BG)}
              >
                {registryLabel ?? "Ver mesa de regalos"}
              </a>
            )}
          </div>
        </InfoCard>
      </div>

      {accounts.length > 0 && (
        <BankAccountsDialog
          open={open}
          onOpenChange={setOpen}
          accounts={accounts}
          title="Cuentas para regalo"
          description="Puedes copiar los datos que necesites. ¡Gracias!"
          onShowQR={(acc) => acc.qr && setSelectedQR(acc.qr)} 
        />
      )}

      {selectedQR && (
        <QRImageDialog
          open={!!selectedQR}
          onOpenChange={(o) => !o && setSelectedQR(null)}
          src={selectedQR}
          title="Pagar con QR"
          description="Escanéalo con tu app bancaria o wallet."
        />
      )}
    </section>
  );
}
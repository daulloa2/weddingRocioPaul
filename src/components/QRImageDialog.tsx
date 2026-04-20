// components/QRImageDialog.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, ExternalLink } from "lucide-react";

type QRImageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;                 // Ruta/URL de la imagen del QR
  alt?: string;
  title?: string;
  description?: string;
  caption?: string;            // Texto opcional debajo
};

export default function QRImageDialog({
  open,
  onOpenChange,
  src,
  alt = "Código QR de pago",
  title = "Pagar con QR",
  description = "Escanéalo con tu app bancaria o wallet.",
  caption,
}: QRImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="relative w-[min(84vw,300px)] aspect-square">
              <Image src={src} alt={alt} fill className="object-contain" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex">
              <Button type="button" className="rounded-xl px-4">
                <ExternalLink className="mr-2 size-4" />
                Abrir imagen
              </Button>
            </a>
            <a href={src} download className="inline-flex">
              <Button type="button" className="rounded-xl px-4">
                <Download className="mr-2 size-4" />
                Descargar
              </Button>
            </a>
          </div>

          {caption && <p className="text-xs text-slate-500 text-center">{caption}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

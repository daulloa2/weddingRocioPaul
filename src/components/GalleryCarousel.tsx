// components/GalleryCarousel.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from "@/components/ui/dialog";

type Img = { src: StaticImageData | string; alt?: string;  objectPosition?: string; };

const SOFT_BORDER = "#DBEAF5";
const SOFT_ACCENT = "#8FBFD9";

export default function GalleryCarousel({
  images,
  aspect = 16 / 10,
  className,
}: {
  images: Img[];
  aspect?: number;
  className?: string;
}) {
  const [[index, direction], setIndex] = React.useState<[number, 1 | -1]>([0, 1]);
  const [open, setOpen] = React.useState(false);
  const count = images.length;

  // ID estable para evitar hydration mismatch con Radix
  const dialogId = React.useId();

  function paginate(dir: 1 | -1) {
    setIndex(([i]) => [((i + dir + count) % count), dir]);
  }

  const touch = React.useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touch.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) paginate(dx < 0 ? 1 : -1);
    touch.current = null;
  }

  const current = images[index];

  return (
    <div
      className={`relative w-full max-w-full overflow-hidden bg-white ${className ?? ""}`}
      style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: aspect }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <Image
              src={current.src}
              alt={current.alt ?? `Foto ${index + 1}`}
              fill
              sizes="100dvw"
              priority={index === 0}
              className="object-cover select-none"
              style={{
                objectPosition: current.objectPosition ?? "center", // 👈 se respeta por imagen
              }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controles */}
      <button
        type="button"
        aria-label="Anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full p-2 shadow"
        style={{ backgroundColor: "rgba(255,255,255,0.9)", border: `1px solid ${SOFT_BORDER}` }}
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full p-2 shadow"
        style={{ backgroundColor: "rgba(255,255,255,0.9)", border: `1px solid ${SOFT_BORDER}` }}
        onClick={() => paginate(1)}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* lightbox (id estable en Content + mismo id en el trigger) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Ampliar imagen"
            aria-controls={dialogId}
            className="absolute right-2 top-2 grid place-items-center rounded-full p-2 shadow"
            style={{ backgroundColor: "rgba(255,255,255,0.95)", border: `1px solid ${SOFT_BORDER}` }}
          >
            <Maximize2 className="size-4" />
          </button>
        </DialogTrigger>

        <DialogContent
          id={dialogId}
          className="p-0 bg-black/95 border-none w-[min(1100px,100dvw-24px)] rounded-2xl"
        >
          <DialogTitle className="sr-only">Imagen {index + 1} de {count}</DialogTitle>

          <DialogClose asChild>
            <button className="absolute right-3 top-3 text-white/80 hover:text-white rounded-full p-1" aria-label="Cerrar">
              <X className="size-5" />
            </button>
          </DialogClose>

          <div className="grid place-items-center max-h-[86dvh]">
            <Image
              src={current.src}
              alt={current.alt ?? ""}
              width={2000}
              height={2000}
              className="w-auto h-auto max-w-[96dvw] max-h-[86dvh] object-contain select-none"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* indicadores */}
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className="h-1.5 w-5 rounded-full"
            style={{
              backgroundColor: i === index ? SOFT_ACCENT : "rgba(255,255,255,0.8)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

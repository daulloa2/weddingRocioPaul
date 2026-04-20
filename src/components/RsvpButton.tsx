"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, CalendarHeart, XCircle } from "lucide-react";
import { motion } from "framer-motion";

// --- Paleta botánica unificada ---
const SOFT_BORDER = "#D6C6D9"; // Lila Suave
const SOFT_TEXT = "#334155"; // Gris Cenizo
const BG_LILA = "#F0EBF2"; // Fondo modal lila suave
const BG_HUESO = "#FAFAFA"; // Fondo crema suavizado para el icono
const ICON_COLOR = "#a785ad"; 
// Colores de estado suavizados para la paleta
const COLOR_SUCCESS = "#759280"; // Verde salvia suave
const COLOR_DECLINE = "#B5838D"; // Rosa empolvado suave

const CORNER_IMAGE = "/lili1.png"; // La rama botánica

type Family = { id: string; nombreFamilia: string; nroPersonas: number; invitados?: { adult?: number; kids?: number; total?: number }; };

function personasLabel(n?: number) {
  if (typeof n !== "number") return "";
  return n === 1 ? "1 persona" : `${n} personas`;
}

function asistiranLabel(n?: number) {
  if (typeof n !== "number") return "";
  return n === 1 ? "¿Asistirás?" : `¿Asistirán?`;
}

export default function RsvpButton({
  triggerLabel = "Confirmar",
  prefillFamilyId,
  prefillFamily,
  confirmed,
  onConfirmed,
  onDeclined, // 👈 NUEVO
  greetingTemplate = "Estimad@ {{nombre}}",
  note,
  titleClassName,
  textClassName,
  requirePrefill = true,
  successYesMessage = "¡Qué emoción, nos vemos en la boda! 💙",
  successNoMessage = "No hay problema, nos encontraremos en una siguiente ocasión",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
  prefillFamilyId?: string;
  prefillFamily?: Family;
  confirmed?: boolean;
  onConfirmed?: () => void;
  onDeclined?: () => void; // 👈 NUEVO
  greetingTemplate?: string;
  note?: string;
  titleClassName?: string;
  textClassName?: string;
  requirePrefill?: boolean;
  successYesMessage?: string;
  successNoMessage?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [families, setFamilies] = React.useState<Family[]>([]);
  const [familyId, setFamilyId] = React.useState(prefillFamily?.id ?? "");
  const [attendance, setAttendance] = React.useState<"si" | "no">("si");
  const [loadingFamilies, setLoadingFamilies] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [loadedOnce, setLoadedOnce] = React.useState(false);

  const [successOpen, setSuccessOpen] = React.useState(false);
  const [successData, setSuccessData] = React.useState<
    null | { nombreFamilia: string; nroPersonas: number; asistencia: boolean }
  >(null);
  const SOFT_BTN_BG = "rgba(214, 198, 217, 0.3)";
  const [alreadyResponded, setAlreadyResponded] = React.useState(false);
  const [checkingStatus, setCheckingStatus] = React.useState(false);

  const hasPrefill = Boolean(prefillFamily || prefillFamilyId);
  const selected: Family | null =
    families.find((f) => f.id === familyId) || prefillFamily || null;

  // tratado como "ya respondió" (para ocultar trigger)
  const isConfirmed = (confirmed ?? alreadyResponded) === true;

  // Autochequeo de elegibilidad
  React.useEffect(() => {
    if (!hasPrefill) return;
    if (confirmed !== undefined) return;
    const id = prefillFamily?.id ?? prefillFamilyId!;
    let cancelled = false;

    (async () => {
      try {
        setCheckingStatus(true);
        const res = await fetch("/api/rsvp/eligible", { cache: "no-store" });
        const data = await res.json();
        const list: Family[] = data.families ?? [];
        const stillEligible = list.some((f) => f.id === id);
        if (!cancelled) setAlreadyResponded(!stillEligible);
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();

    return () => { cancelled = true; };
  }, [hasPrefill, confirmed, prefillFamily, prefillFamilyId]);

  // Carga de familias (sin prefill)
  React.useEffect(() => {
    if (!open || loadedOnce || hasPrefill || requirePrefill) return;
    (async () => {
      try {
        setLoadingFamilies(true);
        const res = await fetch("/api/rsvp/eligible", { cache: "no-store" });
        const data = await res.json();
        const list: Family[] = data.families ?? [];
        setFamilies(list);
      } finally {
        setLoadingFamilies(false);
        setLoadedOnce(true);
      }
    })();
  }, [open, loadedOnce, hasPrefill, requirePrefill]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || isConfirmed) return;
    setSubmitting(true);
    try {
      const asistenciaBool = attendance === "si";
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId: selected.id,
          nombreFamilia: selected.nombreFamilia,
          nroPersonas: selected.nroPersonas,
          asistencia: asistenciaBool,
          adultos: Number.isFinite(selected?.invitados?.adult as number)
            ? selected!.invitados!.adult
            : undefined,
          ninos: Number.isFinite(selected?.invitados?.kids as number)
            ? selected!.invitados!.kids
            : undefined,
        }),
      });

      if (res.status === 409) {
        // Ya habían respondido (desconocemos si fue sí/no) → no llamar callbacks
        setFamilies((prev) => prev.filter((f) => f.id !== selected.id));
        setFamilyId("");
        setAlreadyResponded(true);
        setOpen(false);
        return;
      }
      if (!res.ok) throw new Error(await res.text());

      // Éxito
      setFamilies((prev) => prev.filter((f) => f.id !== selected.id));
      setFamilyId("");
      setOpen(false);
      setSuccessData({
        nombreFamilia: selected.nombreFamilia,
        nroPersonas: selected.nroPersonas,
        asistencia: asistenciaBool,
      });

      setAlreadyResponded(true);

      // 👇 callback correcto según la elección
      if (asistenciaBool) onConfirmed?.();
      else onDeclined?.();

      setTimeout(() => setSuccessOpen(true), 0);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const noneLeft = loadedOnce && !loadingFamilies && families.length === 0;
  const shouldHide =
    (requirePrefill && !hasPrefill) ||
    (hasPrefill && (isConfirmed || checkingStatus));
  if (shouldHide) return null;

  const displayName = selected?.nombreFamilia ?? "__________";
  const greeting = greetingTemplate.replace("{{nombre}}", displayName);

  return (
    <>
      {/* Trigger */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="rounded-xl px-5 py-2 w-auto text-[15px] sm:text-[15px] transition-colors"
            style={{
              backgroundColor: SOFT_BTN_BG,
              color: SOFT_TEXT,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              border: "1px solid rgba(214, 198, 217, 0.5)"
            }}
            disabled={noneLeft}
            title={noneLeft ? "Ya no hay familias pendientes" : ""}
          >
            {noneLeft ? "Sin pendientes" : triggerLabel}
          </Button>
        </DialogTrigger>

        {/* Modal Principal */}
        <DialogContent
          className="sm:max-w-lg rounded-[28px] p-0 border"
          style={{
            borderColor: SOFT_BORDER,
            backgroundColor: BG_LILA,
          }}
        >
          {/* Contenedor relativo interior para los adornos sin tapar los controles del Dialog base */}
          <div className="relative w-full h-full overflow-hidden rounded-[28px] pb-6">
            
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
                <CalendarHeart className="size-6" style={{ color: ICON_COLOR }} />
              </div>
              
              <DialogTitle
                className={`mt-4 text-5xl sm:text-6xl tracking-wide text-center ${titleClassName ?? ""}`}
                style={{ color: SOFT_TEXT }}
              >
                Para:
                <div className={`mt-2 text-3xl sm:text-4xl ${titleClassName ?? ""}`} style={{ color: SOFT_TEXT }}>
                  {greeting}
                </div>

                {typeof selected?.invitados?.total === "number" && (
                  <div className={`mt-3 text-lg sm:text-xl font-sans ${textClassName ?? ""}`} style={{ color: "#475569" }}>
                    Pase válido para {personasLabel(selected.invitados?.total)}
                  </div>
                )}
              </DialogTitle>
              
              <div className="mx-auto mt-4 h-[1.5px] w-24" style={{ backgroundColor: SOFT_BORDER }} />
            </DialogHeader>

            {/* contenido */}
            <div className="relative z-10 px-6 pb-2">
              {loadingFamilies ? (
                <div className="text-sm text-center" style={{ color: "#64748B" }}>Cargando familias…</div>
              ) : noneLeft && !selected ? (
                <div className="text-sm text-center" style={{ color: "#64748B" }}>No hay familias pendientes por responder.</div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-4">
                  <div className="px-4 py-2 text-center">
                    {note && (
                      <p className={`text-sm ${textClassName ?? ""}`} style={{ color: "#475569" }}>{note}</p>
                    )}
                  </div>

                  {!requirePrefill && !hasPrefill && (
                    <div className="grid gap-2">
                      <Label className={textClassName} style={{ color: SOFT_TEXT }}>Familia</Label>
                      <Select value={familyId} onValueChange={setFamilyId}>
                        <SelectTrigger className="rounded-xl border" style={{ borderColor: SOFT_BORDER, backgroundColor: BG_HUESO, color: SOFT_TEXT }}>
                          <SelectValue placeholder="Selecciona tu familia" />
                        </SelectTrigger>
                        <SelectContent>
                          {families.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nombreFamilia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <Label className={`text-center text-2xl ${titleClassName ?? ""}`} style={{ color: SOFT_TEXT }}>
                      {asistiranLabel(selected?.invitados?.total)}
                    </Label>

                    <RadioGroup
                      value={attendance}
                      onValueChange={(v: "si" | "no") => setAttendance(v)}
                      className="grid grid-cols-2 gap-3"
                    >
                      {(["si", "no"] as const).map((val) => {
                        const selectedPill = attendance === val;
                        return (
                          <label
                            key={val}
                            htmlFor={`asist-${val}`}
                            className="group relative flex cursor-pointer select-none items-center justify-center gap-2 rounded-2xl border px-4 py-3 transition-colors"
                            style={{
                              backgroundColor: BG_HUESO,
                              borderColor: selectedPill ? SOFT_BORDER : "transparent",
                              boxShadow: selectedPill ? `0 0 0 2px ${SOFT_BORDER}` : "0 2px 8px rgba(15,23,42,0.03)",
                            }}
                          >
                            <RadioGroupItem id={`asist-${val}`} value={val} className="sr-only" />
                            {val === "si" ? (
                              <CheckCircle2
                                className="size-5"
                                style={{ color: selectedPill ? COLOR_SUCCESS : "#94A3B8" }}
                                aria-hidden
                              />
                            ) : (
                              <XCircle
                                className="size-5"
                                style={{ color: selectedPill ? COLOR_DECLINE : "#94A3B8" }}
                                aria-hidden
                              />
                            )}
                            <span className={`text-[15px] font-medium ${textClassName ?? ""}`} style={{ color: SOFT_TEXT }}>
                              {val === "si" ? "Sí" : "No"}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <DialogFooter className="pt-4">
                    <div className="w-full flex justify-center">
                      <Button
                        type="submit"
                        disabled={!selected || submitting}
                        className="rounded-xl px-6 py-2 transition-colors"
                        style={{
                          backgroundColor: SOFT_BTN_BG,
                          border: `1px solid ${SOFT_BORDER}`,
                          color: SOFT_TEXT,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        {submitting ? "Enviando..." : "Enviar confirmación"}
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md bg-transparent border-0 shadow-none p-0 [&>button]:hidden [&_[data-slot='dialog-close']]:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="rounded-[28px] p-8 shadow-2xl border"
            style={{
              backgroundColor: BG_HUESO,
              borderColor: SOFT_BORDER,
            }}
          >
            <DialogHeader className="items-center">
              <div
                className="mb-4 grid place-items-center size-14 rounded-full border"
                style={{ 
                  backgroundColor: successData?.asistencia ? "rgba(117, 146, 128, 0.15)" : "rgba(181, 131, 141, 0.15)", // Fondos suaves verde/rosa
                  borderColor: successData?.asistencia ? COLOR_SUCCESS : COLOR_DECLINE 
                }}
              >
                {successData?.asistencia ? (
                  <CheckCircle2 className="size-7" style={{ color: COLOR_SUCCESS }} />
                ) : (
                  <XCircle className="size-7" style={{ color: COLOR_DECLINE }} />
                )}
              </div>
              <DialogTitle className={`text-center text-3xl ${titleClassName ?? ""}`} style={{ color: SOFT_TEXT }}>
                {successData?.asistencia ? "¡Confirmación enviada!" : "¡Respuesta registrada!"}
              </DialogTitle>
            </DialogHeader>

            <div className={`space-y-2 mt-4 text-[15px] text-center ${textClassName ?? ""}`} style={{ color: "#475569" }}>
              <p>
                Registramos la respuesta de <b>{successData?.nombreFamilia}</b> para{" "}
                <b>{personasLabel(successData?.nroPersonas)}</b>.
              </p>
              {successData?.asistencia ? (
                <p>{successYesMessage}</p>
              ) : (
                <p>{successNoMessage}</p>
              )}
            </div>

            <DialogFooter className="mt-8 justify-center">
              <DialogClose asChild>
                <Button
                  className="rounded-xl px-8 transition-colors"
                  style={{
                    backgroundColor: SOFT_BTN_BG,
                    border: `1px solid ${SOFT_BORDER}`,
                    color: SOFT_TEXT,
                  }}
                >
                  Aceptar
                </Button>
              </DialogClose>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
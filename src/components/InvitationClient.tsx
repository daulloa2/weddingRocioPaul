// components/InvitationClient.tsx
"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import CalendarMonth from "@/components/CalendarMonth";
import GalleryCarousel from "@/components/GalleryCarousel";
import TextBlock from "@/components/TextBlock";
import VenueBlock from "@/components/VenueBlock";
import Timeline from "@/components/Timeline";
import BigDate from "@/components/BigDate";
import ConfirmCard from "@/components/ConfirmCard";
import dynamic from "next/dynamic";
import Image from "next/image";
import RevealSection from "@/components/RevealSection";
import RecGiftsSection from "@/components/RecGiftsSection";
import BackgroundAudio from "@/components/BackgroundAudio";
import HeroCover from "@/components/HeroCover";

import {
  Great_Vibes,
  Cormorant_Garamond,
  Lora,
  Mr_De_Haviland,
  Mea_Culpa
} from "next/font/google";

type Family = { id: string; nombreFamilia: string; nroPersonas: number };

const SOFT_BG_CARD = "#FFFFFF";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cormorant", display: "swap" });
const lora = Lora({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-lora", display: "swap" });
const mr_de_haviland = Mr_De_Haviland({ subsets: ["latin"], weight: "400", variable: "--font-mrdehaviland", display: "swap" });
const mea_culpa = Mea_Culpa({ subsets: ["latin"], weight: "400", variable: "--font-meaculpa", display: "swap" });

const CountdownBanner = dynamic(() => import("@/components/CountdownBanner"), { ssr: false });

const WEDDING_DATE = new Date("2026-05-09T16:00:00");

const CHURCH_NAME = "Iglesia Santo Domingo";
const CHURCH_MAPS_URL = "https://maps.app.goo.gl/FxZVETqsTi8tRQG56";
const RECEPTION_NAME = "Hakan";
const RECEPTION_MAPS_URL = "https://maps.app.goo.gl/wRBXe9A4DfBNwx5z5";

export default function InvitationClient({ familyIdFromUrl }: { familyIdFromUrl?: string }) {
  const [prefillFamily, setPrefillFamily] = React.useState<Family | undefined>(undefined);
  const [confirmed, setConfirmed] = React.useState(false);
  const [declined, setDeclined] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  // Lee estado desde el backend por familyId
  React.useEffect(() => {
    if (!familyIdFromUrl) { setChecking(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/guests?familyId=${encodeURIComponent(familyIdFromUrl)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`GET /api/guests?familyId failed: ${res.status}`);
        const data = await res.json();

        // Normalización (acepta varios esquemas del backend):
        const rawStr = (data.status ?? data.rsvp ?? data.response ?? data.answer ?? "")
          .toString()
          .trim()
          .toLowerCase();
        const yesLike = ["si", "sí", "yes", "true"];
        const noLike = ["no", "false"];
        const responded = data.responded === true;
        const isYes =
          yesLike.includes(rawStr) ||
          data.status === "si" ||
          data.confirmed === true ||
          (responded && data.attending === true);

        const isNo =
          noLike.includes(rawStr) ||
          data.status === "no" ||
          data.declined === true ||
          (responded && data.attending === false);

        if (!cancelled) {
          setConfirmed(Boolean(isYes));
          setDeclined(Boolean(isNo) && !isYes);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [familyIdFromUrl]);

  // Prefill de familia
  React.useEffect(() => {
    if (!familyIdFromUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/guests", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: Family[] = data.families ?? [];
        const fam = list.find((f) => f.id === familyIdFromUrl);
        if (!cancelled) setPrefillFamily(fam);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, [familyIdFromUrl]);

  return (
    <main
      className={`paper-invite relative h-dvh w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth no-scrollbar ${lora.className}`}
      style={{ overscrollBehaviorY: "contain" }}
    >
      <BackgroundAudio
        src="audio/theme.mp3"
        title="Nuestra canción"
        artist="Rocio & Paul"
        cover="/assets/1.jpg"
      />

      <div className="mx-auto max-w-[640px]">
        {/* 1 — Hero */}
        <HeroCover src="/assets/1.jpg" alt="Rocio & Paul" objectPosition="50% 30%">
          <div className="no-auto-resize">
            <h1 className={`text-center text-[64px] sm:text-[100px] ${mr_de_haviland.className} text-white drop-shadow`}>
              Rocio & Paul
            </h1>
            <p className={`mt-2 text-center text-white/90 text-[44px] sm:text-[50px] ${mr_de_haviland.className}`}>¡Nuestra Boda!</p>
          </div>

        </HeroCover>

        {/* 2 — Info Padrinos (hoja blanca) */}
        
          <section
            className="relative z-10 w-full py-16 px-4"
            style={{
              // Fondo rosa rubor al 20% de opacidad para que sea mucho más notorio y claro
              backgroundColor: "rgba(244, 221, 225, 0.18)"
            }}
          >
            <div className="mx-auto max-w-2xl text-center flex flex-col items-center">

              <TextBlock
                className={`bg-transparent shadow-none p-0`}
                paragraphClassName={`text-stone-500 text-center leading-[1.2]`}
                paragraphs={[
                  "Hay momentos en la vida que son especiales por si solos, pero compartirlos con las personas que quieres, los convierte en momentos inolvidables.",
                ]}
              />
              {/* 1. Frase introductoria */}

              {/* 2. Ilustración de los novios (Line art) */}
              <div className="mb-5 relative w-60 h-60 sm:w-50 sm:h-50 opacity-80">
                <Image
                  src="/couple1.svg" // Cambia esto por la ruta de tu ilustración
                  alt="Ilustración de los novios"
                  fill
                  className="object-contain"
                />
              </div>

              {/* 3. Título principal en cursiva */}
              <h2
                className={`${mea_culpa.className} text-[40px] sm:text-[50px] leading-tight mb-12 text-stone-600 `}
              >
                Con la bendición de Dios y <br /> nuestros queridos padres
              </h2>

              {/* 5. Sección: Padres del novio */}
              <div className="mb-10">
                <h3 className="text-stone-400 uppercase tracking-[0.15em] text-sm mb-4 font-light">
                  Padres de la novia
                </h3>
                <p className="text-slate-800 text-lg sm:text-xl font-serif leading-relaxed">
                  Esperanza Encalada Córdova <br />
                  Nelson Ribera Sánchez
                </p>
              </div>
              
              {/* 4. Sección: Padres de la novia */}
              <div className="mb-10">
                <h3 className="text-stone-400 uppercase tracking-[0.15em] text-sm mb-4 font-light">
                  Padres del novio
                </h3>
                <p className="text-slate-800 text-lg sm:text-xl font-serif leading-relaxed">
                  Sara Encarnacion Mocha <br />
                  Segundo Santos Rivera †
                </p>
              </div>

              <div className="mb-10">
                <h3 className="text-stone-400 uppercase tracking-[0.15em] text-sm mb-4 font-light">
                  Padrinos de Lazo
                </h3>
                <p className="text-slate-800 text-lg sm:text-xl font-serif leading-relaxed">
                  Max Encalada <br />
                  Betty Reyes
                </p>
              </div>
            </div>
          </section>
      

        {/* 3 — Texto + BigDate + Countdown + CalendarMonth (panel baby blue) */}
        
          <section
            className="relative px-4 sm:px-6 py-6 sm:py-8"
            style={{
              // Degradado sutil: de blanco al Lila Suave de tu paleta (con transparencia)
              background: "linear-gradient(180deg, #FFFFFF 0%, rgba(214, 198, 217, 0.4) 100%)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <div className="mx-auto w-full max-w-[560px] text-center">
              <div className="mt-4">
                <BigDate
                  date={WEDDING_DATE}
                  className={`mx-auto ${cormorant.className}`}
                  dayClassName={greatVibes.className}
                  labelsClassName={lora.className}
                />
              </div>

              <div className="mt-4">
                <CountdownBanner date={WEDDING_DATE} className="my-0" />
              </div>

              <div className="mt-6">
                <div className={`${mea_culpa.className} text-[40px] sm:text-[50px] text-center text-stone-600 font-semibold`} style={{ color: "#334155" }}>
                  El gran día
                </div>
                <div className="flex items-center justify-center gap-2 text-sm pt-4" style={{ color: "#475569" }}>
                  <CalendarIcon className="size-4" />
                  <span className="uppercase tracking-wide font-medium">
                    {WEDDING_DATE.toLocaleDateString("es-ES", { month: "long" })}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <CalendarMonth
                  className="mx-auto w-full max-w-[520px]"
                  date={WEDDING_DATE}
                  highlightDate={WEDDING_DATE}
                  startOnSunday
                />
              </div>
            </div>
          </section>
      


        {/* 6 — Imagen */}
      
          <section className="grid gap-4">
            <div
              className="relative mt-0 w-full aspect-[16/10] overflow-hidden"
              style={{ backgroundColor: SOFT_BG_CARD, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
            >
              <Image src="/assets/6.jpg" alt="Momentos" fill sizes="100vw" className="object-cover" loading="lazy" />
            </div>
          </section>
        
        {/* 4 — Venue */}
        
          <section
            className={[
              "[--corner:clamp(112px,38vw,260px)]",
              "sm:[--corner:clamp(52px,16vw,210px)]",
              "relative w-full px-4 sm:px-6",
              "pt-0 pb-0 sm:pt-0 sm:pb-0",
              "mb-0",
              "shadow-[0_4px_14px_rgba(0,0,0,0.04)]",
            ].join(" ")}
          >
            {/* Contenedor principal con espaciado, sin flex, relativo z-10 para contenido */}
            <div className="z-10 pb-9 py-9">

              {/* 1 — Bloque de Ceremonia envuelto con imagen */}
              {/* Añadimos mb-10 para mantener la separación visual entre bloques */}
              <div className="relative w-full [--rose:clamp(90px,34vw,200px)] sm:[--rose:clamp(72px,22vw,180px)] mb-10">
                <VenueBlock
                  title="Ceremonia"
                  name={CHURCH_NAME} // Reemplazar con variables reales
                  address="Vicente Rocafuerte entre Simón Bolivar y Bernardo Valdivieso, Loja"
                  time="04:00 PM"
                  mapUrl={CHURCH_MAPS_URL} // Reemplazar con variables reales
                />
                <Image
                  src="/lilyroses2.png" // Misma imagen utilizada
                  alt=""
                  width={240}
                  height={240}
                  className="pointer-events-none select-none absolute z-20" // Mismas clases, z-20 para posicionamiento
                  style={{
                    top: "calc(-0.15 * var(--rose))", // Offset negativo superior para esquina
                    right: "calc(-0.15 * var(--rose))", // Offset negativo derecho para esquina
                    width: "var(--rose)", // Misma anchura variable
                    height: "auto",
                    transform: "rotate(15deg)", // Rotación hacia adentro
                  }}
                  priority={false}
                />
              </div>

              {/* 2 — Bloque de Recepción envuelto con imagen */}
              <div className="relative w-full [--rose:clamp(90px,34vw,200px)] sm:[--rose:clamp(72px,22vw,180px)]">
                <VenueBlock
                  title="Recepción"
                  name={RECEPTION_NAME} // Reemplazar con variables reales
                  address="Av. Lateral de Paso Angel Felicisimo Rojas, Loja"
                  time="06:30 PM"
                  mapUrl={RECEPTION_MAPS_URL} // Reemplazar con variables reales
                />
                <Image
                  src="/lilyroses2.png" // Misma imagen utilizada
                  alt=""
                  width={240}
                  height={240}
                  className="pointer-events-none select-none absolute z-20" // Mismas clases, z-20 para posicionamiento
                  style={{
                    top: "calc(-0.15 * var(--rose))", // Offset negativo superior para esquina
                    right: "calc(-0.15 * var(--rose))", // Offset negativo derecho para esquina
                    width: "var(--rose)", // Misma anchura variable
                    height: "auto",
                    transform: "rotate(15deg)", // Rotación hacia adentro
                  }}
                  priority={false}
                />
              </div>

            </div>
          </section>
        
        {/* 6 — Imagen */}
        
          <section className="grid gap-4">
            <div
              className="relative mt-0 w-full aspect-[16/10] overflow-hidden"
              style={{ backgroundColor: SOFT_BG_CARD, boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
            >
              <Image
                src="/assets/10.jpg"
                alt="Momentos"
                fill sizes="100vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
          </section>
        

        {/* 5 — Timeline */}
        
          <section
            className={[
              "[--corner:clamp(112px,38vw,260px)]",
              "sm:[--corner:clamp(52px,16vw,210px)]",
              "relative w-full",
              "overflow-x-hidden overflow-hidden",
            ].join(" ")}
            style={{
              // 👇 Aplicamos el fondo rosa pastel directamente al contenedor principal
              backgroundColor: "rgba(244, 221, 225, 0.08)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
            }}
          >
            <Timeline
              items={[
                { time: "4:00 PM", label: "Ceremonia", icon: "/assets/TimelineSVG/church.svg" },
                { time: "5:00 PM", label: "Fotos", icon: "/assets/TimelineSVG/photos.svg" },
                { time: "6:00 PM", label: "Recepción", icon: "/assets/TimelineSVG/reception.svg" },
                { time: "6:30 PM", label: "Cóctel de Bienvenida", icon: "/assets/TimelineSVG/coctel.svg" },
                { time: "7:30 PM", label: "Brindis & cena", icon: "/assets/TimelineSVG/lunch.svg" },
                { time: "9:00 PM", label: "Baile", icon: "/assets/TimelineSVG/disco.svg" },
              ]}
              className="px-3"
              title="Itinerario"
              // Quitamos text-stone-600 para que tome el color Gris Cenizo del Timeline.tsx
              titleClassName={`${mea_culpa.className} text-[40px] sm:text-[50px] leading-tight mb-4`}
              itemClassName={`${lora.className}`}
            />
          </section>
        

        {/* 9 — Carrusel */}
        
          <section className="grid gap-3 [--garland:clamp(110px,26vw,200px)]">
            <GalleryCarousel
              aspect={4 / 3}
              images={[
                { src: "/assets/4.jpg", alt: "Foto 7", objectPosition: "50% 30%" },
                { src: "/assets/5.jpg", alt: "Foto 5" },
                { src: "/assets/2.jpg", alt: "Foto 6" },
                { src: "/assets/7.jpg", alt: "Foto 4", objectPosition: "50% 30%" },
                { src: "/assets/9.jpg", alt: "Foto 9", objectPosition: "50% 30%" },
                { src: "/assets/8.jpg", alt: "Foto 8", objectPosition: "50% 60%" },
              ]}
              className={`${cormorant.className} text-3xl`}
            />
          </section>
        
        {/* 8 — Recomendaciones + Regalos */}
        
          <RecGiftsSection
            className=""
            titleClassName={`${mea_culpa.className} text-[40px] sm:text-[50px] leading-tight mb-12 text-stone-600 `}
            itemClassName={`text-slate-800 text-[15px]  leading-relaxed`}
            accounts={[
              { bank: "Banco Pichincha", holder: "Paul Rivera Encarnación", account: "2207481499", dni: "1104823263" },
              { bank: "Cooperativa JEP", holder: "Paul Rivera Encarnación", account: "406036557504", dni: "1104823263" },
            ]}
          />

          {familyIdFromUrl && (
            <section>
              <ConfirmCard
                confirmed={confirmed}
                declined={declined}
                checking={checking}
                prefillFamilyId={familyIdFromUrl}
                prefillFamily={prefillFamily}
                onConfirmed={() => { setConfirmed(true); setDeclined(false); }}
                onDeclined={() => { setConfirmed(false); setDeclined(true); }}
                titleClassName={mea_culpa.className}
                textClassName={lora.className}
                hideIfNoPrefill
                messageWhenConfirmed="¡Nos hace mucha ilusión compartir este día contigo! 💙"
                messageWhenDeclined="No hay problema, nos encontraremos en una siguiente ocasión"
              />
            </section>

          )}
      



        {/* 12 — Cierre */}
        
          <HeroCover src="/assets/11.jpg" alt="Nos vemos pronto" objectPosition="60% 20%">
            <h1 className={`text-center text-5xl sm:text-8xl ${greatVibes.className} text-white drop-shadow`}>
              ¡Nos vemos en la boda!
            </h1>
          </HeroCover>
        
      </div>
    </main>
  );
}

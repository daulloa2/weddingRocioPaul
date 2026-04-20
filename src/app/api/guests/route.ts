// app/api/guests/route.ts
import { NextResponse } from "next/server";
import { loadGuests } from "@/lib/loadGuests";

export const runtime = "nodejs";

const OWNER  = process.env.GITHUB_OWNER!;
const REPO   = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const PATH   = process.env.GITHUB_DATA_PATH || "data/rsvps.md";
const TOKEN  = process.env.GITHUB_TOKEN!;
const GH = "https://api.github.com";

type GhFile = { content: string; sha?: string };

async function getRsvpsFile(): Promise<GhFile | null> {
  const res = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}?ref=${BRANCH}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
      cache: "no-store",
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as GhFile;
}

/* ------------------------------ Parser RSVP MD ------------------------------ */

type RsvpStatus = "si" | "no" | null;

type RsvpRecord = {
  familyId: string;
  status: RsvpStatus;
  responded: boolean;
  attending: boolean;
  declined: boolean;
  nombreFamilia?: string;
  nroPersonas?: number;
  at?: string;
};

function toBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "si", "sí", "yes", "1"].includes(s)) return true;
    if (["false", "no", "0"].includes(s)) return false;
  }
  return undefined;
}
function toNum(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}
function normStatus(v: unknown): RsvpStatus {
  const b = toBool(v);
  if (b === true) return "si";
  if (b === false) return "no";
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["si", "sí", "yes", "true", "1"].includes(s)) return "si";
    if (["no", "false", "0"].includes(s)) return "no";
  }
  return null;
}

/**
 * Parsea una tabla markdown tipo:
 * | time | family_id | nombre | nro_personas | response |
 * Sinónimos:
 *  - id: family_id, familyid, id
 *  - response: response, status, asistencia, attending, attendance, answer, rsvp
 *  - time: time, timestamp, fecha, at
 *  - nombre: nombrefamilia, nombre, name
 *  - nro: nropersonas, personas, nro, pase
 *
 * Devuelve un Map con la ÚLTIMA respuesta por familyId.
 */
function parseRsvpMarkdown(md: string): Map<string, RsvpRecord> {
  const dataLines = md
    .split(/\r?\n/)
    .filter((l) => l.trim().startsWith("|") && !l.includes("|---|"));

  if (dataLines.length === 0) return new Map();

  // primera línea: headers
  const headerCells = dataLines[0]
    .split("|")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const idx = (names: string[]) => {
    for (const n of names) {
      const i = headerCells.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };

  const iTime     = idx(["time", "timestamp", "fecha", "at"]);
  const iFamilyId = idx(["family_id", "familyid", "id"]);
  const iNombre   = idx(["nombrefamilia", "nombre", "name"]);
  const iNro      = idx(["nropersonas", "nro_personas", "personas", "nro", "pase"]);
  const iResp     = idx(["response", "status", "asistencia", "attending", "attendance", "answer", "rsvp"]);

  type RowAux = { rec: RsvpRecord; order: number; t: number | null };

  const rows: RowAux[] = [];

  // resto: cuerpo
  const body = dataLines.slice(1);
  body.forEach((line, order) => {
    const raw = line.split("|").map((s) => s.trim());
    const cells = raw.filter(Boolean); // quita celda vacía por el pipe inicial

    const familyId = iFamilyId >= 0 ? (cells[iFamilyId] ?? "").toString().trim() : "";
    if (!familyId) return;

    const nombreFamilia = iNombre >= 0 ? cells[iNombre] : undefined;
    const nroPersonas   = iNro >= 0 ? toNum(cells[iNro]) : undefined;
    const at            = iTime >= 0 ? cells[iTime] : undefined;

    let respVal: unknown = undefined;
    if (iResp >= 0) respVal = cells[iResp];

    const status = normStatus(respVal);

    const rec: RsvpRecord = {
      familyId,
      status,
      responded: status !== null,
      attending: status === "si",
      declined: status === "no",
      nombreFamilia,
      nroPersonas,
      at,
    };

    const t = at ? (Number.isFinite(Date.parse(at)) ? Date.parse(at) : null) : null;

    rows.push({ rec, order, t });
  });

  // Mantener el "último" por familyId (por fecha si existe; si no, por orden de aparición)
  const latest = new Map<string, RowAux>();
  for (const row of rows) {
    const prev = latest.get(row.rec.familyId);
    if (!prev) {
      latest.set(row.rec.familyId, row);
      continue;
    }
    if (prev.t !== null && row.t !== null) {
      if (row.t >= prev.t) latest.set(row.rec.familyId, row);
    } else {
      if (row.order >= prev.order) latest.set(row.rec.familyId, row);
    }
  }

  const out = new Map<string, RsvpRecord>();
  latest.forEach((row, key) => out.set(key, row.rec));
  return out;
}

/* ------------------------------ Handler GET ------------------------------ */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("familyId"); // opcional
    const withStatus = searchParams.get("withStatus");

    // 1) Invitados base
    const families = await loadGuests();

    // 2) RSVPs desde markdown
    const rsvpsFile = await getRsvpsFile();
    const rsvpsMd = rsvpsFile ? Buffer.from(rsvpsFile.content, "base64").toString("utf8") : "";
    const rsvpMap = rsvpsMd ? parseRsvpMarkdown(rsvpsMd) : new Map<string, RsvpRecord>();

    // (a) Detalle de una familia
    if (rawId) {
      const id = rawId.trim();

      const fam =
        families.find((f) => f.id === id) ??
        families.find((f) => f.id.toLowerCase() === id.toLowerCase()) ??
        null;

      const key = fam?.id ?? id;
      const rsvp = rsvpMap.get(key);

      const status: RsvpStatus = rsvp?.status ?? null;
      const attending = rsvp?.attending === true;
      const declined = rsvp?.declined === true;
      const responded = rsvp?.responded === true;

      // Compat: confirmed = true SOLO si es SÍ
      const confirmed = attending === true;

      return NextResponse.json({
        family: fam,
        status,           // "si" | "no" | null
        attending,        // boolean
        declined,         // boolean
        responded,        // boolean
        confirmed,        // compat histórico (solo 'true' si SÍ)
        at: rsvp?.at ?? null,
        nombreFamilia: fam?.nombreFamilia ?? rsvp?.nombreFamilia ?? null,
        nroPersonas: fam?.nroPersonas ?? rsvp?.nroPersonas ?? null,
      });
    }

    // (b) Lista enriquecida
    if (withStatus === "1") {
      const enriched = families.map((f) => {
        const r = rsvpMap.get(f.id);
        const attending = r?.attending === true;
        const declined = r?.declined === true;
        const responded = r?.responded === true;
        const confirmed = attending === true; // compat
        return {
          ...f,
          status: r?.status ?? null,
          attending,
          declined,
          responded,
          confirmed,
          at: r?.at ?? null,
        };
      });
      return NextResponse.json({ families: enriched });
    }

    // default: solo invitados
    return NextResponse.json({ families });
  } catch (e) {
    console.error(e);
    const families = await loadGuests().catch(() => []);
    return NextResponse.json({ families });
  }
}

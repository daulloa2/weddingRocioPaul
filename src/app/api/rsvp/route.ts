// api/rsvp/route.ts

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  familyId: string;
  nombreFamilia: string;
  nroPersonas: number;
  asistencia: boolean;
  adultos?: number; 
  ninos?: number;
};

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const PATH = process.env.GITHUB_DATA_PATH || "data/rsvps.md";
const TOKEN = process.env.GITHUB_TOKEN!;
const GH = "https://api.github.com";

type GhFile = { content: string; sha: string };

// === Zona horaria local para timestamps y mensajes ===
const TZ = "America/Guayaquil";

/**
 * Devuelve la fecha/hora actual como "YYYY-MM-DD HH:mm:ss" en la zona horaria indicada.
 * Usa el locale "sv-SE" para obtener un formato ISO-like y evita hour12.
 */
function nowString(tz = TZ) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const m = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}:${m.second}`;
}

async function getFile(): Promise<GhFile | null> {
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

/**
 * Sube/actualiza el archivo en GitHub. Permite pasar un mensaje de commit.
 */
async function putFile(content: string, sha?: string, message?: string) {
  const body = {
    message: message ?? `RSVP ${nowString()}`, // por defecto hora local
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(
    `${GH}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Parser para detectar qué familias ya respondieron, con el NUEVO orden:
// | family_id | creation_date | nombre_familia | adultos | niños | total | asistencia |
function parseRespondedSet(md: string) {
  const set = new Set<string>();
  for (const line of md.split("\n")) {
    if (!line.startsWith("|")) continue; // solo filas de tabla
    if (line.includes("|---|")) continue; // separador
    const cells = line.split("|").map((s) => s.trim());
    const familyId = cells[1];
    if (!familyId || familyId === "family_id") continue;
    set.add(familyId);
  }
  return set;
}

export async function POST(req: Request) {
  try {
    const {
      familyId,
      nombreFamilia,
      nroPersonas,
      asistencia,
      adultos,
      ninos,
    } = (await req.json()) as Body;

    if (
      !familyId ||
      !nombreFamilia ||
      typeof nroPersonas !== "number" ||
      typeof asistencia !== "boolean"
    ) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const existing = await getFile();

    // Header con columnas adultos y niños
    const header =
      `| family_id | creation_date | nombre_familia | adultos | niños | total | asistencia |\n` +
      `|---|---|---|---|---|---|---|\n`;

    // Timestamp en hora local (no uses toISOString, que es UTC)
    const ts = nowString();

    // Normaliza a string (evita "undefined")
    const adultosCell = Number.isFinite(adultos as number) ? String(adultos) : "";
    const ninosCell = Number.isFinite(ninos as number) ? String(ninos) : "";

    const newRow =
      `| ${familyId} | ${ts} | ${nombreFamilia} | ${adultosCell} | ${ninosCell} | ${nroPersonas} | ${asistencia ? "Sí" : "No"} |\n`;

    // Mensaje de commit solicitado
    const commitMessage = `Invitado ${nombreFamilia} - Respuesta enviada: ${nowString()}`;

    if (!existing) {
      await putFile(header + newRow, undefined, commitMessage);
      return NextResponse.json({ ok: true });
    }

    const decoded = Buffer.from(existing.content, "base64").toString("utf8");
    const responded = parseRespondedSet(decoded);

    if (responded.has(familyId)) {
      return NextResponse.json(
        { error: "Esta familia ya registró su respuesta." },
        { status: 409 }
      );
    }

    const next = decoded.endsWith("\n") ? decoded + newRow : decoded + "\n" + newRow;
    await putFile(next, existing.sha, commitMessage);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo guardar en GitHub" },
      { status: 500 }
    );
  }
}

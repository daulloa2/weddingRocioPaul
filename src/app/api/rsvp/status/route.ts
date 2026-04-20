// app/api/rsvp/status/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER  = process.env.GITHUB_OWNER!;
const REPO   = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const PATH   = process.env.GITHUB_DATA_PATH || "data/rsvps.md";
const TOKEN  = process.env.GITHUB_TOKEN!;
const GH = "https://api.github.com";

type GhFile = { content: string; sha: string };

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

// Lee el markdown (tabla) y devuelve true/false si familyId está presente.
function parseRespondedSet(md: string) {
  const set = new Set<string>();
  for (const line of md.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (line.includes("|---|")) continue;
    const cells = line.split("|").map((s) => s.trim());
    // ['', family_id, creation_date, nombre_familia, nro_personas, asistencia, '']
    const familyId = cells[1];
    if (!familyId || familyId === "family_id") continue;
    set.add(familyId);
  }
  return set;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const familyId = url.searchParams.get("familyId") || "";

    if (!familyId) {
      return NextResponse.json({ error: "Falta familyId" }, { status: 400 });
    }

    const existing = await getFile();
    if (!existing) {
      // Si aún no existe el archivo, nadie respondió todavía
      return NextResponse.json({ responded: false });
    }

    const decoded = Buffer.from(existing.content, "base64").toString("utf8");
    const responded = parseRespondedSet(decoded).has(familyId);

    return NextResponse.json({ responded });
  } catch (e) {
    console.error(e);
    // Si algo falla, por seguridad no bloqueamos: decimos que NO respondió.
    return NextResponse.json({ responded: false });
  }
}

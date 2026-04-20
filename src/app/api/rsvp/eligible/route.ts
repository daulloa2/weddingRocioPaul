// app/api/rsvp/eligible/route.ts
import { NextResponse } from "next/server";
import { loadGuests } from "@/lib/loadGuests";

export const runtime = "nodejs";

const OWNER  = process.env.GITHUB_OWNER!;
const REPO   = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const PATH   = process.env.GITHUB_DATA_PATH || "data/rsvps.md"; // path de RSVPs (markdown)
const TOKEN  = process.env.GITHUB_TOKEN!;
const GH = "https://api.github.com";

async function getFile() {
  const res = await fetch(`${GH}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}?ref=${BRANCH}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ content: string }>;
}

function parseRespondedSet(md: string) {
  const set = new Set<string>();
  for (const line of md.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (line.includes("|---|")) continue;
    const cells = line.split("|").map(s => s.trim());
    const familyId = cells[1];
    if (!familyId || familyId === "family_id") continue;
    set.add(familyId);
  }
  return set;
}

export async function GET() {
  try {
    const existing = await getFile();
    const responded = existing
      ? parseRespondedSet(Buffer.from(existing.content, "base64").toString("utf8"))
      : new Set<string>();

    const families = await loadGuests();
    const eligible = families.filter(f => !responded.has(f.id));

    return NextResponse.json({ families: eligible });
  } catch (e) {
    console.error(e);
    // Si falla GitHub, devolvemos todas para no romper UI
    const families = await loadGuests(); // ya maneja fallback local
    return NextResponse.json({ families });
  }
}

#!/usr/bin/env node
// scripts/engine/pruefen.mjs — die Durchschrift nachrechnen, ohne jemandem zu glauben.
//
//   node pruefen.mjs <kette.jsonl | kette.json>
//
// Absichtlich OHNE Abhängigkeit vom Repo: nur Node und `node:crypto`. Wer eine
// ausgeführte Kette bekommt, kopiert diese eine Datei und rechnet selbst nach.
// Die Regeln stehen in lib/engine/PROTOKOLL.md. Stimmt dieses Skript nicht mit
// lib/engine/protokoll.ts überein, ist das ein Fehler — die Selbstprüfung
// (`npm run pruefe:engine`) vergleicht beide.

import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";

const NULL_HASH = "0".repeat(64);

function kanonisch(w) {
  if (w === null || typeof w !== "object") return JSON.stringify(w ?? null);
  if (Array.isArray(w)) return `[${w.map(kanonisch).join(",")}]`;
  return `{${Object.keys(w).filter((k) => w[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${kanonisch(w[k])}`).join(",")}}`;
}
const sha256 = (t) => createHash("sha256").update(t, "utf8").digest("hex");

export function pruefeKette(kette) {
  const fehler = [];
  let vorher = NULL_HASH;
  kette.forEach((e, i) => {
    const f = (g) => fehler.push({ nr: e.nr ?? i, grund: g });
    const { v, nr, zeit, partei, art, thema, inhaltHash, bezug, sichtbarkeit } = e;
    if (nr !== i) f(`Nummer ${nr} statt ${i}`);
    if (e.vorher !== vorher) f("Kette gerissen");
    if (sha256(kanonisch({ v, nr, zeit, partei, art, thema, inhaltHash, bezug, sichtbarkeit, vorher: e.vorher })) !== e.hash) f("Eintrag verändert");
    if (e.inhalt !== undefined && sha256(kanonisch(e.inhalt)) !== inhaltHash) f("Inhalt verändert");
    try {
      const pk = createPublicKey({ key: Buffer.from(partei, "base64"), format: "der", type: "spki" });
      if (!verify(null, Buffer.from(e.hash, "utf8"), pk, Buffer.from(e.signatur, "base64"))) f("Signatur falsch");
    } catch { f("Signatur unlesbar"); }
    vorher = e.hash;
  });
  return { intakt: fehler.length === 0, laenge: kette.length, letzterHash: vorher, fehler };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const pfad = process.argv[2];
  if (!pfad) { console.error("Aufruf: node pruefen.mjs <kette.jsonl|kette.json>"); process.exit(2); }
  const text = readFileSync(pfad, "utf8").trim();
  const kette = text.startsWith("[") ? JSON.parse(text) : text.split("\n").filter(Boolean).map((z) => JSON.parse(z));
  const b = pruefeKette(kette);
  console.log(b.intakt ? `INTAKT · ${b.laenge} Einträge · letzter Fingerabdruck ${b.letzterHash}` : `NICHT INTAKT · ${b.fehler.length} Fehler`);
  for (const f of b.fehler) console.log(`  Eintrag ${f.nr}: ${f.grund}`);
  process.exit(b.intakt ? 0 : 1);
}

# Die Durchschrift — Protokoll v1

Stand 30.09.2026 · Arbeitstitel „Engine“ · Code: `lib/engine/protokoll.ts` ·
unabhängige Prüfung: `scripts/engine/pruefen.mjs`

> „Wie ein Pauspapier … es druckt einfach nur genau das ab, was jeden Moment im
> Hier und Jetzt geschieht. Nichts anderes.“ — Fabian, 30.09.2026

## Wozu

Ein Protokoll, über das jede Partei — Mensch, Betrieb, Maschine, Agent, fremdes
System — festhalten kann, was sie sagt, zusagt oder belegt, sodass **jeder
andere nachrechnen kann**, dass nichts nachträglich verändert wurde. Niemand
muss dem Betreiber glauben, auch nicht dem Urheber des Protokolls.

Das Protokoll urteilt nicht. Es kennt keine Branche, keine Anwendung und keinen
Score. WohnenWo, der Lohnrechner, Vorhaben, Rechnungen sind **Anwendungen**, die
darauf schreiben.

## Parteien

Eine Partei ist ein öffentlicher Ed25519-Schlüssel (SPKI-DER, base64). Wer
dahintersteht, sagt der Eintrag der Art `partei` (freiwillig). Der private
Schlüssel verlässt den Rechner der Partei nie.

## Eintrag

| Feld | Bedeutung |
|---|---|
| `v` | Protokollversion (1) |
| `nr` | laufende Nummer ab 0 |
| `zeit` | ISO-8601 UTC |
| `partei` | öffentlicher Schlüssel des Schreibenden |
| `art` | `aussage` · `beleg` · `abgleich` · `korrektur` · `partei` |
| `thema` | frei, wird nicht gewertet |
| `inhaltHash` | SHA-256 (hex) der kanonischen Form des Inhalts |
| `bezug` | Hashes früherer Einträge |
| `sichtbarkeit` | `privat` · `partner` · `oeffentlich` |
| `vorher` | `hash` des vorigen Eintrags, beim ersten 64 × `0` |
| `hash` | SHA-256 (hex) der kanonischen Form der Felder oben |
| `signatur` | Ed25519 der Partei über die UTF-8-Bytes von `hash`, base64 |
| `inhalt` | der Inhalt selbst — **nicht Teil der Kette**, fehlt in Ausfuhren, wenn nicht öffentlich |

**Kanonische Form:** JSON, Objektschlüssel alphabetisch sortiert, keine
Leerzeichen, `undefined`-Felder entfallen.

## Regeln

1. **Nur anhängen.** Nichts wird geändert oder gelöscht.
2. **Korrektur ist ein neuer Eintrag** (`korrektur`, `bezug` auf den alten).
   Der alte bleibt sichtbar.
3. **Privat heißt: Inhalt weg, Fingerabdruck bleibt.** Dadurch ist auch eine
   Kette mit privaten Einträgen vollständig prüfbar, und wer den Inhalt kennt,
   kann beweisen, dass es genau dieser war.
4. **Abgleich hat vier Zustände:** `gedeckt` · `widersprochen` · `offen` ·
   `kein_beleg_beigefuegt` (abgeglichen, aber kein Beleg beigelegt — weder
   gedeckt noch falsch; gleiche Werte wie `abgleiche.stand` in der Datenbank).
   Ohne Abgleich ist eine Aussage `offen` — nie `widersprochen`. Schweigen ist
   kein Geständnis.
5. **Deckung gilt je Absender** (seit 08.10.2026). Je Partei zählt ihr
   jüngster Abgleich. Eine Korrektur hebt nur Abgleiche **derselben Partei**
   auf — niemand kann fremde Abgleiche überschreiben oder aufheben.
   Zusammengefasst wird ohne Score: `widersprochen`, sobald eine Partei
   widerspricht; sonst `gedeckt`, sobald eine deckt; sonst
   `kein_beleg_beigefuegt`; sonst `offen`. Ein Widerspruch wird nie von einer
   Deckung verdeckt, und jede Ansicht kann das Bild je Absender zeigen.
6. **Auf eine gebrochene Kette wird nicht weitergeschrieben.**

## Nachrechnen

```
node scripts/engine/pruefen.mjs kette.jsonl
```

Keine Abhängigkeiten außer Node. Die Selbstprüfung (`npm run pruefe:engine`)
stellt sicher, dass dieses Skript und `protokoll.ts` zum selben Urteil kommen.

## Noch nicht Teil von v1

- Täglicher öffentlicher Anker des letzten `hash` (nächster Slice).
- Mehrere Ketten und ihr gegenseitiges Verankern (die „Brücke“ zwischen
  Systemen, die nicht diesem Rechner gehören).
- Datenbank statt Datei — ändert den Ort, nicht das Protokoll.

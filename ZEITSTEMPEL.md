# Zeitstempel über Bitcoin (OpenTimestamps)

Jede Datei `zeitstempel/<Datum>_<hash16>.txt` enthält eine Zeile mit dem letzten
Fingerabdruck der Durchschrift an diesem Tag. Die `.ots` daneben beweist, dass es
genau diese Datei spätestens zu dem Zeitpunkt gab, an dem ihr Fingerabdruck in einem
Bitcoin-Block steht — ohne GitHub, ohne uns, ohne irgendeinem Betreiber zu glauben.

## Selbst nachrechnen

    pip install opentimestamps-client
    ots upgrade zeitstempel/2026-10-08_<hash16>.txt.ots   # holt den Pfad bis zum Block (einige Stunden nach dem Stempel)
    ots verify  zeitstempel/2026-10-08_<hash16>.txt.ots   # rechnet gegen die Bitcoin-Blockkette nach

`ots verify` braucht einen Bitcoin-Knoten oder fragt öffentliche Block-Explorer; ohne beides
zeigt `ots info <datei>.ots` den vollständigen Rechenweg zum Nachrechnen von Hand.
Alternativ im Browser: https://opentimestamps.org (Datei und .ots hineinziehen).

## Und dann die Kette

Der Fingerabdruck in der .txt ist der `hash` des letzten Eintrags. Wer `ausfuhr.json`
aus derselben Git-Fassung nimmt und `node pruefen.mjs ausfuhr.json` laufen lässt, sieht
denselben letzten Fingerabdruck — damit ist die ganze Kette bis dahin an Bitcoin gebunden.

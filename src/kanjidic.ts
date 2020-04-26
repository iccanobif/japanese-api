import { readFileSync } from "fs"
import { KanjidicEntry } from "./types";

const kanjidic: { [radical: string]: KanjidicEntry } = {};

readFileSync("datasets/kanjidic", { encoding: "utf8" })
  .split("\n")
  .forEach(line => 
  {
    if (line.startsWith("#"))
      return
    const kanji = line[0]
    const allInfoFromFile = line.substr(4).trimEnd().split(" ")
    const strokeCount = Number.parseInt(allInfoFromFile.find(s => s.startsWith("S"))?.substring(1) as string)
    
    kanjidic[kanji] = { strokeCount: strokeCount }
  })

export function getKanjidicEntry(kanji: string): { strokeCount: number } | undefined
{
  return kanjidic[kanji]
}
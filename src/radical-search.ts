import { readFileSync } from "fs"
import { getKanjidicEntry } from "./kanjidic";

const radicalsFileText = readFileSync("datasets/radicals.json", { encoding: "utf8" })
const radicals = JSON.parse(radicalsFileText) as { radical: string, description: string }[]

// KRADFILE parsing
const radicalToKanji: { [radical: string]: string[] } = {};
readFileSync("datasets/kradfile-u", { encoding: "utf8" })
  .split("\n")
  .forEach(line => {
    if (line.startsWith("#"))
      return
    const kanji = line.split(" ")[0]

    const radicals = line
      .substr(4)
      .trimEnd()
      .split("")
      // Pretend that 攵 and 夂 are the same radical, not all fonts make that distinction
      // and it can be hard to tell them apart anyway.
      .map(r => r == "夂" ? "攵" : r) 

    for (const radical of radicals) {
      if (radicalToKanji[radical] === undefined)
        radicalToKanji[radical] = [kanji]
      else
        radicalToKanji[radical].push(kanji)
    }
  })

export function searchKanjiByRadicalDescriptions(query: string): string[] {
  // TODO Clean up names
  const descriptions = query.split(",").map(s => s.toLowerCase().trim())

  const radicalsToSearch = descriptions
    .map(d => radicals.filter(r => r.description.includes(d))
      .map(r => r.radical == "夂" ? "攵" : r.radical))

  const kanjiLists = radicalsToSearch.map(radicals => radicals.map(radical => radicalToKanji[radical]))

  const sets = kanjiLists.map(l => new Set(l.flat()))

  const intersection = sets.reduce((acc, val) => {
    const output = new Set<string>()
    for (const v of val) {
      if (acc.has(v))
        output.add(v)
    }
    return output
  })

  const allKanji = Array.from(intersection.values())

  const allKanjiSorted = allKanji.sort((a, b) => {
    const aKanjiData = getKanjidicEntry(a)
    const bKanjiData = getKanjidicEntry(b)

    const aStrokeCount = aKanjiData ? aKanjiData.strokeCount : 9999
    const bStrokeCount = bKanjiData ? bKanjiData.strokeCount : 9999

    const aCharCode = a.charCodeAt(0)
    const bCharCode = b.charCodeAt(0)

    if (aStrokeCount == bStrokeCount)
      return aCharCode < bCharCode ? -1 : aCharCode > bCharCode ? 1 : 0

    return aStrokeCount < bStrokeCount ? -1 : aStrokeCount > bStrokeCount ? 1 : 0
  })

  return allKanjiSorted
}
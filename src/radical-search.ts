import { readFileSync } from "fs"

const radicalsFileText = readFileSync("datasets/radicals.json", { encoding: "utf8" })
const radicals = JSON.parse(radicalsFileText) as { radical: string, description: string }[]

// KRADFILE parsing
const radicalToKanji: { [radical: string]: string[] } = {};
readFileSync("datasets/kradfile-u", { encoding: "utf8" })
  .split("\n")
  .forEach(line => 
  {
    if (line.startsWith("#"))
      return
    const kanji = line[0]
    const radicals = line.substr(4).trimEnd().split("")
    for (const radical of radicals)
    {
      if (radicalToKanji[radical] === undefined)
        radicalToKanji[radical] = [kanji]
      else
        radicalToKanji[radical].push(kanji)
    }
  })

export function searchKanjiByRadicalDescriptions(query: string): string[]
{
  // TODO Clean up names
  const descriptions = query.split(",").map(s => s.toLowerCase())

  const radicalsToSearch = descriptions
    .map(d => radicals.filter(r => r.description.includes(d))
      .map(r => r.radical))

  const kanjiLists = radicalsToSearch.map(radicals => radicals.map(radical => radicalToKanji[radical]))

  const someRandomName = kanjiLists.map(l => new Set(l.flat()))

  const intersection = someRandomName.reduce((acc, val) =>
  {
    const output = new Set<string>()
    for (const v of val)
    {
      if (acc.has(v))
        output.add(v)
    }
    return output
  })

  // console.log(intersection)
  return Array.from(intersection.values())
}
import { createReadStream } from "fs"
import readline from "readline";
import { MobiFileEntry, AccentDictionaryEntry } from "../types";

export async function* accentDictionaryReadIntermediateFile()
{
  const fileStream = createReadStream("datasets/compiled-accent-dictionary")
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl)
  {
    const data = JSON.parse(line) as MobiFileEntry
    const output: AccentDictionaryEntry = {
      keys: data.titles,
      pronounciations: data.contentLines
        .splice(1)
        .filter(l => !l.startsWith("例文:") && !l.startsWith("出典："))
    }
    yield output
  }
}
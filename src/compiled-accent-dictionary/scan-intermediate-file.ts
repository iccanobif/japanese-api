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
        .slice(1) // The first line contains the "title" of the lemma
        .filter(l => !l.startsWith("例文：") && !l.startsWith("出典：")),
      sampleSentences: data.contentLines
        .slice(1) // The first line contains the "title" of the lemma
        .filter(l => l.startsWith("例文："))
        .map(l => l.substring(3)) // Remove "例文：" string
    }
    yield output
  }
}
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

    const keys = new Set(data.titles)

    // Sometimes the first line of the content, if it's in the format 【key1・key2】,
    // might hold additional keys that where not in data.titles. Let's add them.
    if (data.contentLines[0].match(/^【.*】$/))
    {
      data.contentLines[0]
        .replace(/[【】]/g, "")
        .split("・")
        .forEach(k => keys.add(k))
    }

    const output: AccentDictionaryEntry = {
      keys: Array.from(keys),
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
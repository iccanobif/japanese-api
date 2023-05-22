import readline from "readline";
import { createReadStream } from "fs"
import { EnamdictEntry } from "./types";

export async function* enamdictParse()
{
  const fileStream = createReadStream("datasets/enamdict")
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl)
  {
    if (line.startsWith("#"))
      continue

    const sx = line.substring(0, line.indexOf("/"))
    const sxSplits = sx.split("[").map(s => s.trim())

    // I don't really care about names that are already in kana
    if (sxSplits.length == 1)
      continue;

    const kanji = sxSplits[0]
    const reading = sxSplits[1].replace("]", "").trimEnd()
    const romaji = line.substring(line.indexOf("/"))
    
    const entry: EnamdictEntry = {
      kanji,
      reading,
      romaji,
     }

     yield entry;
  }
}

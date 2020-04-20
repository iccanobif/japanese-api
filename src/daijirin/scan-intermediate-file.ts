import { createReadStream } from "fs"
import readline from "readline";
import { DaijirinEntryFromIntermediateFile } from "../types";

export async function* daijirinReadIntermediateFile()
{
  const fileStream = createReadStream("datasets/daijirin-intermediate-file")
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl)
  {
    yield JSON.parse(line) as DaijirinEntryFromIntermediateFile
  }
}
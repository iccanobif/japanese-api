import { createReadStream } from "fs"
import readline from "readline";
import { DaijirinEntryFromIntermediateFile } from "../types";
import { decode } from "html-entities"

export async function* daijirinReadIntermediateFile()
{
  const fileStream = createReadStream("datasets/daijirin-intermediate-file")
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl)
  {
    const data = JSON.parse(line) as DaijirinEntryFromIntermediateFile
    for (let i = 0; i < data.glosses.length; i++)
    {
      data.glosses[i] = decode(data.glosses[i])
    }
    yield data
  }
}
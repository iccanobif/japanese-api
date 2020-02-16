import fs, { createReadStream } from "fs"
import readline from "readline";
import xml from "xml2js";
import { DaijirinEntryFromFile } from "../types";
import { join } from "path";

const datasetsDirectory = "datasets/daijirin"

export async function* daijirinParse() {

  const files: string[] = await new Promise((resolve, reject) => {
    fs.readdir(datasetsDirectory, (err, files) => {
      if (err)
        reject(err)
      else
        resolve(files)
    })
  })

  for (const fileName of files) {
    let entryLines: string[] = []
    const fileStream = createReadStream(join(datasetsDirectory, fileName))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl) {
      const trimmedLine = line.trim().replace("<br/>", "")

      if (trimmedLine.startsWith("<idx:entry")) {
        entryLines = []
      }
      else if (trimmedLine.startsWith("</idx:entry>")) {

        // console.log(entryLines)
        // We hit </idx:entry>. parse!
        const key = entryLines[1]
          .replace("</idx:orth>", "")
          .replace(/^<idx:orth.*?>/, "")

        const output: DaijirinEntryFromFile = {
          key: key,
          lemma: entryLines[3],
          glosses: entryLines.splice(4),
        }

        yield output
      }
      else {
        if (trimmedLine.startsWith("→")) {
          // Lines that start with → are actually part of the previous gloss
          entryLines[entryLines.length - 1]
            = entryLines[entryLines.length - 1] + trimmedLine
        }
        else
          if (trimmedLine) // Ignore whitespace only lines
            entryLines.push(trimmedLine)
      }
    }
  }
}
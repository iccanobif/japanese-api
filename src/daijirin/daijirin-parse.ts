import fs, { createReadStream } from "fs"
import readline from "readline";
import xml from "xml2js";
import { DaijirinEntryFromFile } from "../edict/types";
import { join } from "path";

const datasetsDirectory = "datasets/daijirin"

export async function* daijirinParse() {
  // const fileStream = createReadStream("datasets/JMdict_e")
  // const rl = readline.createInterface({
  //   input: fileStream,
  //   crlfDelay: Infinity
  // })

  // for await (const line of rl) {
  // }

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
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith("<idx:entry")) {

        entryLines = []
      }
      else if (trimmedLine.startsWith("</idx:entry>")) {

        // We hit </idx:entry>. parse!
        const lemma = entryLines[1]
          .replace("</idx:orth>", "")
          .replace(/^<idx:orth.*?>/, "")

        const gloss = entryLines
          .splice(3)
          .join("")

        const output: DaijirinEntryFromFile = {
          lemma: lemma,
          gloss: gloss,
        }

        yield output
      }
      else {

        entryLines.push(trimmedLine)
      }
    }

    // const fileText = await new Promise<string>((resolve, reject) => {
    //   fs.readFile(datasetsDirectory + "/" + fileName,
    //     { encoding: "utf8" },
    //     (err, data) => {
    //       if (err)
    //         reject(err)
    //       else
    //         resolve(data)
    //     })
    // })

  }
}
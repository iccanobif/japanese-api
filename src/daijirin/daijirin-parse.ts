import fs, { createReadStream } from "fs"
import readline from "readline";
import { DaijirinEntryFromOriginalFile, DaijirinEntryFromIntermediateFile } from "../types";
import { join } from "path";
import { printError, log } from "../utils";
import { EOL } from "os"

const datasetsDirectory = "datasets/daijirin"

async function* daijirinParse()
{

  const files: string[] = await new Promise((resolve, reject) =>
  {
    fs.readdir(datasetsDirectory, (err, files) =>
    {
      if (err)
        reject(err)
      else
        resolve(files)
    })
  })

  for (const fileName of files)
  {
    let entryLines: string[] = []
    const fileStream = createReadStream(join(datasetsDirectory, fileName))
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    for await (const line of rl)
    {
      const trimmedLine = line.trim().replace("<br/>", "")

      if (trimmedLine.startsWith("<idx:entry"))
      {
        entryLines = []
      }
      else if (trimmedLine.startsWith("</idx:entry>"))
      {
        // We just hit </idx:entry>. Time to parse!
        const output: DaijirinEntryFromOriginalFile = {
          // Key is the text inside the <idx:orth> tag
          key: entryLines[1]
            .replace("</idx:orth>", "")
            .replace(/^<idx:orth.*?>/, "")
            .replace("=", "")
            .replace("＝", ""),
          // lemma is the first line outside of the <h2> tag
          lemma: entryLines[3],
          // glosses is the rest of the lines (excluded the first line) outside of the <h2> tag
          glosses: entryLines.splice(4),
        }

        yield output
      }
      else
      {
        if (trimmedLine.startsWith("→"))
        {
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

function generateKey(entry: DaijirinEntryFromOriginalFile): string
{
  return "KEYSTRT" + entry.lemma + "KEYEND" + entry.glosses.join("GL")
}

async function buildDaijirinIntermediateFile()
{
  const allEntries: Record<string, DaijirinEntryFromIntermediateFile> = {}
  log("Parsing entries...")
  for await (const entry of daijirinParse())
  {
    const key = generateKey(entry)
    if (allEntries[key] === undefined)
      allEntries[key] = {
        glosses: entry.glosses,
        keys: [entry.key],
        lemma: entry.lemma,
      }
    else
      allEntries[key].keys.push(entry.key)
  }

  log("Writing intermediate file...")
  const outputFile = fs.openSync("datasets/daijirin-intermediate-file", "w")

  for (const entry of Object.values(allEntries))
  {
    // Ignore entries for stuff that's not a japanese word, to save disk space
    if (entry.keys.some(k => k.match(/[a-zA-Z]/)))
      continue

    fs.writeSync(outputFile, JSON.stringify(entry) + EOL, null, "utf8")
  }
  log("Done.")
}

buildDaijirinIntermediateFile().catch(printError)


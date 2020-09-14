import fs from "fs"
import { DaijirinEntryFromIntermediateFile } from "../types";
import { printError, log, mobiFilesParse } from "../utils";
import { EOL } from "os"

const datasetsDirectory = "datasets/daijirin"

async function buildDaijirinIntermediateFile()
{
  log("Parsing entries...")
  const allEntries = await mobiFilesParse(datasetsDirectory)

  log("Writing intermediate file...")
  const outputFile = fs.openSync("datasets/daijirin-intermediate-file", "w")

  for (const entry of allEntries)
  {
    // Ignore entries for stuff that's not a japanese word, to save disk space
    if (entry.titles.some(k => k.match(/[a-zA-Z]/)))
      continue

    const output: DaijirinEntryFromIntermediateFile = {
      glosses: entry.contentLines.splice(1)
        .reduce((acc: string[], val: string) =>
        {
          // Lines that start with → are actually part of the previous gloss
          if (val.startsWith("→"))
            acc[acc.length - 1] = acc[acc.length - 1] + val
          else
            acc.push(val)
          return acc
        }, []),
      keys: entry.titles.map(t => t
        .replace("=", "")
        .replace("＝", "")),
      lemma: entry.contentLines[0],
      accents: [],
    }

    fs.writeSync(outputFile, JSON.stringify(output) + EOL, null, "utf8")
  }
  log("Done.")
}

buildDaijirinIntermediateFile().catch(printError)

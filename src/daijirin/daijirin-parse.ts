import fs from "fs"
import { DaijirinEntryFromOriginalFile, DaijirinEntryFromIntermediateFile } from "../types";
import { printError, log, mobiFilesParse } from "../utils";
import { EOL } from "os"

const datasetsDirectory = "datasets/daijirin"

async function* daijirinParse()
{
  for await (const entry of mobiFilesParse(datasetsDirectory))
  {
    const output: DaijirinEntryFromOriginalFile = {
      key: entry.title
        .replace("=", "")
        .replace("＝", ""),
      lemma: entry.contentLines[0],
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
    }

    yield output
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


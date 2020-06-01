import fs from "fs"
import { printError, log, mobiFilesParse } from "../utils";
import { EOL } from "os"

const datasetsDirectory = "datasets/compiled-accent-dictionary"

async function buildAccentDictionaryIntermediateFile()
{
  const outputFile = fs.openSync("datasets/compiled-accent-dictionary-intermediate-file", "w")
  for (const entry of await mobiFilesParse(datasetsDirectory))
  {
    fs.writeSync(outputFile, JSON.stringify(entry) + EOL, null, "utf8")
  }

  log("Done.")
}

buildAccentDictionaryIntermediateFile().catch(printError)


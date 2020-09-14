import fs, { createReadStream } from "fs"
import readline from "readline";
import { join } from "path";
import { MobiFileEntry } from "./types";

export function log(msg: string)
{
  let d = new Date()
  console.log("[" + d.toISOString() + "] " + msg)
}

export function printError(e: Error)
{
  log(e.message + " " + e.stack)
}

export function addToDictionaryOfLists(dictionary: any, key: any, value: any)
{
  if (key in dictionary)
    dictionary[key].push(value)
  else
    dictionary[key] = [value]
}

export function addToDictionaryOfSets(dictionary: any, key: any, value: any)
{
  if (key in dictionary)
    dictionary[key].add(value)
  else
    dictionary[key] = new Set([value])
}

export function uniq(arr: any[]): any[]
{
  return arr
    .sort()
    .reduce((acc, val) =>
    {
      if (acc[acc.length - 1] != val)
        acc.push(val)
      return acc
    }, [])
}

export function to<T>(value: T): T { return value; }

export async function bulkify<T>(
  iterations: number,
  iterator: AsyncGenerator<T>,
  iteration: (val: T) => any,
  bulkOperation: (acc: any[]) => Promise<void>
)
{
  let buffer = []
  for await (const val of iterator)
  {
    buffer.push(iteration(val))
    if (buffer.length == iterations)
    {
      await bulkOperation(buffer)
      buffer = []
    }
  }
  bulkOperation(buffer)
}

export function isEnglishGloss(gloss: string): boolean
{
  if (gloss.endsWith("→英和"))
    return true
  if (gloss.match(/^[\x00-\x7F]*$/))
    return true

  return false
}

export async function mobiFilesParse(datasetsDirectory: string): Promise<MobiFileEntry[]>
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

  const allEntries: Record<string, MobiFileEntry> = {}

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
        const title = entryLines[1]
          .replace("</idx:orth>", "")
          .replace(/^<idx:orth.*?>/, "")

        const contentLines = entryLines.splice(3)

        const key = contentLines.join("GL")

        if (allEntries[key] === undefined)
          allEntries[key] = {
            keys: [title],
            contentLines
          }
        else
          allEntries[key].keys.push(title)
      }
      else
      {
        if (trimmedLine) // Ignore whitespace only lines
          entryLines.push(trimmedLine)
      }
    }
  }
  return Object.values(allEntries)
}

import { Collection, MongoClient } from "mongodb"
import { environment } from "./environment"

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

// Array.prototype.shuffle = function ()
// {
//     let output = this.slice(0)
//     for (let i = output.length - 1; i > 0; i--)
//     {
//         const j = Math.floor(Math.random() * (i + 1));
//         [output[i], output[j]] = [output[j], output[i]]; // eslint-disable-line no-param-reassign
//     }
//     return output;
// }

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

export function katakanaToHiragana(str: string)
{
  // In unicode, katakana is from 12449 to 12533, hiragana from 12353, 12435

  return str
    .split("")
    .map((c) =>
    {
      const codePoint = c.codePointAt(0)
      if (codePoint && codePoint >= 12449 && codePoint <= 12534)
        return String.fromCodePoint(codePoint - 96)
      else
        return c
    })
    .join("")
}


export async function doOnMongoCollection<TInput>(
  collectionName: string,
  callback: { (coll: Collection<TInput>): Promise<any> }
): Promise<any>
{
  let client: MongoClient | null = null;

  try
  {
    client = new MongoClient(environment.mongodbUrl,
      {
        autoReconnect: false,
        useUnifiedTopology: true
      })

    await client.connect()
    const db = client.db()
    const dictionaryColl = db.collection<TInput>(collectionName)
    const result = await callback(dictionaryColl)
    return result
  }
  finally
  {
    if (client)
    {
      await client.close()
    }
  }
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

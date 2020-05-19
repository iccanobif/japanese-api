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
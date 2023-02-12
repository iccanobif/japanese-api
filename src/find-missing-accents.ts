import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { log, printError } from "./utils";
import { DictionaryEntryInDb } from "./types";
import { accentDictionaryReadIntermediateFile } from "./compiled-accent-dictionary/scan-intermediate-file";
import { toHiragana } from "./kana-tools";

async function buildEdictDB()
{
  let client: MongoClient | null = null;
  console.log(environment.mongodbUrl)
  try
  {
    client = new MongoClient(environment.mongodbUrl)
    await client.connect()
    const db = client.db()

    const dictionary = db.collection<DictionaryEntryInDb>("dictionary")

    for await (const accentItem of accentDictionaryReadIntermediateFile())
    {
      const results = await dictionary.find({
        allUnconjugatedKeys: {
          $all: accentItem.keys.map(k => ({ $elemMatch: { $eq: toHiragana(k) } }))
        }
      }).toArray()

      if (results.length === 0)
        console.log(JSON.stringify(accentItem.keys))
    }

    log("Done.")
  }
  finally
  {
    if (client)
      await client.close()
  }
}

buildEdictDB()
  .catch((err) =>
  {
    printError(err)
  })


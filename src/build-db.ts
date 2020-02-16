import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/parse-xml";
import { log, printError } from "./utils";
import { DictionaryEntry } from "./types";

export async function buildEdictDB() {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(environment.mongodbUrl,
      {
        autoReconnect: false,
        useUnifiedTopology: true
      })
    await client.connect()
    const db = client.db(environment.mongodbName)
    const dictionaryColl = db.collection("dictionary")

    // Build db only if it's currently empty
    if (await dictionaryColl.findOne({}))
    {
      log("Database already popupated, stopping database build.")
      return
    }

    for await (const val of edictXmlParse()) {
      const allReadingLinks = val.unconjugatedReadingLinks
        .concat(val.conjugatedReadingLinks)

      const keys: string[] = allReadingLinks.map(x => x.kanjiElement)
        .concat(allReadingLinks.map(x => x.readingElement))
      const newDictionaryEntry: DictionaryEntry = {
        keys: keys,
        edictGlosses: val.glosses,
        daijirinGlosses: [], // TODO
        lemmas: [] // TODO
      }
      await dictionaryColl.insertOne(newDictionaryEntry)
    }

    log("finish")
  }
  finally {
    if (client)
      await client.close()
  }
}


buildEdictDB()
  .catch((err) => {
    printError(err)
  })


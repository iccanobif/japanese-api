import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/parse-xml";
import { log, printError } from "./utils";
import { DictionaryEntry } from "./types";

async function buildEdictDB() {
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
    await dictionaryColl.deleteMany({})

    for await (const val of edictXmlParse()) {
      const allReadingLinks = val.unconjugatedReadingLinks
        .concat(val.conjugatedReadingLinks)

      const keys: string[] = allReadingLinks.map(x => x.kanjiElement)
        .concat(allReadingLinks.map(x => x.readingElement))
      const newDictionaryEntry: DictionaryEntry = {
        keys: keys,
        glosses: val.glosses,
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


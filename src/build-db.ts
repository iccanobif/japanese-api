import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/edict-parse";
import { log, printError, bulkify } from "./utils";
import { DictionaryEntryInDb, Lemma, DaijirinEntryFromIntermediateFile } from "./types";
import { daijirinReadIntermediateFile } from "./daijirin/scan-intermediate-file";

const EDICT_INSERT_BUFFER_LENGTH = 10000
const DAIJIRIN_UPSERT_BUFFER_LENGTH = 8000

export async function buildEdictDB()
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

    // Drop all collections
    for (const collection of (await db.collections())
      .filter(c => ["daijirinFileEntries", "dictionary"]
        .includes(c.collectionName)))
    {
      await collection.drop()
    }

    const dictionary = db.collection<DictionaryEntryInDb>("dictionary")

    log("Parsing edict...")
    await bulkify(EDICT_INSERT_BUFFER_LENGTH,
      edictXmlParse(),
      edictItem =>
      {
        return {
          lemmas: edictItem.lemmas,
          edictGlosses: edictItem.glosses,
          daijirinArticles: [],
          allKeys: edictItem.lemmas
            .map(l => l.kanji)
            .concat(edictItem.lemmas
              .map(l => l.reading)),
          allConjugatedKeys: edictItem.lemmas
            .filter(l => l.isConjugated)
            .map(l => l.kanji)
            .concat(edictItem.lemmas
              .filter(l => l.isConjugated)
              .map(l => l.reading)),
          allUnconjugatedKeys: edictItem.lemmas
            .filter(l => !l.isConjugated)
            .map(l => l.kanji)
            .concat(edictItem.lemmas
              .filter(l => !l.isConjugated)
              .map(l => l.reading)),
        };
      },
      async insertBuffer =>
      {
        log("Bulk writing edict")
        await dictionary.insertMany(insertBuffer)
      })
    log("Creating allUnconjugatedKeys index on dictionary...")
    await dictionary.createIndex({ allUnconjugatedKeys: 1 })

    log("Parsing daijirin...")
    // versione bulk
    {
      await bulkify(DAIJIRIN_UPSERT_BUFFER_LENGTH,
        daijirinReadIntermediateFile(),
        x => x,
        async (arr: DaijirinEntryFromIntermediateFile[]) =>
        {
          const bulkOp = dictionary.initializeOrderedBulkOp()
          for (const daijirinItem of arr)
          {
            bulkOp
              .find({
                allUnconjugatedKeys: {
                  // I still don't understand why "$all: daijirinItem.keys" doesn't work, 
                  // this thing with $elemMatch was copypasted from stack overflow, not really sure
                  // of how it works
                  $all: daijirinItem.keys.map(k => ({ $elemMatch: { $eq: k } }))
                }
              })
              .upsert()
              .update({
                $push:
                {
                  daijirinArticles: {
                    glosses: daijirinItem.glosses,
                    lemma: daijirinItem.lemma,
                  }
                },
                $setOnInsert: {
                  lemmas: daijirinItem.keys.map((k: string): Lemma => ({
                    kanji: k,
                    reading: k,
                    isConjugated: false,
                  })),
                  edictGlosses: [],
                  allKeys: daijirinItem.keys,
                  allUnconjugatedKeys: daijirinItem.keys,
                  allConjugatedKeys: []
                }
              })
          }
          log("Bulk daijirin upsert")
          await bulkOp.execute()
        })
    }
    log("Creating allKeys index on dictionary...")
    await dictionary.createIndex({ allKeys: 1 })
    log("finish")
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


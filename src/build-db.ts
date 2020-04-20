import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/edict-parse";
import { log, printError } from "./utils";
import { DictionaryEntryInDb, Lemma } from "./types";
import { daijirinReadIntermediateFile } from "./daijirin/scan-intermediate-file";

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
    for await (const edictItem of edictXmlParse())
    {
      await dictionary.insertOne({
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
      })
    }
    log("Creating allUnconjugatedKeys index on dictionary...")
    await dictionary.createIndex({ allUnconjugatedKeys: 1 })
    log("Creating daijirinArticles.lemma index on dictionary...")
    await dictionary.createIndex({ "daijirinArticles.lemma": 1 })

    log("Parsing daijirin...")
    let daijirinCount = 0;
    for await (const daijirinItem of daijirinReadIntermediateFile())
    {
      daijirinCount++
      if (daijirinCount % 10000 == 0)
        console.log(daijirinCount)

      // Find element in edict
      const edictDocuments = await dictionary.find({
        allUnconjugatedKeys: { $all: daijirinItem.keys }
      }).toArray()


      if (edictDocuments.length == 0)
      {
        // Not in edict, insert to dictionary as a daijirin only document
        await dictionary.insertOne({
          lemmas: daijirinItem.keys.map((k: string): Lemma => ({
            kanji: k,
            reading: k,
            isConjugated: false,
          })),
          edictGlosses: [],
          allKeys: daijirinItem.keys,
          allUnconjugatedKeys: daijirinItem.keys,
          allConjugatedKeys: [],
          daijirinArticles: [{
            glosses: daijirinItem.glosses,
            lemma: daijirinItem.lemma,
          }]
        })
      }
      else
      {
        // Caso strano: 口上
        // if (edictDocuments.length > 1)
        // {
        //   console.log(daijirinDocument.keys,
        //     edictDocuments.map(d => d.lemmas))
        // }
        for (const edictDocument of edictDocuments)
        {
          await dictionary.updateOne({ _id: edictDocument._id },
            {
              $push:
              // {
              //   daijirinGlosses: { $each: daijirinDocument.glosses },
              //   daijirinLemmas: daijirinDocument.lemma //is this needed? i'm not sure there will ever be more than one element for daijirinLemmas
              // },
              {
                daijirinItem: {
                  glosses: daijirinItem.glosses,
                  lemma: daijirinItem.lemma,
                }
              }
            })
        }
      }

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


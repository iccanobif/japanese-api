import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/edict-parse";
import { log, printError } from "./utils";
import { daijirinParse } from "./daijirin/daijirin-parse";
import { DictionaryEntryInDb } from "./types";
import deepEqual from "deep-equal";

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
    for await (const daijirinItem of daijirinParse())
    {
      daijirinCount++
      if (daijirinCount % 10000 == 0)
        console.log(daijirinCount)

      // Ignore entries for stuff that's not a japanese word, to save disk space
      if (daijirinItem.key.match(/[a-zA-Z]/))
        continue

      // OCCHIO: sui file di daijirin per esempio ci sono due item con chiave ティーシャツ e lemma diversi

      /*
        - Cerca documenti che hanno daijirinItem.key tra le unconjugated keys
        - inseriscici dentro questo daijirinItem
        - Cerca documento che hanno daijirinArticles con stessi lemma e glosses di daijirinItem, 
        - ma che sono stati mergiati dentro un documento che NON ha daijirinItem.key tra i keys -> questi
          sono casi in cui il documento è stato mergiato per sbaglio.
        - per questi documenti, elimina il daijirinArticle con questo daijirinItem.lemma e daijirinItem.glosses
      */

      await dictionary.updateMany({ allUnconjugatedKeys: daijirinItem.key },
        {
          $addToSet: {
            daijirinArticles: {
              lemma: daijirinItem.lemma,
              glosses: daijirinItem.glosses,
            }
          }
        })

      const documentsMaybeToClean = await dictionary.find({
        "daijirinArticles.lemma": daijirinItem.lemma,
        "daijirinArticles.glosses": daijirinItem.glosses
      }).toArray()

      for (const doc of documentsMaybeToClean)
      {
        if (!doc.allUnconjugatedKeys.includes(daijirinItem.key))
        {
          // console.log("trovato robo da sostituire!")
          // console.log(daijirinItem.lemma, daijirinItem.glosses, doc._id)
          doc.daijirinArticles = doc.daijirinArticles
            .filter(d => d.lemma != daijirinItem.lemma && !deepEqual(d.glosses, daijirinItem.glosses))
          await dictionary.replaceOne({ _id: doc._id }, doc)
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


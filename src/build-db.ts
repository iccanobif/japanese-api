import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/edict-parse";
import { log, printError, to } from "./utils";
import { daijirinParse } from "./daijirin/daijirin-parse";
import { DictionaryEntryInDb, Lemma } from "./types";

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

    const daijirinFileEntries = db.collection("daijirinFileEntries")
    const dictionary = db.collection("dictionary")

    log("Parsing edict...")
    for await (const edictItem of edictXmlParse())
    {
      await dictionary.insertOne(to<DictionaryEntryInDb>({
        lemmas: edictItem.lemmas,
        edictGlosses: edictItem.glosses,
        daijirinGlosses: [],
        daijirinLemmas: [],
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
      }))
    }
    log("Creating allKeys index on dictionary...")
    await dictionary.createIndex({ allKeys: 1 })
    // await dictionary.createIndex({ allConjugatedKeys: 1 })
    await dictionary.createIndex({ allUnconjugatedKeys: 1 })

    log("Parsing daijirin...")
    for await (const daijirinItem of daijirinParse())
    {
      // Ignore entries for stuff that's not a japanese word, to save disk space
      if (!daijirinItem.key.match(/[a-zA-Z]/)) 
        await daijirinFileEntries.insertOne(daijirinItem)
    }

    log("Merging daijirin into edict...")
    // PROBLEMA: quando decido a quale articolo edict agganciare la roba daijirin, 
    // devo usare come chiave solo i lemma non coniugati, altrimenti faccio confusione 
    // per parole tipo 楽しむ per cui esiste anche l'articolo separato 楽しみ
    const daijirinMergeCursor = daijirinFileEntries.aggregate([
      {
        $group: {
          _id: {
            lemma: "$lemma",
            glosses: "$glosses"
          },
          keys: { $push: "$key" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          lemma: "$_id.lemma",
          glosses: "$_id.glosses",
          keys: "$keys"
        }
      },
    ], { allowDiskUse: true })

    while (await daijirinMergeCursor.hasNext())
    {
      const daijirinDocument = await daijirinMergeCursor.next() as {
        lemma: string,
        glosses: string[],
        keys: string[]
      }

      // Find element in edict
      const edictDocuments = await dictionary.find({
        allUnconjugatedKeys: { $all: daijirinDocument.keys }
      }).toArray()

      if (edictDocuments.length == 0)
      {
        // Not in edict, insert to dictionary as a daijirin only document
        await dictionary.insertOne(to<DictionaryEntryInDb>({
          lemmas: daijirinDocument.keys.map((k: string): Lemma => ({
            kanji: k,
            reading: k,
            isConjugated: false,
          })),
          daijirinGlosses: daijirinDocument.glosses,
          edictGlosses: [],
          daijirinLemmas: [daijirinDocument.lemma],
          allKeys: daijirinDocument.keys,
          allUnconjugatedKeys: daijirinDocument.keys,
          allConjugatedKeys: [],
        }))
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
              $push: {
                daijirinGlosses: { $each: daijirinDocument.glosses },
                daijirinLemmas: daijirinDocument.lemma //is this needed? i'm not sure there will ever be more than one element for daijirinLemmas
              },
            })
        }
      }
    }
    log("drop daijirinFileEntries")
    // await daijirinFileEntries.drop()

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


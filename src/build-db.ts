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
    for (const collection of await db.collections())
      await collection.drop()

    const edictFileEntries = db.collection("edictFileEntries")
    const daijirinFileEntries = db.collection("daijirinFileEntries")
    const dictionary = db.collection("dictionary")

    log("Parsing edict...")
    for await (const edictItem of edictXmlParse())
    {
      await edictFileEntries.insertOne({
        entrySequence: edictItem.entrySequence,
        lemmas: edictItem.lemmas,
        partOfSpeech: edictItem.partOfSpeech,
        glosses: edictItem.glosses,
        allKeys: edictItem.lemmas.map(l => l.kanji).concat(edictItem.lemmas.map(l => l.reading))
      })
    }

    log("Creating edict indexes...")
    await edictFileEntries.createIndex({ allKeys: 1 })

    log("Parsing daijirin...")
    for await (const daijirinItem of daijirinParse())
    {
      await daijirinFileEntries.insertOne(daijirinItem)
    }

    log("Putting edict entries into dictionary...")
    await edictFileEntries.aggregate([
      {
        $project: {
          lemmas: "$lemmas",
          edictGlosses: "$glosses",
          daijirinGlosses: [],
          allKeys: "$allKeys"
        }
      },
      { $out: "dictionary" }
    ]
    ).toArray()
    await dictionary.createIndex({ allKeys: 1 })

    log("Merging daijirin into edict...")
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
      daijirinDocument.keys = daijirinDocument.keys.map((k: string) => k.replace("=", "").replace("＝", ""))

      // Find element in edict
      const edictDocuments = await dictionary.find({
        allKeys: { $all: daijirinDocument.keys }
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
          allKeys: daijirinDocument.keys
        }))
      }
      else
      {
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


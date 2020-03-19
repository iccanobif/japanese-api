import { MongoClient, CommandCursor } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/parse-xml";
import { log, printError } from "./utils";
import { daijirinParse } from "./daijirin/daijirin-parse";
import { EdictEntryFromFile, DictionaryEntryInDb, DaijirinEntryFromFile } from "./types";

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
    const db = client.db(environment.mongodbName)

    // Drop all collections
    for (const collection of await db.collections())
      await collection.drop()

    const edictFileEntries = db.collection("edictFileEntries")
    const daijirinFileEntries = db.collection("daijirinFileEntries")
    const dictionary = db.collection("dictionary")

    log("Parsing edict...")
    for await (const edictItem of edictXmlParse())
    {
      await edictFileEntries.insertOne(edictItem)
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
          lemmas: "$allKeys",
          edictGlosses: "$glosses",
          daijirinGlosses: []
        }
      },
      { $out: "dictionary" }
    ]
    ).toArray()
    await dictionary.createIndex({ lemmas: 1 })

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
      const daijirinDocument = await daijirinMergeCursor.next()
      daijirinDocument.keys = daijirinDocument.keys.map(k => k.replace("=", "").replace("＝", ""))

      // Find element in edict
      const edictDocuments = await dictionary.find({
        lemmas: { $all: daijirinDocument.keys }
      }).toArray()

      if (edictDocuments.length == 0)
      {
        // Not in edict, insert to dictionary as a daijirin only document
        const heh: DictionaryEntryInDb = {
          lemmas: daijirinDocument.keys,
          daijirinGlosses: daijirinDocument.glosses,
          edictGlosses: [],
        }
        await dictionary.insertOne(heh)
      }
      else
      {
        for (const edictDocument of edictDocuments)
        {
          await dictionary.updateOne({ _id: edictDocument._id },
            { $push: { daijirinGlosses: { $each: daijirinDocument.glosses } } })
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


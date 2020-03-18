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


    // Strange things: {lemma: "――を取・る"} has a lot of entries, with different keys
    // i casi di "lemma duplicati" sono di due tipi: diversi modi di scrivere (vedi 取引vs取り引き)
    // la stessa parola (quindi e' giusto che vengano raggruppati assiem), oppure "suffissi" come を取・る,
    // che invece si combinano con altre parole, rappresentando pero' articoli separati tra loro.
    // Per distinguere queste due casistiche, vedere se e' presente la stringa "――" nel lemma
    // (c'e' doppia implicazione tra "=" o "＝" nella key e "――" nel lemma)
    // Ma potrebbe esserci qualche caso di "――" che invece dovrebbe essere aggregato?

    // Mi verrebbe da aggregare semplicemente per {lemma: "$lemma", glosses: "$glosses"}, ma per qualche
    // motivo quell'aggregazione da' gruppi di al massimo 3 elementi, mentre quest'altra aggregazione (raggruppa per lemma 
    // i cosi senza "--") tira su pure roba da 8 elementi, per esempio {lemma: "ほととぎす 【杜鵑・時鳥・子規・不如帰・杜宇・蜀魂・田鵑】"}
    // Ma in realta' questo dovrebbe essere giusto, visto che sono casi di documenti con stessi glosse e stesso lemma!


    // db.getCollection('daijirinDictionary').aggregate([
    //     {$match: {key: /^[^＝=]*$/}},
    //     {$group: {_id: "$lemma", count: {$sum: 1}}},
    //     {$sort: {count: -1}},
    // ])

    // 1. Faccio una query aggregante su daijirin con una GROUP BY per lemma, cosi'
    //    da avere una lista di key che ha sia una chiave kanji pulita che una chiave kana pulita.
    // 2. per ogni documento estratto da quella query, cerco un item edict che abbia tra le sue
    //    chiavi tutte le chiavi che ha anche il documento daijirin. posso quindi creare un
    //    DictionaryEntryInDb con i gloss sia daijirin che edict.
    // 3. Se non trovo un elemento corrispondente su edict, metto il coso daijirin direttamente
    //    nella tabella aggregata.
    // 4. droppa tabelle edict e daijirin, lascia soltanto quella aggregata

    // db.getCollection('daijirinDictionary').aggregate([
    //   {
    //     $group: {
    //       _id: {
    //         lemma: "$lemma",
    //         glosses: "$glosses"
    //       },
    //       keys: { $push: "$key" },
    //       count: { $sum: 1 }
    //     }
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       lemma: "$_id.lemma",
    //       glosses: "$_id.glosses",
    //       keys: "$keys"
    //     }
    //   },
    // ], { allowDiskUse: true })

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


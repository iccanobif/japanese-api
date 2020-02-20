import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/parse-xml";
import { log, printError } from "./utils";
import { daijirinParse } from "./daijirin/daijirin-parse";

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
    const edictDictionary = db.collection("edictDictionary")
    const daijirinDictionary = db.collection("daijirinDictionary")

    // Build db only if it's currently empty
    if (await edictDictionary.findOne({})) {
      log("Database already popupated, stopping database build.")
      return
    }

    log("Parsing edict...")
    for await (const edictItem of edictXmlParse()) {
      await edictDictionary.insertOne(edictItem)
    }

    log("Parsing daijirin...")
    // for await (const daijirinItem of daijirinParse()) {

      // const 

      // Cerca un documento edict adeguato per questa entry 
      // Se lo trovo, aggiungo val.glosses nei daijirinGlosses (come set)
      // Se non lo trovo, cerco un documento daijirin con gli stesso glosses
      // se li trovo, aggiungo la chiave (es. nel db c'era già lo stesso gloss
      // ma con i kanji per chiave, e in questa iterazione mi è venuta fuori 
      // la versione con il reading).
      // se non li trovo, aggiungo il documento.

      // Problema: posso avere entry daijirin che non esistono su edict, ma 
      // che mi compaiono due volte nel dataset: una volta con un kanji alla
      // chiave e una volta con kana... ci sarà un modo furbo per fare 
      // una group-by?
    // }

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


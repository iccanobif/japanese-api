import { MongoClient } from "mongodb";
import { environment } from "./environment";
import { edictXmlParse } from "./edict/parse-xml";
import { log, printError } from "./utils";

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
    const coll = db.collection("edict")
    await coll.deleteMany({})

    for await (const val of edictXmlParse()) {
      console.log(val)
      await coll.insertOne(val)
    }

    // const cursor = coll.find({})
    // const arr = await cursor.toArray()
    // console.log(arr)
    log("finish")
  }
  finally {
    if (client)
      client.close()
  }
}


buildEdictDB()
  .catch((err) => {
    printError(err)
  })


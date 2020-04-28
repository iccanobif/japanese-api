import app, { setAppDatabase } from "./app"
import { log } from "./utils"
import { environment } from "./environment"
import { MongoClient } from "mongodb"

let client: MongoClient = new MongoClient(environment.mongodbUrl,
  {
    autoReconnect: false,
    useUnifiedTopology: true
  })

client.connect().then(() =>
{
  setAppDatabase(client.db())
  app.listen(environment.httpPort, "0.0.0.0")
  log("Server running on port " + environment.httpPort)
})
  .catch(console.error)

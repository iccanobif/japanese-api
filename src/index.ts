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
  // Accept connections only from localhost, since normally I want to
  // connect to the node.js process via a reverse proxy, at least for SSL offloading.
  app.listen(environment.httpPort, "localhost", () => {
    console.log("app.listen() callback")
  })
  log("Server running on http://localhost:" + environment.httpPort)
})
  .catch(console.error)

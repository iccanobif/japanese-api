import express from "express";
const app: express.Application = express()

const bodyParser = require("body-parser");
import { log } from "./utils";
import { getDictionaryEntries } from "./edict/repository";

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) =>
{
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

app.get("/", (req: any, res: any) =>
{
  res.type("text/plain")
  res.end("home")
})

app.get("/dictionary/:query", async (req: any, res: any) =>
{
  const query = req.params.query
  const entries = await getDictionaryEntries(query)
  res.json(entries)
})

export default app
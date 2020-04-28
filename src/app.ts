import express from "express";
const app: express.Application = express()

const bodyParser = require("body-parser");
import { getDictionaryEntries } from "./edict/repository";
import { searchKanjiByRadicalDescriptions } from "./radical-search";
import { DictionaryEntryInDb } from "./types";
import { Db } from "mongodb";

let db: Db

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
  const dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  const query = req.params.query
  const entries = await getDictionaryEntries(dictionary, query)
  res.json(entries)
})

app.get("/kanji-by-radical/:query", async (req: any, res: any) =>
{
  const query = req.params.query
  const output = await searchKanjiByRadicalDescriptions(query)
  res.json(output)
})


export default app

export function setAppDatabase(appDb: Db)
{
  db = appDb;
}
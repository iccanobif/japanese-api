import express from "express"
const app: express.Application = express()

const bodyParser = require("body-parser");
import { getDictionaryEntries, getEntriesForSentence, getEntriesForWordInOffset } from "./services";
import { searchKanjiByRadicalDescriptions } from "./radical-search";
import { DictionaryEntryInDb } from "./types";
import { Db } from "mongodb";
import { handleIntegratedDictionary, handleEbookDictionary } from "./integrated-dictionary/integrated-dictionary";

let db: Db

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) =>
{
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

app.get("/", (req: express.Request, res: express.Response) =>
{
  res.type("text/plain")
  res.end("home")
})

/*
  Routes outline:
  - kanji (info for a given kanji)
  - word (dictionary entry for a given word)
  - sentence (splits a sentence into words and gives dictionary entries for each of them)
  - kanji-by-radical (stays as it is)
*/

app.get("/word/:query", async (req: express.Request, res: express.Response) =>
{
  const dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  const query = decodeURIComponent(req.params.query)
  const entries = await getDictionaryEntries(dictionary, query)
  res.json(entries)
})

app.get("/word/:query/:offset", async (req: express.Request, res: express.Response) => {
  try {
    const dictionary = db.collection<DictionaryEntryInDb>("dictionary")
    const query = decodeURIComponent(req.params.query)
    const offset = Number.parseInt(req.params.offset)
    const entries = await getEntriesForWordInOffset(dictionary, query, offset)
    res.json(entries)
  } catch (error)
  {
    console.error(error)
    res.status(500)
    res.end(error.message)
  }
})

app.get("/sentence/:query/", async (req: express.Request, res: express.Response) => 
{
  const dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  const query = decodeURIComponent(req.params.query)
  const entries = await getEntriesForSentence(dictionary, query)
  res.json(entries)
})

app.get("/kanji-by-radical/:query", async (req: express.Request, res: express.Response) =>
{
  const query = req.params.query
  const output = await searchKanjiByRadicalDescriptions(query)
  res.json(output)
})

app.get("/integrated-dictionary/*", handleIntegratedDictionary)

app.get("/ebook-dictionary/*", handleEbookDictionary)

export default app

export function setAppDatabase(appDb: Db)
{
  db = appDb;
}
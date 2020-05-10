import express from "express"
import axios from "axios"
import url from "url"
const app: express.Application = express()

const bodyParser = require("body-parser");
import { getDictionaryEntries, getEntriesForSentence } from "./edict/repository";
import { searchKanjiByRadicalDescriptions } from "./radical-search";
import { DictionaryEntryInDb } from "./types";
import { Db } from "mongodb";
import { katakanaToHiragana } from "./utils";

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
  const query = req.params.query
  const entries = await getDictionaryEntries(dictionary, query)
  res.json(entries)
})

app.get("/sentence/:query/", async (req: express.Request, res: express.Response) => 
{
  const dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  const query = req.params.query
  const entries = await getEntriesForSentence(dictionary, query)
  res.json(entries)
})

app.get("/kanji-by-radical/:query", async (req: express.Request, res: express.Response) =>
{
  const query = req.params.query
  const output = await searchKanjiByRadicalDescriptions(query)
  res.json(output)
})

app.get("/integrated-dictionary/*", async (req: express.Request, res: express.Response) => 
{
  try
  {
    const targetUrlRaw = req.path.replace(/^\/integrated-dictionary\//, "")
    console.log(req.path)
    console.log(req.query)
    const targetUrl = url.parse(targetUrlRaw)
    const targetOrigin = targetUrl.protocol + "//" + targetUrl.host
    const response = await axios.get(targetUrl.href, {
      params: req.query
    })

    // to replace in all href and src:
    // - urls starting with / (replace the trailing / with /integrated-dictionary/{targetOrigin})
    // - urls starting with the target domain (replace it with /integrated-dictionary/{targetOrigin})

    const contentType: string = response.headers["content-type"]
    console.log(targetUrlRaw, contentType)
    let output = ""
    if (contentType.startsWith("text/html"))
    {
      output = response.data.replace(/(href|src)\s*=\s*(["'])\//ig,
        "$1=$2/integrated-dictionary/" + targetOrigin + "/")

      output = katakanaToHiragana(output)
    }
    else
    {
      output = response.data
    }

    res.type(contentType)
    res.send(output)
  } catch (error)
  {
    res.send(error)
  }
})

export default app

export function setAppDatabase(appDb: Db)
{
  db = appDb;
}
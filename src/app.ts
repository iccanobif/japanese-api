import express from "express"
const app: express.Application = express()

const bodyParser = require("body-parser");
import { getDictionaryEntries, getEntriesForSentence, getEntriesForWordInOffset } from "./services";
import { getRadicalsForKanji, searchKanjiByRadicalDescriptions } from "./radical-search";
import { Db } from "mongodb";
import { handleIntegratedDictionary, handleEbookDictionary, handleBooksPage } from "./integrated-dictionary/integrated-dictionary";
import { Repository } from "./repository";

let repository: Repository

app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '/integrated-dictionary'));

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
  const query = decodeURIComponent(req.params.query)
  const entries = await getDictionaryEntries(repository, query)
  res.json(entries)
})

app.get("/word/:query/:offset", async (req: express.Request, res: express.Response) => {
  try {
    const query = decodeURIComponent(req.params.query)
    const offset = Number.parseInt(req.params.offset)
    const entries = await getEntriesForWordInOffset(repository, query, offset)
    res.json(entries)
  } catch (error: any)
  {
    console.error(error)
    res.status(500)
    res.end(error.message)
  }
})

app.get("/sentence/:query/", async (req: express.Request, res: express.Response) => 
{
  const query = decodeURIComponent(req.params.query)
  const entries = await getEntriesForSentence(repository, query)
  res.json(entries)
})

app.get("/kanji-by-radical/:query", async (req: express.Request, res: express.Response) =>
{
  const query = req.params.query
  const output = await searchKanjiByRadicalDescriptions(query)
  res.json(output)
})

app.get("/radical-by-kanji/:query", async (req: express.Request, res: express.Response) =>
{
  const kanji = req.params.query
  if (kanji.length != 1)
  {
    res.status(400)
    res.end("Please input a single kanji")
    return
  }
  const output = await getRadicalsForKanji(kanji)
  res.json(output)
})

app.get("/integrated-dictionary/*", handleIntegratedDictionary)

app.get("/books", handleBooksPage)

app.get("/books/:bookId", (req, res) => handleEbookDictionary(req.params.bookId, res))

export default app

export function setAppDatabase(appDb: Db)
{
  repository = new Repository(appDb)
}

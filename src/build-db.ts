import { MongoClient } from "mongodb";
import { edictXmlParse } from "./edict/edict-parse";
import { log, printError, bulkify } from "./utils";
import { DictionaryEntryInDb, Lemma, DaijirinEntryFromIntermediateFile, AccentDictionaryEntry } from "./types";
import { daijirinReadIntermediateFile } from "./daijirin/scan-intermediate-file";
import { toHiragana } from "./kana-tools";
import { accentDictionaryReadIntermediateFile } from "./compiled-accent-dictionary/scan-intermediate-file";
import { enamdictParse } from "./enamdict";

const EDICT_INSERT_BUFFER_LENGTH = 10000
const DAIJIRIN_UPSERT_BUFFER_LENGTH = 8000
const ENAMDICT_UPSERT_BUFFER_LENGTH = 8000

async function buildDB(mongodbUrl: string)
{
  let client: MongoClient | null = null;
  console.log("Building edict database. DB URL: " + mongodbUrl)
  try
  {
    client = new MongoClient(mongodbUrl)
    await client.connect()
    const db = client.db()

    const preExistingCollections = (await db.collections())
      .filter(c => ["daijirinFileEntries", "dictionary"].includes(c.collectionName))

    // If there are pre-existing collections, skip DB build
    if (preExistingCollections.length > 0)
    {
      log("Pre-existing collections found, skipping DB build.")
      return
    }

    // Drop all pre-existing collections
    for (const collection of preExistingCollections)
    {
      await collection.drop()
    }

    const dictionary = db.collection<DictionaryEntryInDb>("dictionary")

    log("Parsing edict...")
    await bulkify(EDICT_INSERT_BUFFER_LENGTH,
      edictXmlParse(),
      edictItem =>
      {
        const unconjugatedLemmas = edictItem.lemmas.filter(l => !l.isConjugated)

        const japaneseKeys = edictItem.lemmas
            .map(l => toHiragana(l.kanji))
            .concat(edictItem.lemmas
              .map(l => toHiragana(l.reading)))

        const englishKeys = edictItem.glosses
          // remove all text enclosed in parentheses (eg. "to do (something)" -> "to do")
          .map(g => g.replace(/\([^)]*\)/g, ""))
          // remove all non alphabetic characters
          .map(g => g.replace(/[^a-zA-Z\s]/g, " "))
          // split on whitespace and flatten the array
          .map(g => g.split(/[\s]+/))
          .flat()
          // remove excessively common words in english (and, to...)
          .filter(g => !["a", "an", "the", "to", "and", "etc", "or", "of", "in", "on", "at", "for", "with", "by", "from"].includes(g.toLowerCase()))
          .filter(g => g.length > 0)

        return {
          lemmas: edictItem.lemmas,
          edictGlosses: edictItem.glosses,
          daijirinArticles: [],
          allKeys: japaneseKeys.concat(englishKeys),
          allUnconjugatedKeys: unconjugatedLemmas
            .map(l => l.kanji)
            .concat(unconjugatedLemmas
              .map(l => l.reading))
            .map(x => toHiragana(x)),
          partOfSpeech: edictItem.partOfSpeech,
        };
      },
      async insertBuffer =>
      {
        log("Bulk writing edict...")
        await dictionary.insertMany(insertBuffer)
      })
    log("Creating allUnconjugatedKeys index on dictionary...")
    await dictionary.createIndex({ allUnconjugatedKeys: 1 })

    log("Parsing daijirin...")
    await bulkify(DAIJIRIN_UPSERT_BUFFER_LENGTH,
      daijirinReadIntermediateFile(),
      x => x,
      async (arr: DaijirinEntryFromIntermediateFile[]) =>
      {
        const bulkOp = dictionary.initializeUnorderedBulkOp()
        for (const daijirinItem of arr)
        {
          const accentMatches = daijirinItem.lemma.match(/\[\d*\]/g)
            // In some cases (ex. 色) the accent isn't written in the lemma but somewhere in the glosses
            || daijirinItem.glosses.join().match(/\[\d*\]/g)
            || []

          const accents = accentMatches
            .map(a => a.replace(/[\[\]]/g, ""))
            .map(a => Number.parseInt(a)) || []

          bulkOp
            .find({
              allUnconjugatedKeys: {
                // I still don't understand why "$all: daijirinItem.keys" doesn't work, 
                // this thing with $elemMatch was copypasted from stack overflow, not really sure
                // of how it works
                $all: daijirinItem.keys.map(k => ({ $elemMatch: { $eq: toHiragana(k) } }))
              }
            })
            .upsert()
            .update({
              $push:
              {
                daijirinArticles: {
                  glosses: daijirinItem.glosses,
                  lemma: daijirinItem.lemma,
                  accents: accents,
                },
              },
              $setOnInsert: {
                lemmas: daijirinItem.keys.map((k: string): Lemma => ({
                  kanji: k,
                  reading: k,
                  isConjugated: false,
                })),
                edictGlosses: [],
                allKeys: daijirinItem.keys.map(k => toHiragana(k)),
                allUnconjugatedKeys: daijirinItem.keys.map(k => toHiragana(k)),
                partOfSpeech: [],
              }
            })
        }
        log("Bulk daijirin upsert...")
        await bulkOp.execute()
      })

    log("Creating allKeys index on dictionary...")
    await dictionary.createIndex({ allKeys: 1 })

    log("Pitch accent...")
    // Find documents with no daijirin accents
    // db.getCollection('dictionary').aggregate([
    //     { $unwind : "$daijirinArticles" }, 
    //     { $addFields: {accentCount : { $size : "$daijirinArticles.accents" } } }, 
    //     { $group : { _id : "$_id", accentCount: { $sum : "$accentCount" }, daijirinArticles : { $push : "$daijirinArticles" } }}, 
    //     { $match : { "accentCount" : 0 } },
    // ], {allowDiskUse: true})
    await bulkify(8000,
      accentDictionaryReadIntermediateFile(),
      x => x,
      async (arr: AccentDictionaryEntry[]) =>
      {
        const bulkOp = dictionary.initializeUnorderedBulkOp()
        for (const accentItem of arr)
        {
          bulkOp
            .find({
              allUnconjugatedKeys: {
                $all: accentItem.keys.map(k => ({ $elemMatch: { $eq: toHiragana(k) } }))
              },
              $where: "function() { return this.daijirinArticles.filter(a => a.accents.length > 0).length == 0 }"
            })
            .update({
              $addToSet:
              {
                accents: { $each: accentItem.pronounciations },
                sampleSentences: { $each: accentItem.sampleSentences }
              }
            })
        }
        log("Bulk accent update...")
        await bulkOp.execute()
      }
    )

    log("Parsing enamdict...")
    await bulkify(ENAMDICT_UPSERT_BUFFER_LENGTH,
      enamdictParse(),
      x =>
      {
        const newDictionaryEntry = {
          accents: [],
          sampleSentences: [],
          lemmas: [{
            kanji: x.kanji,
            reading: x.reading,
            isConjugated: false,
          }],
          edictGlosses: [x.romaji],
          daijirinArticles: [],
          allKeys: [x.kanji, toHiragana(x.reading)],
          allUnconjugatedKeys: [x.kanji, toHiragana(x.reading)],
          partOfSpeech: [],
          isEnamdictEntry: true,
        }
        return newDictionaryEntry
      },
      async (insertBuffer: DictionaryEntryInDb[]) =>
      {
        log("Bulk writing enamdict...")
        await dictionary.insertMany(insertBuffer)
      })

    log("Done.")
  }
  finally
  {
    if (client)
      await client.close()
  }
}

const mongodbUrl = process.argv[2] || "mongodb://localhost:27017/japaneseapi"
buildDB(mongodbUrl).catch(printError)


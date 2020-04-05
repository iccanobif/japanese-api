import readline from "readline";
import { createReadStream } from "fs";
import { EdictEntryFromFile, Lemma } from "../types";
import xml from "xml2js";
import { conjugate } from "./conjugate";

export async function* edictXmlParse() {
  const fileStream = createReadStream("datasets/JMdict_e")
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let xmlLines: string[] = []

  for await (const line of rl) {
    if (!line.startsWith("</entry>")) {
      if (line.match(/^<\/?keb>|^<\/?reb>|^<\/?re_restr>|^<\/?r_ele>|^<\/?pos>|^<entry>|^<ent_seq>|^<\/?gloss/g))
        xmlLines.push(line)
    }
    else {

      const entryXml = xmlLines
        .join("\n")
        .replace(/<pos>&/g, "<pos>") // For some reason <pos> entries begin with a & and end with a ;, even if it's illegal in xml
        .replace(/;<\/pos>/g, "</pos>") + "</entry>"

      xmlLines = []

      const result: any = await new Promise((resolve, reject) => {
        xml.parseString(entryXml,
          (err, result) => {
            if (err) reject(err)
            else (resolve(result))
          })
      })

      const entrySequence = Number.parseInt(result.entry.ent_seq[0])
      // When a tag has attributes, xml.parseString puts the inner text into a field called "_". I have no idea why.
      const glosses = result.entry.gloss.map((g: any) => g._ ? g._ : g) as string[]
      const kanjiElements = result.entry.keb as string[] // Some entries don't have kanjiElements (eg. ヽ)
      const onlyReadingElements = result.entry.r_ele.map((r: any) => r.reb).flat() as string[]
      const partOfSpeechList = result.entry.pos as string[]
      const readingElements = result.entry.r_ele as { reb: string[], re_restr: string[] }[]

      const unconjugatedReadingLinks: Lemma[] =
        !kanjiElements
          ? onlyReadingElements.map(r => {
            const out: Lemma = {
              kanji: r,
              reading: r,
              isConjugated: false
            }
            return out
          })
          : readingElements
            // Cartesian product between kanji elements and their readings
            .map(readingElement => kanjiElements
              // Readings that have re_restr specified are only applied that that particular kanji element
              .filter(kanjiElement =>
                !readingElement.re_restr
                || readingElement.re_restr.includes(kanjiElement))
              .map((kanjiElement): Lemma => ({
                kanji: kanjiElement,
                reading: readingElement.reb[0],
                isConjugated: false,
              })
              ))
            .flat(2)

      const conjugatedReadingLinks: Lemma[]
        = unconjugatedReadingLinks
          .map(link =>
            partOfSpeechList
              .map(pos =>
                conjugate(link.kanji, link.reading, pos))
              .flat())
          .flat()
          // Remove duplicates
          .sort((a, b) => (a.kanji + a.reading).localeCompare(b.kanji + b.reading))
          .reduce((acc, curr) => {
            const prevValue = acc[acc.length - 1]
            if (prevValue && prevValue.kanji == curr.kanji && prevValue.reading == curr.reading)
              return acc
            else
              return acc.concat([curr])
          }, [] as Lemma[])

      const newEntry: EdictEntryFromFile = {
        entrySequence: entrySequence,
        lemmas: unconjugatedReadingLinks.concat(conjugatedReadingLinks),
        partOfSpeech: partOfSpeechList,
        glosses: glosses
      }

      yield newEntry
    }
  }
}


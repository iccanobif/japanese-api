import readline from "readline";
import { createReadStream } from "fs";
import { EdictEntryFromFile, KanjiReadingLink } from "./types";
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
      if (line.match(/^<\/?keb>|^<\/?reb>|^<\/?re_restr>|^<\/?r_ele>|^<\/?pos>|^<entry>|^<\/?gloss/g))
        xmlLines.push(line)
    }
    else {

      const entryXml = xmlLines
        .join("\n")
        .replace(/<pos>&/g, "<pos>") // For some reason <pos> entries begin with a & and end with a ;, even if it's illegal in xml
        .replace(/;<\/pos>/g, "</pos>") + "</entry>"

      xmlLines = []

      console.log(entryXml)

      const result: any = await new Promise((resolve, reject) => {
        xml.parseString(entryXml,
          (err, result) => {
            if (err) reject(err)
            else (resolve(result))
          })
      })

      // When a tag has attributes, xml.parseString puts the inner text into a field called "_". I have no idea why.
      const glosses = result.entry.gloss.map(g => g._ ? g._ : g)
      const kanjiElements = result.entry.keb // Some entries don't have kanjiElements (eg. ヽ)
      const readingElements = result.entry.r_ele.map(r => r.reb).flat()
      const partOfSpeechList = result.entry.pos

      console.log(result.entry.r_ele)
      console.log(kanjiElements)

      const unconjugatedReadingLinks: KanjiReadingLink[] =
        kanjiElements
          ? result.entry.r_ele
            .map(e => kanjiElements // Cartesian product between kanji elements and their readings
              .map(kanjiElement =>
                (e.re_restr ? e.re_restr : readingElements)
                  .map(reading =>
                    ({
                      kanjiElement: kanjiElement,
                      readingElement: reading
                    })
                  )
              ))
            .flat(2)
          : readingElements.map(r => {
            const out: KanjiReadingLink = {
              kanjiElement: r,
              readingElement: r
            }
            return out
          })

      const readingLinksWithConjugations: KanjiReadingLink[]
        = unconjugatedReadingLinks
          .map(link =>
            partOfSpeechList
              .map(pos =>
                conjugate(link.kanjiElement, link.readingElement, pos))
              .flat())

      const newEntry: EdictEntryFromFile = {
        unconjugatedReadingLinks: unconjugatedReadingLinks,
        conjugatedReadingLinks: readingLinksWithConjugations,
        partOfSpeech: partOfSpeechList,
        glosses: glosses,
      }

      yield newEntry
    }
  }
}


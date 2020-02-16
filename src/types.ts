export interface KanjiReadingLink {
  kanjiElement: string,
  readingElement: string,
}

export interface EdictEntryFromFile {
  entrySequence: number, // Unique entry identifier
  unconjugatedReadingLinks: KanjiReadingLink[],
  conjugatedReadingLinks: KanjiReadingLink[],
  partOfSpeech: string[],
  glosses: string[],
}

export interface DaijirinEntryFromFile {
  key: string,
  lemma: string,
  glosses: string[],
}

// Tabelle su mongo:
// EdictEntries
// KanjiReadings

// Una tabella con tutte le possibili chiavi, coniugate e non,
// per quelle coniugate tengo anche un identificat

export interface DictionaryEntry {
  keys: string[], // Use these to find 
  lemmas: {
    unconjugatedText: string,
    conjugatedText: string
  }[],
  edictGlosses: string[],
  daijirinGlosses: string[],
}

export interface Definition {
  glosses: string[]
}
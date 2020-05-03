import { DictionaryEntryInDb } from "./types";
import { Collection } from "mongodb";

export async function wordExists(dictionary: Collection<DictionaryEntryInDb>, word: string)
{
  const result = await dictionary.findOne({ allKeys: word })
  return !(result === null)
}

export async function splitSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string)
{
  return ["kek"]
}

/*
# Always tries to make the first word as long as possible. Not resistant
# against gibberish
def splitSentencePrioritizeFirst(self, text):

    if text == "":
        return []
    for i in range(len(text)+1, 0, -1):
        firstWord = text[0:i]
        if self.existsItem(firstWord):
            return [firstWord] + self.splitSentencePrioritizeFirst(text[i:])

    output = [text[0]] + self.splitSentencePrioritizeFirst(text[1:])
    return output

*/
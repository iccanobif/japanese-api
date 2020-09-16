import json
import re

f = open("compiled-accent-dictionary", "r", encoding="utf8")

for line in f:
    j = json.loads(line)
    accents = j["contentLines"][1:-1]
    accents = [a for a in accents if not a.startswith("例文")]
    accents = [a for a in accents if not "][" in a]

    for accent in accents:
        if not re.match("^.*\[\d*\]$", accent):
            print(accent)

        number = int(re.search("\[\d*\]", accent)[0][1:-1])
        rawText = re.search(".*\[", accent)[0][:-1]
        cleanText = rawText.replace("↓", "")
        if number == 0:
          reconstructedText = cleanText
        else:
          reconstructedText = cleanText[:number] + "↓" + cleanText[number:]
        if rawText != reconstructedText:
          print(rawText, reconstructedText)
          for c in rawText:
            print(c)

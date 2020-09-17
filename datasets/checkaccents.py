import json
import re

f = open("compiled-accent-dictionary", "r", encoding="utf8")

for line in f:
    line = line.replace("カ゚", "ガ")
    line = line.replace("キ゚", "ギ")
    line = line.replace("ク゚", "グ")
    line = line.replace("ケ゚", "ゲ")
    line = line.replace("コ゚", "ゴ")

    j = json.loads(line)
    accents = j["contentLines"][1:-1]
    accents = [a for a in accents if not a.startswith("例文")]
    accents = [a for a in accents if not "][" in a]


    for accent in accents:
        if not re.match("^.*\[\d*\]$", accent):
            print(accent)

        if not "]" in accent:
          continue # it's a weird line like &emsp;（オ）

        number = int(re.search("\[\d*\]", accent)[0][1:-1])
        rawText = re.search(".*\[", accent)[0][:-1]
        cleanText = rawText.replace("↓", "")
        if number == 0:
          reconstructedText = cleanText
        else:
          reconstructedText = cleanText[:number] + "↓" + cleanText[number:]
        if rawText != reconstructedText:
          print(rawText, reconstructedText)
          # for c in rawText:
          #   print(c)

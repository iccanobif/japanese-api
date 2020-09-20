import json
import re

f = open("compiled-accent-dictionary", "r", encoding="utf8")
# f = ['{"titles":["とっちゃん"],"contentLines":["【父ちゃん・とっちゃん】","トッチ↓ャン [3]","ト↓ッチャン [1]","出典：和独辞典"]}']

# Isn't this wrong? if the number is [3] shouldn't it be rendered as チョンキ↓ナ?
# {"titles":["ちょんきな"],"contentLines":["【ちょんきな】","チョン↓キナ [3]","出典：大辞林 第二版"]}

# Conclusion of this analysis: the position of the ↓ symbol in this dataset isn't at all trustworthy, and
# for some words even the number is nonsensical (ex. accent on 9th mora on シュウトメ???).
# The logic put in place to generate reconstructedText seem to be correct, so it's better to:
# 1. trust the number(s) available in the daijirin files and generate a string with arrow from that
# 2. if no number is available on daijirin, trust the number in the accent dictionaroy and generate a string with arrow from that

anomalyCount = 0
totalCount = 0

for line in f:
    line = line.replace("カ゚", "ガ")
    line = line.replace("キ゚", "ギ")
    line = line.replace("ク゚", "グ")
    line = line.replace("ケ゚", "ゲ")
    line = line.replace("コ゚", "ゴ")
    line = line.replace("↓ョ", "ョ↓").replace("↓ャ", "ャ↓").replace("↓ュ", "ュ↓")

    j = json.loads(line)
    source = j["contentLines"][-1]
    accents = j["contentLines"][1:-1]
    accents = [a for a in accents if not a.startswith("例文")]
    accents = [a for a in accents if not "][" in a]

    for accent in accents:
        if not re.match("^.*\[\d*\]$", accent):
            print(accent)

        if not "]" in accent:
            continue  # it's a weird line like &emsp;（オ）

        totalCount += 1

        rawNumber = int(re.search("\[\d*\]", accent)[0][1:-1])
        rawText = re.search(".*\[", accent)[0][:-1]
        cleanText = rawText.replace("↓", "")
        if rawNumber == 0:
            reconstructedText = cleanText
        else:
            adjustedNumber = 0
            for i in range(0, rawNumber):
                adjustedNumber += 1
                if adjustedNumber < len(cleanText) and cleanText[adjustedNumber] in ["ョ","ャ","ュ"]:
                    adjustedNumber += 1

            reconstructedText = (
                cleanText[:adjustedNumber] + "↓" + cleanText[adjustedNumber:]
            )
        if rawText != reconstructedText:
            print(rawNumber, adjustedNumber, rawText, reconstructedText, source)
            anomalyCount += 1
            # for c in rawText:
            #   print(c)

print(anomalyCount, "out of", totalCount)
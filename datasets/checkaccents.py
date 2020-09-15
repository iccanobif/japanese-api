import json
import re

f = open("compiled-accent-dictionary", "r", encoding="utf8")

for line in f:
  j = json.loads(line)
  accents = j["contentLines"][1:-1]
  accents = [a for a in accents if not a.startswith("例文")]
  accents = [a for a in accents if not "][" in a]
  if len(accents) == 0:
    continue

  print(accents)
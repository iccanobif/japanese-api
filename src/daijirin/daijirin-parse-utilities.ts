export function extractPitchAccentPositionFromLemma(lemma: string): number[] | null
{
  const matches = lemma.match(/\[\d*\]/g)

  if (!matches) return null

  return matches.map(m => m.replace(/[\[\]]/g, ""))
    .map(m => Number.parseInt(m))
}
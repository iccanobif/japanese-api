export function log(msg: string) {
    let d = new Date()
    console.log("[" + d.toISOString() + "] " + msg)
}

export function printError(e: Error) {
    log(e.message + " " + e.stack)
}

export function addToDictionaryOfLists(dictionary: any, key: any, value: any) {
    if (key in dictionary)
        dictionary[key].push(value)
    else
        dictionary[key] = [value]
}

export function addToDictionaryOfSets(dictionary: any, key: any, value: any) {
    if (key in dictionary)
        dictionary[key].add(value)
    else
        dictionary[key] = new Set([value])
}

// Array.prototype.shuffle = function ()
// {
//     let output = this.slice(0)
//     for (let i = output.length - 1; i > 0; i--)
//     {
//         const j = Math.floor(Math.random() * (i + 1));
//         [output[i], output[j]] = [output[j], output[i]]; // eslint-disable-line no-param-reassign
//     }
//     return output;
// }



// Array.prototype.uniq = function ()
// {
//     return this
//         .sort()
//         .reduce((acc, val) =>
//         {
//             if (acc[acc.length - 1] != val)
//                 acc.push(val)
//             return acc
//         }, [])
// }

export function katakanaToHiragana(str: string) {
    // In unicode, katakana is from 12449 to 12533, hiragana from 12353, 12435

    return str
        .split("")
        .map((c) => {
            const codePoint = c.codePointAt(0)
            if (codePoint && codePoint >= 12449 && codePoint <= 12534)
                return String.fromCodePoint(codePoint - 96)
            else
                return c
        })
        .join("")
}

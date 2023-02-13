import { expect } from "chai"
import { injectJavascript } from "../src/integrated-dictionary/integrated-dictionary"
import { readFileSync } from "fs"
import { environment } from "../src/environment"

const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })
  .replace("DICTIONARY_IFRAME_URL", environment.dictionaryIframeUrl)
const htmlToInject = readFileSync("src/integrated-dictionary/html-to-inject.html", { encoding: "utf8" })
  .replace("DICTIONARY_IFRAME_URL", environment.dictionaryIframeUrl)

describe("integrated dictionary", function ()
{
  it("can inject the script", async () =>
  {
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head></head><body></body></html>"), "text/html; charset=utf-8", "")
    expect(htmlWithInjection).to.contain("<script>" + javascriptToInject + "</script>")
  })
  it("can inject the html", async () =>
  {
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head></head><body></body></html>"), "text/html; charset=utf-8", "")
    expect(htmlWithInjection.replace(/\s/g, "")).to.contain(htmlToInject.replace(/\s/g, ""))
  })
  it("converts the encoding to utf-8", async () =>
  {
    // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head profile=\"http://gmpg.org/xfn/11\"><META http-equiv=\"Content-Type\" content=\"text/html; charset=Shift_JIS\"></head><body></body></html>"), "text/html; charset=utf-8", "")
    expect(htmlWithInjection).to.contain("<html><head profile=\"http://gmpg.org/xfn/11\"><script>" + javascriptToInject + "</script></head>")
  })
  it("converts the encoding to utf-8", () =>
  {
    // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode(`<html>
      <head profile="http://gmpg.org/xfn/11">
      <META http-equiv="Content-Type" content="text/html; charset=Shift_JIS">
      </head>
      <body></body>
    </html>`), "text/html; charset=utf-8", "")

    expect(htmlWithInjection.replace(/\s/g, "")).to.contain((`<html>
    <head profile="http://gmpg.org/xfn/11">
      <script>` + javascriptToInject + `</script>
    </head>`).replace(/\s/g, ""))
  })
  it("handles plain text as well", () =>
  {
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("test"), "text/plain; charset=utf-8", "")
    expect(htmlWithInjection).to.contain(javascriptToInject)
  })
})
import { expect } from "chai"
import { injectJavascript } from "../src/integrated-dictionary/integrated-dictionary"
import { readFileSync } from "fs"

const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })

describe("integrated dictionary", function ()
{
  it("can inject the script 1", async () =>
  {
    const htmlWithInjection = injectJavascript("<html><head></head><body></body></html>", "")
    expect(htmlWithInjection).to.contain("<head><script>" + javascriptToInject + "</script>")
  })
  it("can inject the script 2", async () =>
  {
    const htmlWithInjection = injectJavascript("<html><head profile=\"http://gmpg.org/xfn/11\"></head><body></body></html>", "")
    expect(htmlWithInjection).to.contain("<head profile=\"http://gmpg.org/xfn/11\"><script>" + javascriptToInject + "</script>")
  })
  it("converts the encoding to utf-8 1", async () =>
  {
    // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
    const htmlWithInjection = injectJavascript("<html><head profile=\"http://gmpg.org/xfn/11\"><META http-equiv=\"Content-Type\" content=\"text/html; charset=Shift_JIS\"></head><body></body></html>", "")
    expect(htmlWithInjection).to.contain("<html><head profile=\"http://gmpg.org/xfn/11\"><script>" + javascriptToInject + "</script></head><body></body></html>")
  })
  it("converts the encoding to utf-8 2", async () =>
  {
    const htmlWithInjection = injectJavascript("<html><head profile=\"http://gmpg.org/xfn/11\"><meta charset=\"Shift_JIS\"/></head><body><meta charset=\"Shift_JIS\"/></body></html>", "")
    expect(htmlWithInjection).to.contain("<html><head profile=\"http://gmpg.org/xfn/11\"><script>" + javascriptToInject + "</script></head><body><meta charset=\"Shift_JIS\"/></body></html>")
  })
})
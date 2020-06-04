import { expect } from "chai"
import { injectJavascript } from "../src/integrated-dictionary/integrated-dictionary"
import { readFileSync } from "fs"

const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })
const htmlToInject = readFileSync("src/integrated-dictionary/html-to-inject.html", { encoding: "utf8" })

describe("integrated dictionary", function ()
{
  it("can inject the script", async () =>
  {
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head></head><body></body></html>"), "")
    expect(htmlWithInjection).to.contain("<script>" + javascriptToInject + "</script>")
  })
  it("can inject the html", async () =>
  {
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head></head><body></body></html>"), "")
    expect(htmlWithInjection.replace(/\s/g, "")).to.contain(htmlToInject.replace(/\s/g, ""))
  })
  it("converts the encoding to utf-8", async () =>
  {
    // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode("<html><head profile=\"http://gmpg.org/xfn/11\"><META http-equiv=\"Content-Type\" content=\"text/html; charset=Shift_JIS\"></head><body></body></html>"), "")
    expect(htmlWithInjection).to.contain("<html><head profile=\"http://gmpg.org/xfn/11\"><script>" + javascriptToInject + "</script></head>")
  })
  it("converts the encoding to utf-8", async () =>
  {
    // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
    const htmlWithInjection = injectJavascript((new TextEncoder()).encode(`<html>
      <head profile="http://gmpg.org/xfn/11">
      <META http-equiv="Content-Type" content="text/html; charset=Shift_JIS">
      </head>
      <body></body>
    </html>`), "")

    expect(htmlWithInjection.replace(/\s/g, "")).to.contain((`<html>
    <head profile="http://gmpg.org/xfn/11">
      <script>` + javascriptToInject + `</script>
    </head>`).replace(/\s/g, ""))
  })

  // it("prepends domain to urls starting with /", async () =>
  // {
  //   // I just remove all <meta> tags from <head> and let the http headers do the talking, when it comes to character encoding
  //   const htmlWithInjection = injectJavascript((new TextEncoder()).encode(
  //     `<html>
  //      <head profile="http://gmpg.org/xfn/11">
  //        <META http-equiv="Content-Type" content="text/html; charset=Shift_JIS">
  //        <link rel="stylesheet" href="/w/load.php"/>
  //        </head>
  //        <body></body>
  //      </html>`), "https://testdomain.com");

  //   expect(htmlWithInjection.replace(/\s/g, "")).to.equal(
  //     (`<html>
  //       <head profile="http://gmpg.org/xfn/11">
  //         <link rel="stylesheet" href="/integrated-dictionary/https://testdomain.com/w/load.php"/>
  //         <script>` + javascriptToInject + `</script>
  //       </head>
  //       <body></body>
  //     </html>`).replace(/\s/g, "")
  //   )
  // })


  // < link rel = "stylesheet" href = "/w/load.php?lang=ja&amp;modules=ext.cite.styles%7Cext.dismissableSiteNotice.styles%7Cext.uls.interlanguage%7Cext.visualEditor.desktopArticleTarget.noscript%7Cext.wikimediaBadges%7Cmediawiki.toc.styles%7Cskins.vector.styles.legacy%7Cwikibase.client.init&amp;only=styles&amp;skin=vector" />
})
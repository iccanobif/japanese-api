import express from "express"
import axios from "axios"
import url from "url"
import { readdirSync, readFileSync } from "fs"
import { JSDOM } from "jsdom"
import chardet from "chardet"
import { environment } from "../environment"
import path from "path"


export async function handleEbookDictionary(bookId: string, res: express.Response)
{
  try
  {
    const ebookBuffer = readFileSync(path.join(environment.bookDirectory, bookId))
    const encoding = chardet.detect(ebookBuffer)

    if (!encoding)
    {
      res.send("can't detect encoding");
      return;
    }

    const decoder = new TextDecoder(encoding)
    const ebookText = decoder.decode(ebookBuffer)

    const ebookTextSplitByParagraphs = "<span>" + ebookText.replace(/\n/g, "</span><span>") + "</span>"

    const html = readFileSync("src/integrated-dictionary/ebook-dictionary.html", { encoding: "utf8" })
      .replace("%EBOOK-TEXT%", ebookTextSplitByParagraphs)
      .replace(/DICTIONARY_IFRAME_URL/g, environment.dictionaryIframeUrl)

    res.type("text/html; charset=UTF-8")
    res.send(html)
  }
  catch (error)
  {
    res.send(error)
  }
}

interface Book
{
  id: string,
  name: string
}

export async function handleBooksPage(req: express.Request, res: express.Response)
{
  try
  {
    const dir = readdirSync(environment.bookDirectory)
    console.log(dir)
    // const books: Book[] = [{ id: "a77c7cce-47c2-4f55-8816-28d55018d8bc", name: "haruhi" }]
    const books: Book[] = dir.map(d => ({ id: d, name: d }))

    res.render("books", { books })
  } catch (error)
  {
    res.send(error)
  }
}

export async function handleIntegratedDictionary(req: express.Request, res: express.Response)
{
  try
  {
    const targetUrlRaw = req.path.replace(/^\/integrated-dictionary\//, "")
    const targetUrl = url.parse(targetUrlRaw)
    const targetOrigin = targetUrl.protocol + "//" + targetUrl.host
    const response = await axios.get(targetUrl.href, {
      params: req.query,
      responseType: 'arraybuffer'
    })

    // to replace in all href and src:
    // - urls starting with / (replace the trailing / with /integrated-dictionary/{targetOrigin})
    // - urls starting with the target domain (replace it with /integrated-dictionary/{targetOrigin})

    const contentType: string = response.headers["content-type"]
    let output = ""
    if (contentType.startsWith("text/html") || contentType.startsWith("text/plain"))
    {
      output = injectJavascript(response.data, contentType, targetOrigin)

      res.type("text/html; charset=UTF-8")
    }
    else
    {
      output = response.data
      res.type(contentType)
    }

    res.send(output)
  } catch (error)
  {
    res.send(error)
  }
}

export function injectJavascript(pageContent: ArrayBuffer, contentType: string, targetOrigin: string): string
{
  const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })
    .replace("DICTIONARY_IFRAME_URL", environment.dictionaryIframeUrl)
  const htmlToInject = readFileSync("src/integrated-dictionary/html-to-inject.html", { encoding: "utf8" })
    .replace("DICTIONARY_IFRAME_URL", environment.dictionaryIframeUrl)

  const dom = new JSDOM(pageContent, { contentType: "text/html" })
  const document = dom.window.document

  // Remove all <base> tags to make all urls relative
  // Remove <meta> tags that specify a charset (the output will always be UTF-8)
  for (const node of document.head.children)
    if (node.nodeName.toUpperCase() == "BASE"
      || (node.nodeName.toUpperCase() == "META" && node.attributes.hasOwnProperty("charset"))
      || (node.nodeName.toUpperCase() == "META" && node.attributes.getNamedItem("content")?.textContent?.match(/charset/)))
      document.head.removeChild(node)

  // If the page was originally a text/plain, add some styling
  if (contentType.toLowerCase().startsWith("text/plain"))
  {
    document.body.style.whiteSpace = "pre-wrap"
    document.body.style.backgroundColor = "black"
    document.body.style.color = "white"
    document.body.style.overflowWrap = "break-word"
    document.body.style.fontSize = "larger"

    const metaViewportNode = document.createElement("meta")
    metaViewportNode.setAttribute("name", "viewport")
    metaViewportNode.setAttribute("content", "width=device-width, initial-scale=1")
    document.head.appendChild(metaViewportNode)
  }


  // Inject custom javascript
  const scriptNode = document.createElement("script")
  scriptNode.appendChild(document.createTextNode(javascriptToInject))
  document.head.appendChild(scriptNode)

  // Inject custom html
  const customHtmlNode = new JSDOM(htmlToInject)
  document.body.appendChild(customHtmlNode.window.document.body.firstChild as ChildNode);

  [...document.getElementsByTagName("*")].forEach(el =>
  {
    ["href", "src"].forEach(attributeName =>
    {
      if (el.hasAttribute(attributeName))
      {
        const originalHref = el.getAttribute(attributeName)
        if (originalHref && originalHref.startsWith("/") && !originalHref.startsWith("//"))
          el.setAttribute(attributeName, targetOrigin + originalHref)
      }
    })
  })


  return dom.serialize()
}
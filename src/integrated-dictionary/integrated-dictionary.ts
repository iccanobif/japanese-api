import express from "express"
import axios from "axios"
import url from "url"
import { readFileSync } from "fs"
import { JSDOM } from "jsdom"

export default async function handleIntegratedDictionary(req: express.Request, res: express.Response) 
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
    console.log(targetUrlRaw, contentType)
    let output = ""
    if (contentType.startsWith("text/html"))
    {
      output = injectJavascript(response.data, targetOrigin)
    }
    else
    {
      output = response.data
    }

    res.type(contentType)
    res.send(output)
  } catch (error)
  {
    res.send(error)
  }
}

export function injectJavascript(pageContent: ArrayBuffer, targetOrigin: string): string
{
  const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })
  const htmlToInject = readFileSync("src/integrated-dictionary/html-to-inject.html", { encoding: "utf8" })

  const dom = new JSDOM(pageContent)
  const document = dom.window.document

  // Remove all <meta> tags (this is mostly so we can ignore the original encoding and use UTF8 for everything)
  for (const node of document.head.childNodes)
    if (node.nodeName.toUpperCase() == "META" || node.nodeName.toUpperCase() == "BASE")
      document.head.removeChild(node)

  // Inject custom javascript
  const scriptNode = document.createElement("script")
  scriptNode.appendChild(document.createTextNode(javascriptToInject))
  document.head.appendChild(scriptNode)

  // Inject custom html
  const customHtmlNode = new JSDOM(htmlToInject)
  document.body.appendChild(customHtmlNode.window.document.body);




  // Todo: replace all absolute urls
  // const it = document.createNodeIterator(document)
  // let nodeIteration
  // while (nodeIteration = it.nextNode())
  // {
  //   console.log(nodeIteration)
  //   console.log(nodeIteration.parentElement)

  // }

  [...document.getElementsByTagName("*")].forEach(el =>
  {
    if (el.hasAttribute("href"))
    {
      // document.head.getElementsByTagName("link")[0].attributes.href.value = "ciao"
      const originalHref = el.getAttribute("href")
      console.log(originalHref)
      if (originalHref && originalHref.startsWith("/"))
        el.setAttribute("href", targetOrigin + originalHref)
    }
  }
  )


  return dom.serialize()
}
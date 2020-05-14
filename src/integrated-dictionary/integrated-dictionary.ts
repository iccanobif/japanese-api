import express from "express"
import axios from "axios"
import url from "url"
import { readFileSync } from "fs"

export default async function handleIntegratedDictionary(req: express.Request, res: express.Response) 
{
  try
  {
    const targetUrlRaw = req.path.replace(/^\/integrated-dictionary\//, "")
    console.log(req.path)
    console.log(req.query)
    const targetUrl = url.parse(targetUrlRaw)
    const targetOrigin = targetUrl.protocol + "//" + targetUrl.host
    const response = await axios.get(targetUrl.href, {
      params: req.query
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

export function injectJavascript(pageContent: string, targetOrigin: string): string
{
  let output = ""
  output = pageContent.replace(/(href|src)\s*=\s*(["'])\//ig, "$1=$2/integrated-dictionary/" + targetOrigin + "/");

  // TODO: move readFileSync() outside of this function, on top of this file
  const javascriptToInject = readFileSync("src/integrated-dictionary/javascript-to-inject.js", { encoding: "utf8" })

  // PROVA AD USARE https://developer.mozilla.org/ja/docs/Web/API/DOMParser

  // remove all <meta> tags inside <head>
  output = output.replace(/(<head(| .*?)>.*)<meta .*?>(.*<\/head>)/ig, "$1$2")

  output = output.replace(/<head(| .*?)>/i, "<head$1><script>" + javascriptToInject + "</script>")
  
  return output
}
document.addEventListener("selectionchange", async (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) return;

  const text = selection.anchorNode.textContent
  const offset = selection.anchorOffset

  console.log("querying for text " + text + " at offset " + offset)

  const response = await fetch("/word/" + encodeURIComponent(text) + "/" + offset)
  const json = await response.json()
  alert(JSON.stringify(json, null, 2))

});

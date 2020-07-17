document.addEventListener("selectionchange", async (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) return;

  let text = selection.anchorNode.textContent;
  let offset = selection.anchorOffset;

  if (offset > 50) {
    text = text.substring(offset - 25, offset + 25);
    offset = 25;
  } else {
    text = text.substring(0, 100);
  }

  const popup = document.getElementById("integrated-japanese-dictionary-popup")
  popup.contentWindow.postMessage({ text, offset }, "https://japanese-ebook-reader.herokuapp.com")
});

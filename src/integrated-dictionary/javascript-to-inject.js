document.addEventListener("selectionchange", async (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) return;

  const text = selection.anchorNode.textContent;
  const offset = selection.anchorOffset;

  console.log("querying for text " + text + " at offset " + offset);

  const response = await fetch(
    "/word/" + encodeURIComponent(text) + "/" + offset
  );
  const json = await response.json();

  const listify = (list) => "<ul><li>" + list.join("</li><li>") + "</li></ul>";

  const stringifiedResults = listify(
    json.map(
      (word) =>
        word.word +
        listify(
          word.dictionaryEntries.map((entry) =>
            listify(entry.japaneseGlosses.concat(entry.englishGlosses))
          )
        )
    )
  );

  japaneseDictionaryDisplayPopup(stringifiedResults);
});

function japaneseDictionaryHidePopup() {
  document.getElementById(
    "integrated-japanese-dictionary-popup"
  ).style.display = "none";
}

function japaneseDictionaryDisplayPopup(htmlToDisplay) {
  document.getElementById(
    "integrated-japanese-dictionary-popup"
  ).style.display = "block";

  document.getElementById(
    "integrated-japanese-dictionary-popup-text"
  ).innerHTML = htmlToDisplay;
}

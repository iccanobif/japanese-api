const japaneseDictionaryResultHistory = [];
let japaneseDictionaryResultHistoryIndex = null;

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

function japaneseDictionaryBack() {
  if (japaneseDictionaryResultHistoryIndex == 0) {
    alert("これ以上戻りは出来ません。");
    return;
  }
  japaneseDictionaryResultHistoryIndex--;

  japaneseDictionaryDisplayPopup(
    japaneseDictionaryResultHistory[japaneseDictionaryResultHistoryIndex]
  );
}

document.addEventListener("selectionchange", async (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) return;

  const text = selection.anchorNode.textContent;
  const offset = selection.anchorOffset;

  const response = await fetch(
    "/word/" + encodeURIComponent(text) + "/" + offset
  );
  const json = await response.json();

  const listify = (list) => "<ul><li>" + list.join("</li><li>") + "</li></ul>";

  const stringifiedResults = listify(
    json.map((word) =>
      word.dictionaryEntries.map(
        (entry) =>
          entry.lemmas.join(" ") 
          + "<br />" 
          + (entry.accents && entry.accents.join(" ") || "")
          + listify(entry.japaneseGlosses.concat(entry.englishGlosses))
      )
    )
  );

  japaneseDictionaryResultHistory.push(stringifiedResults);
  japaneseDictionaryResultHistoryIndex =
    japaneseDictionaryResultHistory.length - 1;

  japaneseDictionaryDisplayPopup(stringifiedResults);
});

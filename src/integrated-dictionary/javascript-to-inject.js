const japaneseDictionaryResultHistory = [];

function japaneseDictionaryHidePopup() {
  document.getElementById(
    "integrated-japanese-dictionary-popup"
  ).style.display = "none";
}

function japaneseDictionaryDisplayPopup() {
  const popup = document.getElementById("integrated-japanese-dictionary-popup");

  popup.style.display = "block";

  document.getElementById(
    "integrated-japanese-dictionary-popup-yomikomichuu"
  ).style.display = "inline";
}

function japaneseDictionarySetPopupContents(htmlToDisplay) {
  document.getElementById(
    "integrated-japanese-dictionary-popup-text"
  ).innerHTML = htmlToDisplay;

  document.getElementById(
    "integrated-japanese-dictionary-popup-yomikomichuu"
  ).style.display = "none";
}

function japaneseDictionaryBack() {
  if (japaneseDictionaryResultHistory.length <= 1) {
    alert("これ以上戻りは出来ません。");
    return;
  }

  japaneseDictionaryResultHistory.pop();
  japaneseDictionarySetPopupContents(
    japaneseDictionaryResultHistory[japaneseDictionaryResultHistory.length - 1]
  );
}

document.addEventListener("selectionchange", async (event) => {
  japaneseDictionaryDisplayPopup();
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

  const response = await fetch(
    "/word/" + encodeURIComponent(text) + "/" + offset
  );
  const json = await response.json();

  const listify = (list) => "<ul><li>" + list.join("</li><li>") + "</li></ul>";

  const stringifiedResults = listify(
    json.map((word) =>
      word.dictionaryEntries.map(
        (entry) =>
          entry.lemmas.join(" ") +
          "<br />" +
          ((entry.accents && entry.accents.join(" ")) || "") +
          listify(entry.japaneseGlosses.concat(entry.englishGlosses))
      )
    )
  );

  japaneseDictionaryResultHistory.push(stringifiedResults);

  console.log(japaneseDictionaryResultHistory);

  japaneseDictionarySetPopupContents(stringifiedResults);
});

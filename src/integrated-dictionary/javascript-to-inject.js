document.addEventListener("selectionchange", (event) => {
  const selection = window.getSelection();
  if (!selection.isCollapsed) return;
  alert(
    JSON.stringify({
      text: selection.anchorNode.textContent,
      offset: selection.anchorOffset,
    })
  );
});

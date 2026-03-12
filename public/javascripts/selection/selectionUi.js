document.addEventListener("DOMContentLoaded", () => {
  SelectionStore.subscribe((ids) => {
    const set = new Set(ids);

    // Update item styles
    document.querySelectorAll(".file-container-item").forEach((item) => {
      const id = item.dataset.fileId;
      const selected = set.has(id);
      item.classList.toggle("selected", selected);
    });

    // Update body class for global state
    document.body.classList.toggle("has-selection", ids.length > 0);

    // Update option bar visibility and count
    const optionBar = document.querySelector(".option-bar");
    const selectionCount = document.querySelector(".selection-count");

    if (optionBar) {
      console.log("Updating option bar:", ids.length);
      if (ids.length === 0) {
        optionBar.classList.add("none");
      } else {
        optionBar.classList.remove("none");
        if (selectionCount) {
          selectionCount.textContent = ids.length;
        }
      }
    } else {
      console.warn("Option bar not found in DOM");
    }
  });
});

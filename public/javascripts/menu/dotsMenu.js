document.addEventListener("click", (e) => {
  const handler = window.menuActionHandler;
  if (!handler) return;

  const { setCurrentFile, detectCurrentView, menuState } = handler;
  const { showMenu } = window.menuPopper;

  // 1. Check for trigger
  const trigger = e.target.closest(".dropdown-trigger");
  if (!trigger) return;

  // 2. Determine if it's Option Bar or File Item
  const isOptionBar = trigger.closest(".option-bar");

  let fileItem = null;
  let file = null;

  if (isOptionBar) {
    // A. Option Bar Logic
    e.preventDefault();
    const selectionStore = window.SelectionStore;
    if (!selectionStore) return;

    const ids = selectionStore.getAll();
    if (ids.length === 0) return;

    // Use the first selected file for menu context (metadata)
    // IMPORTANT: Do NOT reset selection here, so multi-select policies work.
    const firstId = ids[0];
    fileItem = document.querySelector(
      `.file-container-item[data-file-id="${firstId}"], .sugg-file-list-item[data-file-id="${firstId}"]`,
    );

    file = {
      fileId: firstId,
      fileName: fileItem
        ? (
            fileItem.querySelector(".file-item-container-title") ||
            fileItem.querySelector(".sugg-file-item-title")
          )?.textContent.trim()
        : "Selected Items",
      isFolder: fileItem ? fileItem.dataset.type == "folder" : false,
      isStarred: fileItem ? fileItem.dataset.starred === "true" : false,
      element: fileItem,
    };
  } else {
    // B. File Item Logic
    fileItem = trigger.closest(".file-container-item, .sugg-file-list-item");
    if (!fileItem) return;

    e.preventDefault();

    file = {
      fileId: fileItem.dataset.fileId,
      fileName: (
        fileItem.querySelector(".file-item-container-title") ||
        fileItem.querySelector(".sugg-file-item-title")
      )?.textContent.trim(),
      isFolder: fileItem.dataset.type == "folder",
      isStarred: fileItem.dataset.starred === "true",
      element: fileItem,
    };

    // Update Selection for specific file clicks
    const selectionStore = window.SelectionStore;
    if (selectionStore) {
      // Force selection of this specific file
      selectionStore.replace([file.fileId]);
    }
  }

  // 3. Common Execution
  if (!file || !file.fileId) return;

  setCurrentFile(file);
  menuState.lastTrigger = isOptionBar ? "option-bar" : "dots";

  const currentView = detectCurrentView();
  showMenu(e, currentView, file);
});

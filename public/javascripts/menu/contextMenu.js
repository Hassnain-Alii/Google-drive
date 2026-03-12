document.addEventListener("contextmenu", (e) => {
  const handler = window.menuActionHandler;
  const popper = window.menuPopper;

  if (!handler || !popper) {
    console.error("Menu UI handlers not initialized");
    return;
  }

  const { setCurrentFile, detectCurrentView, menuState } = handler;
  const { showMenu } = popper;

  const fileItem = e.target.closest(
    ".file-container-item, .sugg-file-list-item",
  );
  if (!fileItem) return;

  e.preventDefault();

  const currentView = detectCurrentView();

  const file = {
    fileId: fileItem.dataset.fileId,
    fileName: (
      fileItem.querySelector(".file-item-container-title") ||
      fileItem.querySelector(".sugg-file-item-title")
    )?.textContent.trim(),
    isFolder: fileItem.dataset.type == "folder",
    isStarred: fileItem.dataset.starred === "true",
    element: fileItem,
  };

  if (!file.fileId) return;
  const selectionStore = window.SelectionStore;
  if (selectionStore) {
    const selectedIds = selectionStore.getAll();
    if (!selectedIds.includes(file.fileId)) {
      selectionStore.replace([file.fileId]);
    }
  }

  setCurrentFile(file);
  menuState.lastTrigger = "contextmenu";
  showMenu(e, currentView, file);
});

document.addEventListener("click", (e) => {
  const handler = window.menuActionHandler;
  if (!handler || !handler.menuState.currentFile) return;

  const actionItem = e.target.closest(".more-action-dropdown-item");
  if (!actionItem) return;

  const action = actionItem.dataset.action;
  const menuActions = window.menuActions;

  try {
    if (menuActions && menuActions[action]) {
      menuActions[action](handler.menuState.currentFile);
    }
  } catch (err) {
    console.error(`Action ${action} failed:`, err);
  } finally {
    document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
      m.classList.remove("open");
      m.setAttribute("aria-hidden", "true");
    });
    handler.clearCurrentFile();
  }
});

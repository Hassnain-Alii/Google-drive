document.addEventListener("DOMContentLoaded", () => {
  const optionBar = document.querySelector(".option-bar");
  const closeBtn = document.querySelector(".option-bar-close-btn");
  const diveFilterBar = document.querySelector(".drive-filter-bar");

  if (!optionBar) return;

  // Handle actions within the option bar
  optionBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".option-bar-btn");
    if (!btn || btn === closeBtn) return;

    if (typeof SelectionStore === "undefined") return;

    const selectedIds = SelectionStore.getAll();
    if (selectedIds.length === 0) return;

    // For simplicity, handle multi-selection actions here or map them to DriveMenu.actions
    // Many actions currently expect a single file object.
    // We might need to handle multi-file actions later.
    const firstFileId = selectedIds[0];
    const element = document.querySelector(`[data-file-id="${firstFileId}"]`);

    const file = {
      fileId: firstFileId,
      element: element,
      fileName:
        element
          ?.querySelector(".file-item-container-title")
          ?.textContent.trim() || "Selected files",
    };

    if (btn.classList.contains("option-bar-share-btn")) {
      window.menuActions.share(file);
    } else if (btn.classList.contains("option-bar-download-btn")) {
      window.menuActions.download(file);
    } else if (btn.classList.contains("option-bar-bin-btn")) {
      window.menuActions.trash(file);
    } else if (btn.classList.contains("option-bar-copy-btn")) {
      window.menuActions.copy(file);
    }
  });

  document.addEventListener("click", (e) => {
    // 1. If clicking inside the option bar or a dropdown, do nothing
    if (e.target.closest(".option-bar") || e.target.closest(".dropdown-menu")) {
      return;
    }

    // 2. Check if we have an active selection
    if (
      typeof SelectionStore !== "undefined" &&
      SelectionStore.getAll().length > 0
    ) {
      diveFilterBar?.classList.add("none");
      optionBar.classList.remove("none");
      return;
    }

    // 3. Otherwise, if clicking outside and no selection, hide the bar
    optionBar?.classList.add("none");
    diveFilterBar?.classList.remove("none");
  });

  closeBtn?.addEventListener("click", () => {
    if (typeof SelectionStore !== "undefined") {
      SelectionStore.clear();
    }
    optionBar?.classList.add("none");
    diveFilterBar?.classList.remove("none");
  });
});

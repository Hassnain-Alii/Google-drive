const menuActions = (() => {
  const { detectCurrentView } = window.menuActionHandler;
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  async function open({ isFolder, fileId }) {
    if (isFolder) {
      window.location.href = `/drive/my-drive/folder/${fileId}`;
    } else {
      window.open(`/download/${fileId}`, "_blank");
    }
  }

  async function download(file) {
    const selected = window.SelectionStore?.getAll() || [];
    let downloadUrl = "";
    let downloadName = "";
    let isBulk = false;
    let postBody = null;

    if (selected.length > 0) {
      isBulk = true;
      downloadUrl = "/download/bulk";
      downloadName = "bulk-download.zip";
      postBody = JSON.stringify({ ids: selected });
    } else if (file) {
      if (file.isFolder) {
        downloadUrl = `/download/folder/${file.fileId}`;
        downloadName = `${file.fileName}.zip`;
      } else {
        downloadUrl = `/download/file/${file.fileId}`;
        downloadName = file.fileName;
      }
    } else {
      return;
    }

    const progressId = window.showProgressBar
      ? window.showProgressBar(downloadName, 0)
      : null;

    try {
      const response = await fetch(downloadUrl, {
        method: isBulk ? "POST" : "GET",
        headers: isBulk
          ? {
              "Content-Type": "application/json",
              "csrf-token": csrfToken,
            }
          : {},
        body: postBody,
      });

      if (!response.ok) throw new Error("Download failed");

      const contentLength = response.headers.get("content-length");
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (window.updateProgressBar) {
          const percentage = total ? Math.round((loaded / total) * 100) : 0;
          window.updateProgressBar(
            progressId,
            percentage,
            false,
            total || loaded
          );
        }
      }

      if (window.updateProgressBar) window.updateProgressBar(progressId, 100);
      setTimeout(() => {
        if (window.hideProgressBar) window.hideProgressBar(progressId);
      }, 3000);

      const blob = new Blob(chunks, {
        type: response.headers.get("content-type"),
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      if (window.updateProgressBar)
        window.updateProgressBar(progressId, 0, true);
      alert("Download failed!");
    }
  }

  async function rename(file) {
    if (window.showRenamePopup) {
      window.showRenamePopup(file);
    } else {
      console.error("showRenamePopup not found");
    }
  }

  async function copy(file) {
    const selectedIds = window.SelectionStore.getAll();
    const files =
      selectedIds.length > 0
        ? selectedIds
            .map((id) => ({
              fileId: id,
              element: document.querySelector(`[data-file-id="${id}"]`),
            }))
            .filter((f) => f.element)
        : [file];

    for (const f of files) {
      const res = await fetch(`/drive/copy/${f.fileId}`, {
        method: "POST",
        headers: {
          "csrf-token": csrfToken,
        },
      });
      if (!res.ok) {
        console.error(`Failed to copy file ${f.fileId}`);
      }
    }
    location.reload();
  }

  async function star(file) {
    const { isStarred, element } = file;
    const currentView = detectCurrentView();
    const selectedIds = window.SelectionStore.getAll();
    const files =
      selectedIds.length > 0
        ? selectedIds
            .map((id) => ({
              fileId: id,
              element: document.querySelector(`[data-file-id="${id}"]`),
            }))
            .filter((f) => f.element)
        : [file];

    const shouldStar = files.some((f) => f.element.dataset.starred !== "true");
    for (const el of files) {
      const fileId = el.fileId;
      await fetch(`/drive/starred/${fileId}`, {
        method: "POST",
        headers: {
          "csrf-token": csrfToken,
        },
      });
      el.element.dataset.starred = shouldStar;
      el.element.classList.toggle("starred", shouldStar);

      const actionItem = document.querySelector(
        ".more-action-dropdown-item.file-starred"
      );

      if (actionItem) {
        const actionItemSvg = actionItem.querySelector("svg");
        const actionItemSpan = actionItem.querySelector("span");
        if (shouldStar) {
          // Update the dropdown menu UI if it's open
          actionItemSvg.style.fill = "#FFC107";
          actionItemSpan.textContent = "Remove from Starred";
        } else {
          actionItemSvg.style.fill = "currentColor";
          actionItemSpan.textContent = "Add to Starred";
        }
      }

      const title =
        el.element.querySelector(".file-item-container-title") ||
        el.element.querySelector(".sugg-file-item-title");

      if (shouldStar) {
        if (!title.querySelector(".file-item-star-icon")) {
          title.insertAdjacentHTML(
            "beforeend",
            `<svg class="file-item-star-icon" viewBox="0 0 24 24" fill="#FFC107"
            style="width:16px;height:16px;margin-left:5px">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2
            9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>`
          );
        }
      } else {
        title.querySelector(".file-item-star-icon")?.remove();
        if (currentView === "starred") {
          el.element.remove();
        }
      }
    }

    // 🔁 Force menu refresh (CRITICAL)
    document
      .querySelector(".more-action-dropdown.open")
      ?.dispatchEvent(new Event("menu:update"));
  }

  async function share({ fileId }) {
    const link = `${window.location.origin}/share/${fileId}`;
    prompt("Copy shareable link:", link);
  }

  async function trash(file) {
    const selectedIds = window.SelectionStore.getAll();
    const files =
      selectedIds.length > 0
        ? selectedIds
            .map((id) => {
              const el = document.querySelector(`[data-file-id="${id}"]`);
              return {
                fileId: id,
                element: el,
                fileName:
                  el
                    ?.querySelector(
                      ".file-item-container-title, .sugg-file-item-title"
                    )
                    ?.textContent.trim() || "Selected file",
              };
            })
            .filter((f) => f.element)
        : [file];

    const confirmMsg =
      files.length > 1
        ? `Move ${files.length} items to bin?`
        : `Move "${files[0].fileName}" to bin?`;

    if (confirm(confirmMsg)) {
      for (const f of files) {
        await fetch(`/drive/trash/${f.fileId}`, {
          method: "POST",
          headers: {
            "csrf-token": csrfToken,
          },
        });
        f.element.remove();
      }
      window.SelectionStore.clear();
    }
  }

  async function restore(file) {
    const selectedIds = window.SelectionStore.getAll();
    const files =
      selectedIds.length > 0
        ? selectedIds
            .map((id) => ({
              fileId: id,
              element: document.querySelector(`[data-file-id="${id}"]`),
            }))
            .filter((f) => f.element)
        : [file];

    for (const f of files) {
      await fetch(`/drive/restore/${f.fileId}`, {
        method: "POST",
        headers: {
          "csrf-token": csrfToken,
        },
      });
      f.element.remove();
    }
    window.SelectionStore.clear();
  }

  async function deleteForever(file) {
    const selectedIds = window.SelectionStore.getAll();
    const files =
      selectedIds.length > 0
        ? selectedIds
            .map((id) => {
              const el = document.querySelector(`[data-file-id="${id}"]`);
              return {
                fileId: id,
                element: el,
                fileName:
                  el
                    ?.querySelector(
                      ".file-item-container-title, .sugg-file-item-title"
                    )
                    ?.textContent.trim() || "Selected file",
              };
            })
            .filter((f) => f.element)
        : [file];

    const confirmMsg =
      files.length > 1
        ? `Delete ${files.length} items forever?`
        : `Delete "${files[0].fileName}" forever?`;

    if (confirm(confirmMsg)) {
      for (const f of files) {
        await fetch(`/drive/delete-forever/${f.fileId}`, {
          method: "POST",
          headers: {
            "csrf-token": csrfToken,
          },
        });
        f.element.remove();
      }
      window.SelectionStore.clear();
    }
  }

  async function info({ fileId, fileName, isFolder }) {
    alert(
      `Name: ${fileName}\nID: ${fileId}\nType: ${isFolder ? "Folder" : "File"}`
    );
  }

  return {
    open,
    download,
    rename,
    copy,
    star,
    share,
    trash,
    restore,
    deleteForever,
    info,
  };
})();

window.menuActions = menuActions;

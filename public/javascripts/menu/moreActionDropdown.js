document.addEventListener("DOMContentLoaded", () => {
  let currentFile = null;
  let lastTrigger = null;
  let currentPopperInstance = null;
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  function gerCurrentView() {
    const path = window.location.pathname;
    if (path.includes("/starred")) return "starred";
    if (path.includes("/bin")) return "bin";
    return "default";
  }
  function updateDropdownForView(view, isStarred, isTrashed) {
    const menu = document.querySelector(".more-action-dropdown.open");
    if (!menu) return;
    const starSpan = menu.querySelector(".default-view .file-starred span");
    const starSvg = menu.querySelector(".default-view .file-starred svg");
    menu
      .querySelectorAll(".menu-section")
      .forEach((s) => (s.style.display = "none"));

    if (view === "starred") {
      menu.querySelector(".default-view").style.display = "block";
      if (starSpan) {
        starSpan.textContent = isStarred
          ? "Remove from Starred"
          : "Add to Starred";
        if (starSvg)
          starSvg.style.fill = isStarred ? "#FFC107" : "currentColor";
      }
    } else if (view === "bin") {
      menu.querySelector(".bin-view").style.display = "block";
    } else {
      menu.querySelector(".default-view").style.display = "block";
    }
  }
  // right click
  document.addEventListener("contextmenu", (e) => {
    const fileItem = e.target.closest(".file-container-item");
    if (!fileItem) return;
    e.preventDefault();
    const currentView = gerCurrentView();

    const fileId = fileItem.dataset.fileId;
    const fileName = fileItem
      .querySelector(".file-item-container-title")
      ?.textContent.trim();
    const isFolder = fileItem.dataset.type == "folder";
    const isStarred = fileItem.dataset.starred === "true";

    if (!fileId) return;

    currentFile = { fileId, fileName, isFolder, element: fileItem, isStarred };
    lastTrigger = "cotextmenu";

    const moreBtn = fileItem.querySelector(".dropdown-trigger");
    if (!moreBtn) return;

    // Destroy previous Popper instance if it exists
    if (currentPopperInstance) {
      currentPopperInstance.destroy();
      currentPopperInstance = null;
    }

    const anchor = document.getElementById("context-menu-anchor");
    if (anchor) {
      anchor.style.position = "fixed";
      anchor.style.left = e.clientX + "px";
      anchor.style.top = e.clientY + "px";
      anchor.style.zIndex = "9999";
    }

    moreBtn.click();

    setTimeout(() => {
      const menu = document.querySelector(".more-action-dropdown.open");

      updateDropdownForView(currentView, isStarred);

      if (menu && anchor && typeof Popper !== "undefined") {
        currentPopperInstance = Popper.createPopper(anchor, menu, {
          placement: "bottom-start",
          strategy: "fixed",
          modifiers: [
            {
              name: "offset",
              options: { offset: [0, 8] },
            },
            {
              name: "preventOverflow",
              options: {
                boundary: "viewport",
                padding: 8,
                altAxis: true,
              },
            },
            {
              name: "flip",
              options: {
                fallbackPlacements: [
                  "top-start",
                  "right-start",
                  "left-start",
                  "bottom-end",
                ],
                padding: 8,
              },
            },
          ],
        });

        // Force immediate update
        requestAnimationFrame(() => {
          if (currentPopperInstance) {
            currentPopperInstance.update();
          }
        });
      }
    }, 10);
  });

  // dots click
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".dropdown-trigger");
    if (!trigger) return;

    const fileItem = trigger.closest(
      ".file-container-item, .sugg-file-list-item"
    );
    if (!fileItem) return;

    const fileId = fileItem.dataset.fileId;
    const fileName = fileItem
      .querySelector(".file-item-container-title, .sugg-file-item-title")
      ?.textContent.trim();
    const isFolder = fileItem.dataset.type === "folder";
    const isStarred = fileItem.dataset.starred === "true";

    if (!fileId) return;

    currentFile = { fileId, fileName, isFolder, element: fileItem, isStarred };
    lastTrigger = "dots";
  });

  //action click
  document.addEventListener("click", async (e) => {
    const actionItem = e.target.closest(".more-action-dropdown-item");
    if (!actionItem || !currentFile) return;

    const { fileId, fileName, isFolder, element, isStarred } = currentFile;
    const currentView = gerCurrentView();

    document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
      m.classList.remove("open");
    });
    try {
      if (actionItem.classList.contains("file-open")) {
        if (isFolder) {
          window.location.href = `/drive/my-drive/folder/${fileId}`;
        } else {
          window.open(`/download/${fileId}`, "_blank");
        }
      } else if (actionItem.classList.contains("file-download")) {
        window.location.href = `/download/${fileId}`;
      } else if (actionItem.classList.contains("file-rename")) {
        showRenamePopup(currentFile);
      } else if (actionItem.classList.contains("file-copy")) {
        const res = await fetch(`/drive/copy/${fileId}`, {
          method: "POST",
          headers: {
            "csrf-token": csrfToken,
          },
        });
        if (res.ok) {
          const data = await res.json();
          location.reload();
          alert("File copied successfully!");
        } else {
          throw new Error("Copy failed");
        }
      } else if (actionItem.classList.contains("file-starred")) {
        const isUnStar = actionItem.dataset.action === "unstar";
        await fetch(`/drive/starred/${fileId}`, {
          method: "POST",
          headers: {
            "csrf-token": csrfToken,
          },
        });
        const newStarred = !isStarred;
        element.dataset.starred = newStarred;
        if (newStarred) {
          element.classList.add("starred");
          actionItem.querySelector("svg").style.fill = "#FFC107";
          actionItem.querySelector("span").textContent = "Remove from Starred";
        } else {
          element.classList.remove("starred");
          actionItem.querySelector("svg").style.fill = "currentColor";
          actionItem.querySelector("span").textContent = "Add to Starred";
        }
        if (currentView === "starred") {
          element.remove();
        } else {
          const newStarred = !isStarred;
          element.dataset.starred = newStarred;

          // Get the title element
          const titleElement = element.querySelector(
            ".file-item-container-title"
          );

          if (newStarred) {
            element.classList.add("starred");

            // Add star icon if it doesn't exist
            let starIcon = titleElement.querySelector(".file-item-star-icon");
            if (!starIcon) {
              const starIconHtml = `<svg class="file-item-star-icon" viewBox="0 0 24 24" fill="#FFC107">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>`;
              titleElement.insertAdjacentHTML("beforeend", starIconHtml);
            }
          } else {
            element.classList.remove("starred");

            // Remove star icon if it exists
            const starIcon = titleElement.querySelector(".file-item-star-icon");
            if (starIcon) {
              starIcon.remove();
            }
          }
        }
      } else if (actionItem.classList.contains("file-share")) {
        prompt(
          "Copy shareable link:",
          `${window.location.origin}/share/${fileId}`
        );
      } else if (actionItem.classList.contains("file-trash")) {
        if (confirm(`Move "${fileName}" to bin?`)) {
          await fetch(`/drive/trash/${fileId}`, {
            method: "POST",
            headers: {
              "csrf-token": csrfToken,
            },
          });
          element.remove();
          // showToast("File moved to bin!");
        }
      } else if (actionItem.classList.contains("file-restore")) {
        await fetch(`/drive/restore/${fileId}`, {
          method: "POST",
          headers: {
            "csrf-token": csrfToken,
          },
        });
        element.remove();
        // showToast("File restored!");
      } else if (actionItem.classList.contains("file-delete-forever")) {
        if (confirm(`Delete "${fileName}" forever?`)) {
          await fetch(`/drive/delete-forever/${fileId}`, {
            method: "POST",
            headers: {
              "csrf-token": csrfToken,
            },
          });
          element.remove();
          // showToast("File deleted forever!");
        }
        element.remove();
        // showToast("File restored!");
      } else if (actionItem.classList.contains("file-info")) {
        alert(
          `Name: ${fileName}\nID: ${fileId}\nType: ${
            isFolder ? "Folder" : "File"
          }`
        );
      }
    } catch (err) {
      console.error("Action failed:", err);
      alert("Something went wrong!");
    }
    currentFile = null;
    lastTrigger = null;
  });

  function showRenamePopup(file) {
    const popup = document.querySelector(".rename-popup");
    if (!popup) return alert("Rename popup not found!");

    const input = popup.querySelector(".rename-popup-input");
    const saveBtn = popup.querySelector(".rename-popup-save");
    const cancelBtn = popup.querySelector(".rename-popup-cancel");
    const closeBtn = popup.querySelector(".rename-popup-close-btn");

    // Set the input value
    input.value = file.fileName;

    // Show the popup
    popup.classList.add("open");
    input.focus();
    input.select();

    // Close function
    const closePopup = () => {
      popup.classList.remove("open");
    };

    // Save function
    const handleSave = async () => {
      const newFileName = input.value.trim();
      if (!newFileName || newFileName === file.fileName) {
        closePopup();
        return;
      }

      try {
        const res = await fetch(`/drive/rename/${file.fileId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "csrf-token": csrfToken,
          },
          body: JSON.stringify({
            name: newFileName,
          }),
        });

        if (res.ok) {
          await res.json();
          file.element.querySelector(".file-item-container-title").textContent =
            newFileName;
          closePopup();
        } else {
          throw new Error("Rename failed");
        }
      } catch (err) {
        console.error("Rename failed:", err);
        alert("Something went wrong!");
      }
    };

    // Add event listeners
    saveBtn.addEventListener("click", handleSave);
    cancelBtn.addEventListener("click", closePopup);
    if (closeBtn) closeBtn.addEventListener("click", closePopup);

    // Keyboard shortcuts
    input.addEventListener("keyup", (e) => {
      if (e.key === "Enter") handleSave();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopup();
    });

    // Close on background click
    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
  }
});

// “BHAI AB SEARCH BAR + BREADCRUMBS + DRAG & DROP FOLDER UPLOAD LAGA DO!”
//  2. you see its a singel file of dots menu dropdown and context menu dropdown so
//      ( a): applay changes to moreactiondropdown and give me
//      (b):split the moreactiondropdown(this file just want to make a file where every doropdown logic is written i will remove it after that)  into two independent files one context menu dropdown (where all the  right click or context menu logic is writtern) and second dots menu dropdown ( where all the dots menu logic is written )
//      (c):so at the end give me three files one moreactiondropdown, second context/right click menu dropdown, third dots menu dropdown

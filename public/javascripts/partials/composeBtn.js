document.addEventListener("DOMContentLoaded", async () => {
  const newFolderInput = document.querySelector(".new-folder-item");
  const fileContainerList = document.querySelector(".file-container-list");
  const currentFolderId = document.body.dataset.folderId;
  const currentView = window.location.pathname.includes("/home")
    ? "home"
    : "drive";

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  newFolderInput?.addEventListener("click", async (e) => {
    newFolderPopup();
  });
  function newFolderPopup() {
    const popup = document.querySelector(".new-folder-popup");
    if (!popup) return alert("new-folder popup not found!");

    const input = popup.querySelector(".new-folder-popup-input");
    const saveBtn = popup.querySelector(".new-folder-popup-save");
    const cancelBtn = popup.querySelector(".new-folder-popup-cancel");
    const closeBtn = popup.querySelector(".new-folder-popup-close-btn");

    // Set the input value
    input.value = "Untitled folder";

    // Show the popup
    popup.classList.add("open");
    input.focus();
    input.select();

    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);

    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    const closePopup = () => {
      popup.classList.remove("open");
    };

    // Save function
    const handleSave = async () => {
      const folderName = input.value.trim();
      if (!folderName) {
        closePopup();
        return;
      }
      try {
        const res = await fetch("/drive/create-folder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "csrf-token": csrfToken,
          },
          body: JSON.stringify({
            name: folderName,
            parent: currentFolderId || null,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error:", errorData);
          throw new Error(errorData.error || "Failed to create folder");
        }

        const data = await res.json();

        if (data.folder) {
          // Add folder to the list
          fileContainerList?.prepend(renderFileItem(data.folder, currentView));

          // Show file container and hide empty state
          const container = document.querySelector(".file-container");
          const emptyState = document.querySelector(".empty-container-state");

          if (container) container.classList.remove("none");
          if (emptyState) emptyState.classList.add("none");
        }
        closePopup();
      } catch (err) {
        console.error("new-folder failed:", err);
        alert("Something went wrong! Check console for details.");
      }
    };

    newSaveBtn.addEventListener("click", handleSave);
    newCancelBtn.addEventListener("click", closePopup);
    newCloseBtn.addEventListener("click", closePopup);

    // Keyboard shortcuts
    const handleKeyUp = (e) => {
      if (e.key === "Enter") handleSave();
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closePopup();
    };

    input.addEventListener("keyup", handleKeyUp);
    input.addEventListener("keydown", handleKeyDown);

    // Close on background click
    const handleBackgroundClick = (e) => {
      if (e.target === popup) closePopup();
    };
    popup.addEventListener("click", handleBackgroundClick);
  }
});

function showRenamePopup(file) {
  const popup = document.querySelector(".rename-popup");
  if (!popup) return alert("Rename popup not found!");

  const input = popup.querySelector(".rename-popup-input");
  const saveBtn = popup.querySelector(".rename-popup-save");
  const cancelBtn = popup.querySelector(".rename-popup-cancel");
  const closeBtn = popup.querySelector(".rename-popup-close-btn");
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

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
        if (file.element) {
          const title =
            file.element.querySelector(".file-item-container-title") ||
            file.element.querySelector(".sugg-file-item-title");
          if (title) title.textContent = newFileName;
        }
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

window.showRenamePopup = showRenamePopup;

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

async function uploadFile(file, parentId) {
  const form = new FormData();
  form.append("file", file);
  if (parentId) form.append("parent", parentId);

  const progressId = showProgressBar(file.name, file.size);

  try {
    const res = await fetch("/upload/file", {
      method: "POST",
      body: form,
      credentials: "include",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    const data = await res.json();
    if (res.ok && data.file) {
      updateProgressBar(progressId, 100);
      setTimeout(() => {
        hideProgressBar(progressId);
      }, 500);
      return data.file;
    } else {
      throw new Error(data.message || "File upload failed");
    }
  } catch (err) {
    console.error("File upload failed:", err);
    updateProgressBar(progressId, 0, true);
  }
}

async function uploadFolder(files, parentId) {
  const form = new FormData();
  for (const file of files) {
    form.append("folderFiles", file, file.webkitRelativePath);
  }
  form.append("folderName", files[0].webkitRelativePath.split("/")[0]);
  if (parentId) form.append("parent", parentId);

  const progressId = showProgressBar(
    files[0].webkitRelativePath.split("/")[0],
    Array.from(files).reduce((sum, f) => sum + f.size, 0),
  );
  try {
    const res = await fetch("/upload/folder", {
      method: "POST",
      body: form,
      credentials: "include",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    const data = await res.json();
    if (res.ok && data.folder) {
      updateProgressBar(progressId, 100);
      setTimeout(() => {
        hideProgressBar(progressId);
      }, 500);
      return data.folder;
    } else {
      throw new Error(data.message || "Folder upload failed");
    }
  } catch (error) {
    console.error("Folder upload failed:", error);
    updateProgressBar(progressId, 0, true);
  }
}

// Progress bar UI logic has been moved to progressBar.js

document.addEventListener("DOMContentLoaded", async () => {
  const folderUploadInput = document.getElementById("folderUploadInput");
  const fileUploadInput = document.getElementById("fileUploadInput");
  const fileUploadBtn = document.querySelectorAll(".file-upload-btn");
  const folderUploadBtn = document.querySelectorAll(".folder-upload-btn");
  const fileContainerList = document.querySelector(".file-container-list");
  const currentFolderId = document.body.dataset.folderId;
  const currentView = window.location.pathname.includes("/home")
    ? "home"
    : "drive";

  fileUploadInput?.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadedFile = await uploadFile(file, currentFolderId);
    if (uploadedFile) {
      fileContainerList?.prepend(renderFileItem(uploadedFile, currentView));
    }
    e.target.value = "";
  });

  folderUploadInput?.addEventListener("change", async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const uploadedFolder = await uploadFolder(files, currentFolderId);
    if (uploadedFolder) {
      fileContainerList?.prepend(renderFileItem(uploadedFolder, currentView));
    }
    e.target.value = "";
  });

  fileUploadBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      fileUploadInput?.click();
    });
  });

  folderUploadBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      folderUploadInput?.click();
    });
  });
});

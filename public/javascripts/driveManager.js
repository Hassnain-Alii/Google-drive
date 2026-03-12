document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".file-container");
  const fileContainer = document.querySelector(".file-container-list");
  const emptyState = document.querySelector(".empty-container-state");
  const emptyStateMsg = emptyState?.querySelector(".empty-container-msg");
  const currentFolderId = document.body.dataset.folderId || "";

  const detectView = () => {
    const path = window.location.pathname;
    if (path.includes("/home")) return "home";
    if (path.includes("/my-drive")) return "my-drive";
    if (path.includes("/driveHub")) return "driveHub";
    if (path.includes("/computers")) return "computers";
    if (path.includes("/shared-with-me")) return "shared-with-me";
    if (path.includes("/recent")) return "recent";
    if (path.includes("/starred")) return "starred";
    if (path.includes("/spam")) return "spam";
    if (path.includes("/bin")) return "bin";
    if (path.includes("/storage")) return "storage";
    return "myDrive";
  };
  const currentView = detectView();

  const getDriveUrl = () => {
    const view = currentView;
    const folderId = currentFolderId;

    const urls = {
      home: "/drive/api/view?view=home",
      "my-drive": folderId
        ? `/drive/api/view?view=my-drive&folderId=${folderId}`
        : "/drive/api/view?view=my-drive",
      driveHub: "/drive/api/view?view=driveHub",
      computers: "/drive/api/view?view=computers",
      "shared-with-me": "/drive/api/view?view=shared-with-me",
      recent: "/drive/api/view?view=recent",
      starred: "/drive/api/view?view=starred",
      spam: "/drive/api/view?view=spam",
      bin: "/drive/api/view?view=bin",
      storage: "/drive/api/view?view=storage",
    };
    const url = urls[view];
    return url;
  };

  const loadFiles = async () => {
    try {
      const res = await fetch(getDriveUrl(), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load files");

      const files = await res.json();

      if (files.length === 0) {
        container.classList.add("none");
        emptyState.classList.remove("none");
        const msg = {
          home: " Welcome to your Drive home. Get started by adding files to your My Drive.",
          "my-drive":
            "Drag your files and folders here or use the 'New' button to upload.",
          driveHub: "Your Drive Hub is empty.",
          computers:
            " Folders on your computer that you sync with Drive using Drive for desktop will show up here.",
          "shared-with-me":
            " Say 'goodbye' to email attachments and 'hello' to real-time collaboration. Drag anything shared with you to <b>My Drive</b> for easy access.",
          recent: "See all the files that you've recently edited or opened.",
          starred: "Add stars to things you want to easily find later.",
          spam: " Files in spam won't appear anywhere else in Drive. Files are permanently removed after 30 days.",
          bin: "Items moved to bin will be deleted forever after 30 days.",
          storage: "Items you own will Drive storage.",
        };
        emptyStateMsg &&
          (emptyStateMsg.textContent =
            msg[currentView] || "This folder is empty");
      } else {
        // console.log("Files loaded:", files.length, files);
        container.classList.remove("none");
        emptyState.classList.add("none");
        fileContainer.innerHTML = "";
        files.forEach((file, index) => {
          const context = currentView === "home" ? "home" : "drive";
          // console.log("Rendering file:", file.name, "context:", context);
          const item = renderFileItem(file, context, index);
          // console.log("Rendered item:", item);
          fileContainer.appendChild(item);
        });
      }
    } catch (err) {
      console.error("Error loading files:", err);
      emptyState.classList.remove("none");
      container.classList.add("none");
    }
  };
  loadFiles();
});

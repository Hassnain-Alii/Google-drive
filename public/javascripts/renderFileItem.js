function renderFileItem(file, context = "drive") {
  const li = document.createElement("li");

  li.dataset.fileId = file._id;
  li.dataset.type = file.type;
  li.dataset.mimeType = file.mimeType;
  li.dataset.starred = file.starred ? "true" : "false";
  li.dataset.trashed = file.trashed ? "true" : "false";

  const isFolder = file.type === "folder";
  const name = file.name || "Untitled";
  const parent =
    file.parent == "null" || file.parent == "my-drive"
      ? "My Drive"
      : file.parent;

  const owner = file.ownerInfo?.email || file.ownerInfo?.name || "me";
  const size = isFolder ? "—" : formatBytes(file.size || 0);
  const date = new Date(file.updatedAt || file.createdAt).toLocaleDateString();
  const iconSvg = isFolder
    ? getFileIcon(null, true)
    : getFileIcon(file.mimeType);

  const currentUser = typeof user !== "undefined" ? user : null;
  const profileImg = currentUser?.profileImg
    ? `<img class="file-item-container-owner-img"
      src="/settings/image/${currentUser._id}"
      alt="Profile"
    />`
    : `<svg class="file-item-container-owner-img" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#e8f0fe" />
      <circle cx="12" cy="9" r="3" />
      <path d="M12 13c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />
    </svg>`;

  const fileStarIcon = file.starred
    ? `<svg class="file-item-star-icon" viewBox="0 0 24 24" fill="#FFC107">
         <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
       </svg>`
    : "";

  if (context === "home") {
    li.className =
      "sugg-file-list-item file-container-item file-btn option-bar-button";
    li.dataset.fileId = file._id;
    li.innerHTML = `
                      <div
                        class="sugg-file-item-container file-item-container "
                      >
                        <div
                          class="sugg-file-item-container-header file-item-container-header"
                        >
                ${iconSvg}
                          <span
                            class="sugg-file-item-title file-item-container-title">${name}</span>
                          ${fileStarIcon}
                          <svg
                            class="sugg-file-item-people-icon file-item-container-people-icon"
                            viewBox="0 0 16 16"
                            focusable="false"
                            class="HHjeWe c-qd a-s-fa-Ha-pa"
                            fill="currentColor"
                          >
                            <path
                              d="M5,7 C6.11,7 7,6.1 7,5 C7,3.9 6.11,3 5,3 C3.9,3 3,3.9 3,5 C3,6.1 3.9,7 5,7 L5,7 Z M11,7 C12.11,7 13,6.1 13,5 C13,3.9 12.11,3 11,3 C9.89,3 9,3.9 9,5 C9,6.1 9.9,7 11,7 L11,7 Z M5,8.2 C3.33,8.2 0,9.03 0,10.7 L0,12 L10,12 L10,10.7 C10,9.03 6.67,8.2 5,8.2 L5,8.2 Z M11,8.2 C10.75,8.2 10.46,8.22 10.16,8.26 C10.95,8.86 11.5,9.66 11.5,10.7 L11.5,12 L16,12 L16,10.7 C16,9.03 12.67,8.2 11,8.2 L11,8.2 Z"
                            />
                          </svg>
                        </div>
                        <div
                          class="sugg-file-item-reason-sugg file-item-container-reason-sugg"
                        >
                          <span>${
                            file.updatedAt ? "You opened" : "You created"
                          }</span>
                          <span>·</span>
                          <span>${date}</span>
                        </div>
                        <div
                          class="sugg-file-item-location file-item-container-location"
                        >
                          <svg
                            class="sugg-file-item-location-icon file-item-container-location-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <g>
                              <path
                                d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"
                              ></path>
                              <path d="M0 0h24v24H0z" fill="none"></path>
                            </g>
                          </svg>
                          <span
                            class="sugg-file-item-location-text file-item-container-location-text"
                            >${parent}</span
                          >
                        </div>
                        <button
                          class="sugg-file-container-item-dots-btn file-item-container-dots-btn dropdown-trigger"
                          data-menu="more-action-dropdown-menu"
                        >
                          <svg
                            class="sugg-file-dots-icon file-item-container-dots-icon dots"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M0 0h20v20H0V0z" fill="none" />
                            <path
                              d="M10 6c.82 0 1.5-.68 1.5-1.5S10.82 3 10 3s-1.5.67-1.5 1.5S9.18 6 10 6zm0 5.5c.82 0 1.5-.68 1.5-1.5s-.68-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5zm0 5.5c.82 0 1.5-.67 1.5-1.5 0-.82-.68-1.5-1.5-1.5s-1.5.68-1.5 1.5c0 .83.68 1.5 1.5 1.5z"
                            />
                          </svg>
                        </button>
                      </div>`;
    li.ondblclick = () => {
      if (isFolder) {
        location.href = `/drive/my-drive/folder/${file._id}`;
      } else if (window.openPreview) {
        window.openPreview(file);
      }
    };
  } else {
    li.className = "file-container-item option-bar-button";
    li.dataset.fileId = file._id;
    li.innerHTML = ` <div class="file-item-container file-btn">
                      <div class="file-item-container-header">
                        ${iconSvg}
                        <span class="file-item-container-title file-name">${name}</span>
                        ${fileStarIcon}
                      </div>
                      <div class="file-item-container-owner">
                        ${profileImg}
                        <span class="file-item-container-owner-title file-owner">${owner}</span>
                      </div>
                      <div class="file-item-container-date-modified">
                        <span class="file-item-container-date-modified-text">${date}</span>
                      </div>
                      <div class="file-item-container-size">
                        <p class="file-item-container-size-text">
                          <span class="file-item-container-size-text">${size}</span>
                        </p>
                      </div>
                      <button
                        class="file-item-container-dots-btn dropdown-trigger"
                        data-template="more-action-dropdown-menu"
                      >
                        <svg
                          class="file-item-container-dots-icon"
                          viewBox="0 0 20 20"
                        >
                          <path d="M0 0h20v20H0V0z" fill="none" />
                          <path
                            d="M10 6c.82 0 1.5-.68 1.5-1.5S10.82 3 10 3s-1.5.67-1.5 1.5S9.18 6 10 6zm0 5.5c.82 0 1.5-.68 1.5-1.5s-.68-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5zm0 5.5c.82 0 1.5-.67 1.5-1.5 0-.82-.68-1.5-1.5-1.5s-1.5.68-1.5 1.5c0 .83.68 1.5 1.5 1.5z"
                          />
                        </svg>
                      </button>
                    </div>`;

    li.ondblclick = () => {
      if (isFolder) {
        li.style.cursor = "pointer";
        location.href = `/drive/my-drive/folder/${file._id}`;
      } else if (window.openPreview) {
        window.openPreview(file);
      }
    };
  }
  return li;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    const checkbox = e.target.closest(".file-item-checkbox input");
    if (!checkbox) return;
    e.preventDefault();

    const item = checkbox.closest(".file-container-item");
    if (typeof SelectionStore !== "undefined") {
      SelectionStore.toggle(item.dataset.fileId);
    } else {
      console.warn("SelectionStore not found");
      // Fallback: just let the browser check the box if SelectionStore is missing
      e.target.checked = !e.target.checked;
    }
  });
});
window.renderFileItem = renderFileItem;

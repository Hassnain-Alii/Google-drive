// document.addEventListener("DOMContentLoaded", async () => {
//   const folderUploadInput = document.getElementById("folderUploadInput");
//   const fileUploadInput = document.getElementById("fileUploadInput");
//   const fileUpload = document.querySelectorAll(".file-upload-label");
//   const folderUpload = document.querySelectorAll(".folder-upload-label");
//   const fileContainerList = document.querySelector(".file-container-list");
//   const currentFolderId = document.body.dataset.folderId || "";

//   function createFileItem(item) {
//     const li = document.createElement("li");
//     li.className = "file-container-item";

//     const isFolder = item.type === "folder";

//     li.innerHTML = ` <div class="file-item-container file-btn">
//                       <div class="file-item-container-header">
//                         <svg
//                           class="file-item-container-header-icon"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             d="${
//                               isFolder
//                                 ? "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
//                                 : "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"
//                             }"
//                           />
//                         </svg>

//                         <span class="file-item-container-title"
//                           >U${item.name}</span
//                         >
//                       </div>
//                       <div class="file-item-container-owner">
//                         <svg viewBox="0 0 24 24">
//                           <circle cx="12" cy="12" r="10" fill="#e8f0fe" />
//                           <circle cx="12" cy="9" r="3" />
//                           <path d="M12 13c-4 0-7 2-7 5h14c0-3-3-5-7-5z" />
//                         </svg>
//                         <span>me</span>
//                       </div>
//                       <div class="file-item-container-date-modified">
//                         <span>Just now</span>
//                       </div>
//                       <div class="file-item-container-size">
//                         <p class="file-item-container-size-text">
//                           <span>${
//                             isFolder ? "—" : formatBytes(item.size || 0)
//                           }</span>
//                         </p>
//                       </div>
//                       <button
//                         class="file-item-container-dots-btn dropdown-trigger"
//                         data-template="more-action-dropdown-menu"
//                       >
//                         <svg
//                           class="file-item-container-dots-icon"
//                           viewBox="0 0 20 20"
//                         >
//                           <path d="M0 0h20v20H0V0z" fill="none" />
//                           <path
//                             d="M10 6c.82 0 1.5-.68 1.5-1.5S10.82 3 10 3s-1.5.67-1.5 1.5S9.18 6 10 6zm0 5.5c.82 0 1.5-.68 1.5-1.5s-.68-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5zm0 5.5c.82 0 1.5-.67 1.5-1.5 0-.82-.68-1.5-1.5-1.5s-1.5.68-1.5 1.5c0 .83.68 1.5 1.5 1.5z"
//                           />
//                         </svg>
//                       </button>
//                     </div>`;

//     if (isFolder) {
//       li.onclick = () => {
//         location.href = `/my-drive/folder/${item._id}`;
//       };
//       li.style.cursor = "pointer";
//     }
//     return li;
//   }
//   function formatBytes(bytes) {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   }

//   async function loadAllFiles() {
//     try {
//       const url = currentFolderId
//         ? `/drive/api/folder/${currentFolderId}`
//         : "/drive/api/my-drive";

//       const res = await fetch(url, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to load files");

//       const data = await res.json();
//       fileContainerList.innerHTML = "";
//       data.forEach((item) => {
//         fileContainerList.appendChild(createFileItem(item));
//       });
//     } catch (err) {
//       console.error("Error loading files:", err);
//     }
//   }

//   await loadAllFiles();

//   fileUploadInput?.addEventListener("change", async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const form = new FormData();
//     form.append("file", file);
//     const currentFolderId = document.body.dataset.folderId || "";
//     if (currentFolderId) {
//       form.append("parent", currentFolderId);
//     }

//     try {
//       console.log("Uploading file...");
//       const res = await fetch("/upload/file", {
//         method: "POST",
//         body: form,
//         credentials: "include",
//       });

//       console.log("Response status:", res.status);
//       const data = await res.json();
//       console.log("Response data:", data);

//       if (res.ok && data.file) {
//         fileContainerList.prepend(createFileItem(data.file));
//         console.log("FILE ADDED TO UI!");
//       } else {
//         console.error("Upload failed:", data);
//       }
//     } catch (err) {
//       console.error("Network error:", err);
//     }

//     e.target.value = "";
//   });

//   // FOLDER UPLOAD
//   folderUploadInput?.addEventListener("change", async (e) => {
//     const files = e.target.files;
//     if (!files.length) return;

//     const form = new FormData();
//     for (const file of files) {
//       form.append("folderFiles", file, file.webkitRelativePath);
//     }

//     form.append("folderName", files[0].webkitRelativePath.split("/")[0]);
//     const currentFolderId = document.body.dataset.folderId || "";
//     if (currentFolderId) {
//       form.append("parent", currentFolderId);
//     }

//     try {
//       console.log("Uploading folder with", files.length, "files");
//       const res = await fetch("/upload/folder", {
//         method: "POST",
//         body: form,
//         credentials: "include",
//         headers: {
//           Accept: "application/json",
//         },
//       });

//       const data = await res.json();
//       console.log("Folder response:", data);

//       if (res.ok && data.folder) {
//         fileContainerList.prepend(
//           createFileItem({ ...data.folder, type: "folder" })
//         );
//         console.log("FOLDER ADDED TO UI!");
//       }
//     } catch (err) {
//       console.error("Folder upload error:", err);
//     }

//     e.target.value = "";
//   });

//   fileUpload.forEach((btn) => {
//     btn.addEventListener("click", () => {
//       if (!fileUploadInput) return;
//       fileUploadInput.click();
//     });
//   });
//   folderUpload.forEach((btn) => {
//     btn.addEventListener("click", () => {
//       if (!folderUploadInput) return;
//       folderUploadInput.click();
//     });
//   });
// });

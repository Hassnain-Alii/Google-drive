const preview = document.getElementById("filePreview");

if (preview) {
  const previewBody = preview.querySelector(".preview-body");
  const previewTitle = preview.querySelector(".preview-title");
  const previewDownload = preview.querySelector(".preview-download");
  const previewClose = preview.querySelector(".preview-close");

  const openPreview = (file) => {
    if (!file) return;

    preview.classList.remove("hidden");
    previewTitle.textContent = file.name || "Unknown File";
    previewDownload.href = `/drive/api/files/${file._id}/download`;

    // safety: if it's somehow a folder, don't try to render it as a file
    if (file.type === "folder" || file.isFolder) {
      renderUnsupported(file, "Folders cannot be previewed.");
      return;
    }

    renderPreview(file);
  };

  const closePreview = () => {
    preview.classList.add("hidden");
    
    // Cleanly stop any playing media
    const mediaElements = previewBody.querySelectorAll("video, audio");
    mediaElements.forEach((media) => {
      media.pause();
      media.removeAttribute("src");
      media.load();
    });
    
    previewBody.innerHTML = "";
  };

  // Close preview on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !preview.classList.contains("hidden")) {
      closePreview();
    }
  });

  // Close when clicking directly on the overlay background
  preview.addEventListener("click", (e) => {
    if (e.target === preview) {
      closePreview();
    }
  });

  function renderPreview(file) {
    previewBody.innerHTML = "";

    // Safeguard missing mimeType which resulted in crashes (startsWith of undefined)
    const type = file.mimeType || "";

    // IMAGE
    if (type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = `/drive/api/files/${file._id}/view`;
      img.onerror = () => renderUnsupported(file, "Failed to load image. It might be corrupted or not a valid image file.");
      previewBody.appendChild(img);
      return;
    }

    // VIDEO
    if (type.startsWith("video/")) {
      const video = document.createElement("video");
      video.src = `/drive/api/files/${file._id}/view`;
      video.controls = true;
      video.style.maxWidth = "100%";
      video.onerror = () => renderUnsupported(file, "Failed to load video.");
      previewBody.appendChild(video);
      return;
    }

    // AUDIO
    if (type.startsWith("audio/")) {
      const audio = document.createElement("audio");
      audio.src = `/drive/api/files/${file._id}/view`;
      audio.controls = true;
      audio.onerror = () => renderUnsupported(file, "Failed to load audio.");
      previewBody.appendChild(audio);
      return;
    }

    // PDF
    if (type === "application/pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = `/drive/api/files/${file._id}/view`;
      previewBody.appendChild(iframe);
      return;
    }

    // TEXT / CODE 
    if (type.startsWith("text/") || type === "application/json" || type === "application/javascript" || type === "application/xml") {
      const iframe = document.createElement("iframe");
      iframe.src = `/drive/api/files/${file._id}/view`;
      previewBody.appendChild(iframe);
      return;
    }

    // OFFICE FILES
    if (
      type.includes("word") ||
      type.includes("excel") ||
      type.includes("powerpoint") ||
      type.includes("officedocument") ||
      type.includes("ms-")
    ) {
      const iframe = document.createElement("iframe");

      // MS Office Online Viewer (needs public URL, works in prod environments)
      iframe.src =
        `https://view.officeapps.live.com/op/embed.aspx?src=` +
        encodeURIComponent(
          window.location.origin + `/drive/api/files/${file._id}/view`,
        );

      previewBody.appendChild(iframe);

      return;
    }

    // FALLBACK
    renderUnsupported(file);
  }

  function renderUnsupported(file, message = "This file cannot be previewed.") {
    const div = document.createElement("div");

    div.style.textAlign = "center";
    div.style.color = "white";
    div.style.padding = "20px";

    div.innerHTML = `
    <h2 style="margin-bottom: 10px;">${file.name || "Unknown File"}</h2>
    <p style="margin-bottom: 20px;">${message}</p>
    <a href="/drive/api/files/${file._id}/download"
       class="preview-download" style="display: inline-block; padding: 10px 20px; background: #1a73e8; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
    Download file
    </a>
  `;

    previewBody.innerHTML = ""; // Clear any partial content
    previewBody.appendChild(div);
  }

  previewClose.onclick = closePreview;

  window.openPreview = openPreview;
  window.closePreview = closePreview;
}

// public/js/fileIcons.js
window.getFileIcon = function (mimeType, isFolder = false) {
  if (isFolder) {
    return `
      <svg viewBox="0 0 24 24" fill="#4285f4">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>`;
  }

  const icons = {
    // Images
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/gif": "image",
    "image/webp": "image",
    "image/svg+xml": "image",

    // Videos
    "video/mp4": "video",
    "video/mpeg": "video",
    "video/quicktime": "video",
    "video/webm": "video",
    "video/x-msvideo": "video",

    // Audio
    "audio/mpeg": "audio",
    "audio/wav": "audio",
    "audio/ogg": "audio",

    // PDF
    "application/pdf": "pdf",

    // Word
    "application/msword": "word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "word",

    // Excel
    "application/vnd.ms-excel": "excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "excel",

    // PowerPoint
    "application/vnd.ms-powerpoint": "powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "powerpoint",

    // ZIP/RAR
    "application/zip": "archive",
    "application/x-rar-compressed": "archive",
    "application/x-7z-compressed": "archive",

    // Text
    "text/plain": "text",
    "application/json": "text",

    // Code files
    "text/javascript": "code",
    "text/html": "code",
    "application/x-sh": "code",
  };

  const type = Object.keys(icons).find(
    (key) => mimeType?.startsWith(key) || mimeType === key
  )
    ? icons[
        Object.keys(icons).find(
          (key) => mimeType?.startsWith(key) || mimeType === key
        )
      ]
    : "generic";

  const svg = {
    image: `<svg viewBox="0 0 24 24"><path fill="#4285f4" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,

    video: `<svg viewBox="0 0 24 24"><path fill="#ff5722" d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 8.26V16l5-3.5-5-3.5v3.26z"/></svg>`,

    audio: `<svg viewBox="0 0 24 24"><path fill="#9c27b0" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,

    pdf: `<svg viewBox="0 0 24 24"><path fill="#f44336" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 10h-3v3H9v-3H6v-2h3V7h2v3h3v2z"/></svg>`,

    word: `<svg viewBox="0 0 24 24"><path fill="#1e88e5" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 12h-1v3h-1v-3H9v-2h1V9h1v3h1v2zm4-4h-3v2h1v3h1v-3h1v-2z"/></svg>`,

    excel: `<svg viewBox="0 0 24 24"><path fill="#4caf50" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 13l-2-2 2-2h-2l-2 2 2 2h2zm-4-4h2l-2-2-2 2zm6 4h-2l2-2-2-2h2l2 2-2 2z"/></svg>`,

    powerpoint: `<svg viewBox="0 0 24 24"><path fill="#ff9800" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 12H9V9h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2z"/></svg>`,

    archive: `<svg viewBox="0 0 24 24"><path fill="#795548" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 8h-2v2h2v2h-2v2h-2v-2H9v-2h2v-2H9v-2h2V8h2v4h2v2z"/></svg>`,

    text: `<svg viewBox="0 0 24 24"><path fill="#43a047" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7h-2V4h-1v5H8l4 4 4-4h-3z"/></svg>`,

    code: `<svg viewBox="0 0 24 24"><path fill="#00bcd4" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`,

    generic: `<svg viewBox="0 0 24 24"><path fill="#9e9e9e" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/></svg>`,
  };

  return svg[type] || svg.generic;
};

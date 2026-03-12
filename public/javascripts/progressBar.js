const ProgressManager = (() => {
  const progressBars = new Map();

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function createContainer() {
    let container = document.getElementById("progress-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "progress-container";
      container.style.position = "absolute";
      container.style.bottom = "20px";
      container.style.right = "20px";
      container.style.width = "350px";
      container.style.zIndex = "2000";
      document.body.appendChild(container);
    }
    return container;
  }

  function show(name, size) {
    const progressId = `progress-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const container = createContainer();

    const progressHtml = `
      <div class="progress-bar" id="${progressId}" style="transition: opacity 0.5s ease;">
          <div class="progress-info">
            <span class="progress-name" style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
            <span class="progress-size" style="font-size: 12px; color: #5f6368;">${formatBytes(
              size
            )}</span>
          </div>
          <div class="progress-circle" style="width: 36px; height: 36px; position: relative;">
            <svg viewBox="0 0 36 36" style="transform: rotate(-90deg);">
              <path class="circle-bg" 
                stroke="#e8eaed" 
                stroke-width="3" 
                fill="none" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" 
                stroke="#1a73e8" 
                stroke-width="3" 
                stroke-linecap="round" 
                fill="none" 
                stroke-dasharray="0, 100" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                style="transition: stroke-dasharray 0.3s ease;"/>
            </svg>
          </div>
          <button class="progress-cancel" style="background: none; border: none; cursor: pointer; color: #5f6368; font-size: 18px; padding: 0 5px;">✕</button>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", progressHtml);

    const item = document.getElementById(progressId);
    const cancelBtn = item.querySelector(".progress-cancel");
    cancelBtn.onclick = () => {
      const data = progressBars.get(progressId);
      if (data && data.onCancel) data.onCancel();
      hide(progressId);
    };

    progressBars.set(progressId, { name, size, onCancel: null });
    return progressId;
  }

  function update(progressId, percentage, isError = false, totalSize = null) {
    const item = document.getElementById(progressId);
    if (!item) return;

    const circle = item.querySelector(".circle");
    if (circle) {
      circle.setAttribute("stroke-dasharray", `${percentage}, 100`);
      item.style.borderLeft = "4px solid #1a73e8";
    }

    if (totalSize !== null) {
      const sizeSpan = item.querySelector(".progress-size");
      if (sizeSpan) sizeSpan.textContent = formatBytes(totalSize);
    }

    if (isError) {
      if (circle) circle.style.stroke = "#d93025";
      const item = document.getElementById(progressId);
      if (item) {
        item.style.borderLeft = "4px solid #d93025";
        // Auto-hide error after 5 seconds
        setTimeout(() => {
          hide(progressId);
        }, 5000);
      }
    }
  }

  function hide(progressId) {
    const item = document.getElementById(progressId);
    if (!item) return;
    item.style.opacity = "0";
    setTimeout(() => {
      item.remove();
      progressBars.delete(progressId);

      // Remove container if empty
      const container = document.getElementById("progress-container");
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 500);
  }

  function setCancelHandler(progressId, handler) {
    const data = progressBars.get(progressId);
    if (data) data.onCancel = handler;
  }

  return {
    show,
    update,
    hide,
    formatBytes,
    setCancelHandler,
  };
})();

// Global assignments for backward compatibility and easy access
window.ProgressManager = ProgressManager;
window.showProgressBar = ProgressManager.show;
window.updateProgressBar = ProgressManager.update;
window.hideProgressBar = ProgressManager.hide;
window.formatBytes = ProgressManager.formatBytes;

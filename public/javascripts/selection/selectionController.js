// public/js/selection/selectionController.js
document.addEventListener("DOMContentLoaded", () => {
  function getItems() {
    return Array.from(document.querySelectorAll(".file-container-item"));
  }

  function getItemIds() {
    return getItems().map((el) => el.dataset.fileId);
  }

  // Helper to find the scrollable container
  function getScrollContainer() {
    const list = document.querySelector(".file-container-list");
    if (list) {
      if (list.scrollHeight > list.clientHeight) return list;
      let parent = list.parentElement;
      while (parent && parent !== document.body) {
        if (parent.scrollHeight > parent.clientHeight) {
          const style = window.getComputedStyle(parent);
          if (style.overflowY === "auto" || style.overflowY === "scroll") {
            return parent;
          }
        }
        parent = parent.parentElement;
      }
    }
    return document.documentElement;
  }

  document.addEventListener("click", (e) => {
    if (typeof SelectionStore === "undefined") return;

    const item = e.target.closest(".file-container-item");
    if (!item) {
      // Clear selection if clicking on background of ANY main area
      const isBackground = e.target.closest(
        ".main-container, .content-container, .file-container, .file-content-container, .file-container-list",
      );

      if (isBackground) {
        // But PROTECT headers, dots, or dropdown triggers
        const isInteractive = e.target.closest(
          " .file-container-header, .dropdown-trigger, .dots, .option-bar, .more-action-dropdown",
        );

        if (!isInteractive) {
          SelectionStore.clear();
        }
      }
      return;
    }

    // Don't interfere if clicking action buttons, dropdowns, etc.
    if (
      e.target.closest(".dropdown-trigger") ||
      e.target.closest(".more-action-dropdown") ||
      e.target.closest(".option-bar") ||
      e.target.closest(".dots") ||
      e.target.closest(".file-item-container-dots-btn")
    )
      return;

    const id = item.dataset.fileId;
    const allIds = getItemIds();

    if (e.shiftKey) {
      e.preventDefault();
      const anchor = SelectionStore.getAnchor();
      if (!anchor) {
        SelectionStore.select(id);
      } else {
        const start = allIds.indexOf(anchor);
        const end = allIds.indexOf(id);
        if (start !== -1 && end !== -1) {
          const range = allIds.slice(
            Math.min(start, end),
            Math.max(start, end) + 1,
          );
          SelectionStore.replace(range, true);
        }
      }
    } else if (e.ctrlKey || e.metaKey) {
      SelectionStore.toggle(id);
    } else {
      SelectionStore.replace([id]);
    }
  });

  // Drag selection
  let startX, startY; // Viewport relative
  let startScrollTop, startScrollLeft;
  let currentScrollContainer = null;
  let selectionBox = null;
  let autoScrollFrame = null;
  let isDragging = false;
  let lastClientX = 0,
    lastClientY = 0;

  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;

    // Reject if clicking an item or button
    if (
      e.target.closest(".file-container-item") ||
      e.target.closest(".dropdown-trigger") ||
      e.target.closest(".more-action-dropdown") ||
      e.target.closest(".option-bar") ||
      e.target.closest(".file-container-header") ||
      e.target.closest(".dots")
    )
      return;

    // Allow drag to start from any area within the main workspace
    const listArea = e.target.closest(
      ".file-container, .file-content-container, .file-container-list",
    );
    if (!listArea) return;

    e.preventDefault();

    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      SelectionStore.clear();
    }

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    currentScrollContainer = getScrollContainer();
    startScrollTop =
      currentScrollContainer === document.documentElement
        ? window.scrollY
        : currentScrollContainer.scrollTop;
    startScrollLeft =
      currentScrollContainer === document.documentElement
        ? window.scrollX
        : currentScrollContainer.scrollLeft;

    if (!selectionBox) {
      selectionBox = document.createElement("div");
      selectionBox.id = "selection-box-element";
      selectionBox.className = "selection-box";
      // We append it to the container instead of body so it can be clipped by the container's overflow or we clip it manually.
      // Manually clipping is more reliable for viewport coordinates.
      (document.body || document.documentElement).appendChild(selectionBox);
    }

    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.left = `${e.clientX}px`;
    selectionBox.style.top = `${e.clientY}px`;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    if (currentScrollContainer === document.documentElement) {
      window.addEventListener("scroll", onScroll);
    } else {
      currentScrollContainer.addEventListener("scroll", onScroll);
    }

    updateSelection(e.clientX, e.clientY);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    updateSelection(e.clientX, e.clientY);
    checkForAutoScroll(e.clientX, e.clientY);
  }

  function onScroll() {
    if (!isDragging) return;
    updateSelection(lastClientX, lastClientY);
  }

  function updateSelection(clientX, clientY) {
    lastClientX = clientX;
    lastClientY = clientY;

    if (!selectionBox) return;

    const scrollTop =
      currentScrollContainer === document.documentElement
        ? window.scrollY
        : currentScrollContainer.scrollTop;
    const scrollLeft =
      currentScrollContainer === document.documentElement
        ? window.scrollX
        : currentScrollContainer.scrollLeft;

    const deltaY = scrollTop - startScrollTop;
    const deltaX = scrollLeft - startScrollLeft;

    // The virtual anchor point represents where the "click" would be in the current viewport coordinates IF it moved with the content.
    const virtualAnchorX = startX - deltaX;
    const virtualAnchorY = startY - deltaY;

    // The raw selection area (virtual)
    const rawLeft = Math.min(virtualAnchorX, clientX);
    const rawTop = Math.min(virtualAnchorY, clientY);
    const rawRight = Math.max(virtualAnchorX, clientX);
    const rawBottom = Math.max(virtualAnchorY, clientY);

    // BOX CLIPPING FOR VISUAL FEEDBACK
    // We constrain the VISUAL box to the container's viewport so it doesn't overlap the header (Point A)
    const containerRect =
      currentScrollContainer === document.documentElement
        ? {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth,
          }
        : currentScrollContainer.getBoundingClientRect();

    const visualLeft = Math.max(rawLeft, containerRect.left);
    const visualTop = Math.max(rawTop, containerRect.top);
    const visualRight = Math.min(rawRight, containerRect.right);
    const visualBottom = Math.min(rawBottom, containerRect.bottom);

    const visualWidth = Math.max(0, visualRight - visualLeft);
    const visualHeight = Math.max(0, visualBottom - visualTop);

    selectionBox.style.left = `${visualLeft}px`;
    selectionBox.style.top = `${visualTop}px`;
    selectionBox.style.width = `${visualWidth}px`;
    selectionBox.style.height = `${visualHeight}px`;

    // INTERSECTION LOGIC (Uses untrimmed virtual box to keep selection correct as files move)
    const items = document.querySelectorAll(".file-container-item");
    const selectedIds = [];
    const selectionRect = {
      left: rawLeft,
      top: rawTop,
      right: rawRight,
      bottom: rawBottom,
    };

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (
        rect.left < selectionRect.right &&
        rect.right > selectionRect.left &&
        rect.top < selectionRect.bottom &&
        rect.bottom > selectionRect.top
      ) {
        selectedIds.push(item.dataset.fileId);
      }
    });

    SelectionStore.replace(selectedIds);
  }

  function checkForAutoScroll(clientX, clientY) {
    if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);

    const containerRect =
      currentScrollContainer === document.documentElement
        ? {
            left: 0,
            right: window.innerWidth,
            top: 0,
            bottom: window.innerHeight,
          }
        : currentScrollContainer.getBoundingClientRect();

    // Don't scroll if mouse is horizontally outside the container
    if (clientX < containerRect.left || clientX > containerRect.right) return;

    const threshold = 60;
    const maxSpeed = 30;

    let dy = 0;
    if (clientY < containerRect.top + threshold) {
      // Proportional speed
      dy = -Math.max(5, (containerRect.top + threshold - clientY) / 2);
    } else if (clientY > containerRect.bottom - threshold) {
      dy = Math.max(5, (clientY - (containerRect.bottom - threshold)) / 2);
    }

    dy = Math.max(-maxSpeed, Math.min(maxSpeed, dy));

    if (dy !== 0) {
      autoScrollFrame = requestAnimationFrame(() => {
        if (currentScrollContainer === document.documentElement) {
          window.scrollBy(0, dy);
        } else {
          currentScrollContainer.scrollTop += dy;
        }
        updateSelection(lastClientX, lastClientY);
        checkForAutoScroll(lastClientX, lastClientY);
      });
    } else {
      autoScrollFrame = null;
    }
  }

  function onMouseUp() {
    isDragging = false;
    if (selectionBox) {
      selectionBox.remove();
      selectionBox = null;
    }
    if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame);

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (currentScrollContainer) {
      if (currentScrollContainer === document.documentElement) {
        window.removeEventListener("scroll", onScroll);
      } else {
        currentScrollContainer.removeEventListener("scroll", onScroll);
      }
    }
  }
});

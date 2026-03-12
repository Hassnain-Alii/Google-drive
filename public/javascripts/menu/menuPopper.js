function applyMenuPolicy(menu) {
  const selectedFiles = window.SelectionStore.getAll();
  const policy = window.menuPolicy.computeMenuState(selectedFiles);
  Object.entries(policy).forEach(([action, cfg]) => {
    const item = menu.querySelector(
      `.more-action-dropdown-item[data-action="${action}"]`
    );
    if (!item) return;

    if (!cfg.visible) {
      item.style.display = "none";
      return;
    }
    item.style.display = "";
    item.classList.toggle("disabled", cfg.disabled);
  });

  const starState = window.menuPolicy.getStarState(selectedFiles);
  const starItem = menu.querySelector(
    ".more-action-dropdown-item[data-action='star']"
  );
  if (starItem) {
    const span = starItem.querySelector("span");
    const svg = starItem.querySelector("svg");
    if (starState === "none") {
      span.textContent = "Add to Starred";
      svg.style.fill = "currentColor";
    } else if (starState === "all") {
      span.textContent = "Remove from Starred";
      svg.style.fill = "#FFC107";
    } else if (starState === "some") {
      span.textContent = "Add to Starred";
      svg.style.fill = "currentColor";
    } else {
      span.textContent = "Add to Starred";
      svg.style.fill = "currentColor";
    }
  }
}

function updateDropdownForView(view, isStarred, isTrashed) {
  const menu = document.querySelector(".more-action-dropdown.open");
  if (!menu) return;
  const starSpan = menu.querySelector(".default-view .file-starred span");
  const starSvg = menu.querySelector(".default-view .file-starred svg");

  menu
    .querySelectorAll(".menu-section")
    .forEach((s) => (s.style.display = "none"));

  if (view === "starred") {
    menu.querySelector(".default-view").style.display = "block";
    menu.querySelector(".starred-view").style.display = "block";
  } else if (view === "bin") {
    menu.querySelector(".bin-view").style.display = "block";
  } else {
    menu.querySelector(".default-view").style.display = "block";
    menu.querySelector(".starred-view").style.display = "block";
  }
  applyMenuPolicy(menu);
}

function showMenu(e, currentView, file) {
  console.log("showMenu", file);
  let popperInstance = null;

  // Close all other open menus first
  document.querySelectorAll(".dropdown-menu.open").forEach((m) => {
    m.classList.remove("open");
  });

  const anchor = document.getElementById("context-menu-anchor");
  if (anchor) {
    anchor.style.position = "fixed";
    anchor.style.left = e.clientX + "px";
    anchor.style.top = e.clientY + "px";
    anchor.style.zIndex = "9999";
  }

  let menu = document.querySelector(".more-action-dropdown");
  if (!menu) {
    // If not in DOM, check if it's in a template
    const template = document.getElementById("more-action-dropdown-menu");
    if (template && template.content) {
      const clone = template.content.cloneNode(true);
      menu = clone.querySelector(".more-action-dropdown");
      if (menu) {
        document.body.appendChild(menu);
      }
    }
  }

  if (!menu) {
    console.error("Could not find .more-action-dropdown menu or template");
    return;
  }
  menu.classList.add("open");

  setTimeout(() => {
    if (popperInstance) {
      popperInstance.destroy();
      popperInstance = null;
    }

    updateDropdownForView(currentView, file.isStarred);

    if (menu && anchor && typeof Popper !== "undefined") {
      popperInstance = Popper.createPopper(anchor, menu, {
        placement: "bottom-start",
        strategy: "fixed",
        modifiers: [
          {
            name: "offset",
            options: { offset: [0, 5] },
          },
          {
            name: "preventOverflow",
            options: {
              boundary: "viewport",
              padding: 8,
              altAxis: true,
            },
          },
          {
            name: "flip",
            options: {
              fallbackPlacements: [
                "top-start",
                "right-start",
                "left-start",
                "bottom-end",
              ],
              padding: 8,
            },
          },
        ],
      });

      // Force immediate update
      requestAnimationFrame(() => {
        if (popperInstance) {
          popperInstance.update();
        }
      });
    }
  }, 10);
}
if (window.SelectionStore?.subscribe) {
  SelectionStore.subscribe(() => {
    const menu = document.querySelector(".more-action-dropdown.open");
    if (menu) {
      applyMenuPolicy(menu);
    }
  });
}

window.menuPopper = {
  showMenu,
  updateDropdownForView,
  applyMenuPolicy,
};

// Global listener for menu updates (triggered by bulk actions etc)
document.addEventListener("menu:update", (e) => {
  const menu = document.querySelector(".more-action-dropdown.open");
  if (menu) {
    applyMenuPolicy(menu);
  }
});

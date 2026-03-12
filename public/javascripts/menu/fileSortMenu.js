window.SortState = {
  sortBy: null,
  sortDirection: "asc",
  folderMode: "top",
};

function originalOrder() {
  document.querySelectorAll(".file-container-item").forEach((el, i) => {
    el.dataset.originalIndex = i;
  });
}
document.addEventListener("DOMContentLoaded", originalOrder);

//Sorting Menu
document.addEventListener("DOMContentLoaded", () => {
  const sortOptions = document.querySelectorAll(".file-container-sort-option");

  sortOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const text = option.textContent.trim();

      if (text === "Name") {
        SortState.sortBy = "name";
        setActiveOption(".sort-by-list", option);
      }
      if (
        ["Date modified", "Date modified by me", "Date opened by me"].includes(
          text,
        )
      ) {
        SortState.sortBy = "dateModified";
        setActiveOption(".sort-by-list", option);
      }

      if (text === "A to Z") {
        SortState.sortDirection = "asc";
        setActiveOption(".sort-direction-list", option);
      }
      if (text === "Z to A") {
        SortState.sortDirection = "desc";
        setActiveOption(".sort-direction-list", option);
      }

      if (text === "On top") {
        SortState.folderMode = "top";
        setActiveOption(".sort-folder-list", option);
      }
      if (text === "Mixed with files") {
        SortState.folderMode = "mixed";
        setActiveOption(".sort-folder-list", option);
      }
      applySorting();
    });
  });
  document.querySelectorAll(".file-container-filter-option").forEach((el) => {
    if (el.textContent.includes("Name")) el.classList.add("active");
    if (el.textContent.includes("A to Z")) el.classList.add("active");
    if (el.textContent.includes("On top")) el.classList.add("active");
  });
});

function parseDate(dateStr) {
  if (!dateStr) return 0;
  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day).getTime();
}

function setActiveOption(groupSelector, clickedItem) {
  const group = clickedItem.closest(groupSelector);
  const items = group.querySelectorAll(".file-container-sort-option");
  items.forEach((item) => {
    item.classList.remove("active");
  });
  clickedItem.classList.add("active");
  document
    .querySelectorAll(".file-name-title svg, .file-date-modified-title svg")
    .forEach((svg) => {
      svg.style.opacity = "0";
    });
}
function getSortValue(el) {
  const name =
    el
      .querySelector(".file-item-container-title")
      ?.textContent.trim()
      .toLowerCase() || "";
  const date =
    el.querySelector(".file-item-container-date-modified span")?.textContent ||
    "";

  if (SortState.sortBy === "name") return name;

  if (SortState.sortBy === "dateModified") {
    return parseDate(date);
  }

  return name;
}

function applySorting() {
  const list = document.querySelector(".file-container-list");
  if (!list) return;

  const items = Array.from(
    list.children || list.querySelectorAll(".file-container-item"),
  );

  const firstRects = new Map();
  items.forEach((item) => {
    firstRects.set(item, item.getBoundingClientRect());
  });
  let sorted;
  if (!SortState.sortBy) {
    sorted = [...items].sort(
      (a, b) => a.dataset.originalIndex - b.dataset.originalIndex,
    );
  } else {
    sorted = [...items].sort((a, b) => {
      const A = getSortValue(a);
      const B = getSortValue(b);

      if (A < B) return SortState.sortDirection === "asc" ? -1 : 1;
      if (A > B) return SortState.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }
  if (SortState.folderMode === "top") {
    sorted.sort((a, b) => {
      const af = a.dataset.type === "folder";
      const bf = b.dataset.type === "folder";

      return af === bf ? 0 : af ? -1 : 1;
    });
  }

  sorted.forEach((el) => list.appendChild(el));
  sorted.forEach((el) => {
    const first = firstRects.get(el);
    const last = el.getBoundingClientRect();

    const dx = first.left - last.left;
    const dy = first.top - last.top;

    el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.style.transition = "transform 0s";

    requestAnimationFrame(() => {
      el.style.transition = "transform 200ms ease";
      el.style.transform = "translate(0, 0)";
    });
  });
}

// Sorting by header

document.addEventListener("DOMContentLoaded", () => {
  const nameHeader = document.querySelector(".file-name-title");
  const dateHeader = document.querySelector(".file-date-modified-title");

  nameHeader.addEventListener("click", () => {
    handleHeaderSort("name");
    updateHeaderIcon(nameHeader);
  });

  dateHeader.addEventListener("click", () => {
    handleHeaderSort("dateModified");
    updateHeaderIcon(dateHeader);
  });
});

function handleHeaderSort(type) {
  if (SortState.sortBy !== type) {
    SortState.sortBy = type;
    SortState.sortDirection = "asc";
  } else {
    SortState.sortDirection =
      SortState.sortDirection === "asc" ? "desc" : "asc";
  }
  applySorting();
}

function updateHeaderIcon(activeHeader) {
  document
    .querySelectorAll(".file-name-title svg, .file-date-modified-title svg")
    .forEach((svg) => {
      svg.style.transform =
        SortState.sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)";
      svg.style.opacity = "0";
    });
  const svg = activeHeader.querySelector("svg");
  if (!svg) return;
  svg.style.opacity = "1";
  svg.style.transform =
    SortState.sortDirection === "asc" ? "rotate(0deg)" : "rotate(180deg)";
}

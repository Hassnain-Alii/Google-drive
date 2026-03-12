document.addEventListener("DOMContentLoaded", () => {
  const MAX_SUGGESTIONS = 6;
  const searchInput = document.querySelector(".drive-search-input");
  const searchBar = document.querySelector(".header-search-bar");
  const searchDropdown = document.querySelector(".search-suggestions-dropdown");
  const suggestionsList = document.querySelector(".suggestion-list");

  if (!searchInput || !searchDropdown || !suggestionsList) return;

  let debounce;
  let lastQuery = "";
  let cachedResults = [];

  searchInput.addEventListener("input", () => {
    clearTimeout(debounce);

    const query = searchInput.value.trim();
    if (query === lastQuery) return;
    lastQuery = query;

    if (!query) {
      hideSearchDropdown();
      return;
    }

    debounce = setTimeout(() => {
      fetchSearchResults(query);
    }, 600);
  });

  function showSearchDropdown() {
    searchDropdown.classList.remove("hidden");
    searchDropdown.classList.add("active");
    if (searchInput.value.length > 0) {
      searchBar.classList.add("active");
    }
  }

  function hideSearchDropdown() {
    searchDropdown.classList.add("hidden");
    searchBar.classList.remove("active");
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search-bar")) {
      hideSearchDropdown();
    }
  });
  function closeAllMenus() {
    document
      .querySelectorAll(".dropdown-menu, .option-bar, .context-menu")
      .forEach((el) => el.classList.add("none"));
    SelectionStore.clear();
  }

  searchInput.addEventListener("focus", () => {
    closeAllMenus();
    if (lastQuery) {
      fetchSearchResults(lastQuery);
    }
    showSearchDropdown();
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllMenus();
      hideSearchDropdown();
    }
    if (e.key === "Enter") {
      runFullSearch(searchInput.value.trim());
    }
  });

  document
    .querySelector(".header-search-btn")
    ?.addEventListener("click", () => {
      runFullSearch(searchInput.value.trim());
    });

  async function fetchSearchResults(query) {
    if (query.length < 2) {
      // For very short queries, maybe just local scrape or nothing
      const localMatches = localScrape(query);
      renderSearchSuggestions(localMatches, query);
      return;
    }

    try {
      const res = await fetch(
        `/drive/api/search?q=${encodeURIComponent(query)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Search failed");
      const apiResults = await res.json();

      // Convert API results to match the format used by the renderer
      const formattedResults = apiResults.map((file) => ({
        name: file.name,
        owner: file.ownerInfo?.email || "me",
        date: new Date(file.updatedAt || file.createdAt).toLocaleDateString(),
        size: file.type === "folder" ? "—" : formatBytes(file.size || 0),
        location:
          file.parent === "null" ||
          !file.parent ||
          file.parent === "my-drive"
            ? "My Drive"
            : "Folder",
        mimeType: file.mimeType,
        isFolder: file.type === "folder",
        _id: file._id,
        type: file.type,
      }));

      cachedResults = formattedResults;
      renderSearchSuggestions(formattedResults, query);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      // Fallback to local scrape if API fails
      renderSearchSuggestions(localScrape(query), query);
    }
  }

  function localScrape(query) {
    const items = document.querySelectorAll(".file-container-item");
    const matches = [];
    const lowerQuery = query.toLowerCase();

    items.forEach((item) => {
      const nameEl = item.querySelector(".file-item-container-title.file-name");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      if (name.toLowerCase().includes(lowerQuery)) {
        matches.push({
          name: name,
          owner: item.querySelector(".file-owner")?.textContent.trim() || "me",
          date:
            item
              .querySelector(".file-item-container-date-modified-text")
              ?.textContent.trim() || "",
          size:
            item
              .querySelector(".file-item-container-size-text")
              ?.textContent.trim() || "",
          location: "Current View",
          mimeType: item.dataset.mimeType || "",
          isFolder: item.dataset.type === "folder",
          _id: item.dataset.fileId,
        });
      }
    });
    return matches;
  }

  function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function renderSearchSuggestions(files, query) {
    suggestionsList.innerHTML = "";
    if (!files.length) {
      suggestionsList.innerHTML =
        "<div class='suggestion-empty'>No matching files found</div>";
      showSearchDropdown();
      return;
    }
    const slicedFiles = files.slice(0, MAX_SUGGESTIONS);
    slicedFiles.forEach((file) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";

      const iconSvg =
        typeof getFileIcon === "function"
          ? file.isFolder
            ? getFileIcon(null, true)
            : getFileIcon(file.mimeType)
          : "";

      li.innerHTML = `
      <div class="suggestion-item-container">
        <div class="suggestion-item-header">
          <div class="suggestion-item-icon">
            ${iconSvg}
          </div>
          <div class="suggestion-item-info">
            <div class="suggestion-item-name">
              ${highlight(file.name, query)}
            </div>
            <div class="suggestion-item-meta">
              ${file.owner}
            </div>
          </div>
        </div>
        <div class="suggestion-item-footer">
          <div class="suggestion-item-date">
            ${file.date}
          </div>
          <div class="suggestion-item-location">
            ${file.location}
          </div>
        </div>    
      </div>    
      `;
      li.onclick = () => {
        searchInput.value = file.name;
        runFullSearch(file.name);
      };
      suggestionsList.appendChild(li);
    });

    if (files.length > 0) {
      const more = document.createElement("div");
      more.className = "suggestion-show-all";
      more.textContent = "Show all results";
      more.onclick = () => {
        runFullSearch(query);
      };
      suggestionsList.appendChild(more);
    }
    showSearchDropdown();
  }

  function highlight(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(re, "<mark>$1</mark>");
  }

  async function runFullSearch(query) {
    if (!query) return;
    hideSearchDropdown();
    showLoader(true);
    try {
      const res = await fetch(
        `/drive/api/search?q=${encodeURIComponent(query)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to search");
      const data = await res.json();
      renderSearchResults(data);
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      showLoader(false);
    }
  }

  function showLoader(show) {
    const loader = document.getElementById("searchLoader");
    if (loader) loader.classList.toggle("hidden", !show);
  }

  function renderSearchResults(files) {
    const container = document.querySelector(".file-container");
    const list = document.querySelector(".file-container-list");
    const empty = document.querySelector(".empty-container-state");

    if (!list) return;
    list.innerHTML = "";

    // Specific to Home page: ensure the container is visible if it was hidden
    if (container) {
      container.classList.remove("none", "sugg-file-hide");
      container.style.display = "block"; // Force display
    }

    if (!files || !files.length) {
      if (container) container.classList.add("none");
      if (empty) {
        empty.classList.remove("none");
        const img = empty.querySelector(".empty-container-img");
        if (img)
          img.src =
            "https://ssl.gstatic.com/docs/doclist/images/empty_state_no_search_results_v6.svg";
        const header = empty.querySelector(".empty-container-msg-header");
        if (header)
          header.textContent = "None of your files matched this search";
        const msg = empty.querySelector(".empty-container-msg");
        if (msg)
          msg.textContent =
            "Try another search, or use search options to find a file by type, owner and more";
      }
      return;
    }

    if (empty) empty.classList.add("none");
    if (container) container.classList.remove("none");

    files.forEach((file) => {
      if (window.renderFileItem) {
        const el = window.renderFileItem(file);
        list.appendChild(el);
      }
    });
  }
});

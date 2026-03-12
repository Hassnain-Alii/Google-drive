document.addEventListener("DOMContentLoaded", async () => {
  const suggFolderList = document.querySelector(".sugg-fold-list");
  const suggFileList = document.querySelector(".file-container-list");
  const currentView = window.location.pathname.includes("/home")
    ? "home"
    : "drive";

  const createSuggFolderItem = (folder) => {
    const li = document.createElement("li");
    li.className = "sugg-fold-list-item";
    li.innerHTML = `
                            <li class="sugg-fold-list-item">
                  <button class="fold-btn option-bar-button">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <g>
                        <path
                          d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"
                        ></path>
                        <path d="M0 0h24v24H0z" fill="none"></path>
                      </g>
                    </svg>
                    <div class="sugg-fold-titles">
                      <P class="sugg-fold-main-title"><span>${folder.name}</span></P>
                      <P class="sugg-fold-sub-title"
                        ><span>In My Drive</span></P
                      >
                    </div>
                  </button>
                  <button
                    class="sugg-fold-dots-btn dropdown-trigger"
                    data-menu="more-action-dropdown-menu"
                  >
                    <svg class="dots" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M0 0h20v20H0V0z" fill="none" />
                      <path
                        d="M10 6c.82 0 1.5-.68 1.5-1.5S10.82 3 10 3s-1.5.67-1.5 1.5S9.18 6 10 6zm0 5.5c.82 0 1.5-.68 1.5-1.5s-.68-1.5-1.5-1.5-1.5.68-1.5 1.5.68 1.5 1.5 1.5zm0 5.5c.82 0 1.5-.67 1.5-1.5 0-.82-.68-1.5-1.5-1.5s-1.5.68-1.5 1.5c0 .83.68 1.5 1.5 1.5z"
                      />
                    </svg>
                  </button>`;

    li.querySelector(".fold-btn").ondblclick = () => {
      location.href = `/drive/my-drive/folder/${folder._id}`;
    };
    return li;
  };

  async function loadHomeData() {
    try {
      const res = await fetch("/drive/api/home", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load home data");

      const data = await res.json();

      suggFolderList.innerHTML = "";
      if (data.suggFolderList && Array.isArray(data.suggFolderList)) {
        data.suggFolderList.forEach((folder) => {
          const li = createSuggFolderItem(folder);
          suggFolderList.appendChild(li);
        });
      }

      suggFileList.innerHTML = "";
      if (data.suggFileList && Array.isArray(data.suggFileList)) {
        data.suggFileList.forEach((file) => {
          const context = currentView;
          suggFileList.appendChild(renderFileItem(file, context));
        });
      }

      if (!data.suggFolderList || data.suggFolderList.length === 0) {
        suggFolderList.innerHTML = `<li style="padding: 20px; color: #666;">No sugg folders</li>`;
      }
      if (!data.suggFileList || data.suggFileList.length === 0) {
        suggFileList.innerHTML = `<li style="padding: 20px; color: #666;">No recent activity</li>`;
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    }
  }
  loadHomeData();
});

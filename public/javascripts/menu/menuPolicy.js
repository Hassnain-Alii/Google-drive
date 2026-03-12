const menuPolicy = {
  open: {
    single: true,
    multi: false,
    showWhenMulti: false,
  },
  download: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  rename: {
    single: true,
    multi: false,
    showWhenMulti: false,
  },
  copy: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  star: {
    single: true,
    multi: true,
    showWhenMulti: true,
    bulkBehavior: "toggle",
  },
  share: {
    single: true,
    multi: false,
    showWhenMulti: false,
  },
  move: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  organize: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  info: {
    single: true,
    multi: false,
    showWhenMulti: false,
  },
  trash: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  restore: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
  deleteForever: {
    single: true,
    multi: true,
    showWhenMulti: true,
  },
};

function computeMenuState(selectedFiles) {
  const count = selectedFiles.length;
  const state = {};

  Object.entries(menuPolicy).forEach(([action, policy]) => {
    if (count === 0) {
      state[action] = {
        visible: false,
        disabled: true,
      };
      return;
    }

    if (count === 1) {
      state[action] = {
        visible: policy.single === true,
        disabled: false,
      };
      return;
    }

    if (!policy.showWhenMulti) {
      state[action] = {
        visible: false,
        disabled: true,
      };
    } else {
      state[action] = {
        visible: true,
        disabled: !policy.multi,
      };
    }
  });
  return state;
}
function getStarState(selectedFiles) {
  if (selectedFiles.length === 0) return "none";
  const starredCount = selectedFiles.filter((idOrFile) => {
    const fileId = typeof idOrFile === "string" ? idOrFile : idOrFile.fileId;
    const element = document.querySelector(`[data-file-id="${fileId}"]`);
    return element && element.dataset.starred === "true";
  });

  if (starredCount.length === 0) return "none";
  if (starredCount.length === selectedFiles.length) return "all";
  if (starredCount.length > 0 && starredCount.length < selectedFiles.length)
    return "some";
}
window.menuPolicy = { computeMenuState, getStarState };

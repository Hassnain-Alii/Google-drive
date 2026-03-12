const SelectionStore = (() => {
  const selectedFiles = new Set();
  let anchorFileId = null;
  const listeners = new Set();

  function emit() {
    listeners.forEach((fn) => fn(Array.from(selectedFiles)));
  }

  function getAll() {
    return Array.from(selectedFiles);
  }

  function select(id) {
    selectedFiles.add(id);
    anchorFileId = id;
    emit();
  }

  function clear() {
    selectedFiles.clear();
    anchorFileId = null;
    emit();
  }

  function replace(ids, preserveAnchor = false) {
    selectedFiles.clear();
    ids.forEach((id) => selectedFiles.add(id));
    if (!preserveAnchor) {
      anchorFileId = ids[ids.length - 1] || null;
    }
    emit();
  }

  function getAnchor() {
    return anchorFileId;
  }

  function toggle(id) {
    if (selectedFiles.has(id)) {
      selectedFiles.delete(id);
      if (anchorFileId === id) anchorFileId = null;
    } else {
      selectedFiles.add(id);
      anchorFileId = id;
    }
    emit();
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    getAll,
    replace,
    select,
    clear,
    toggle,
    getAnchor,
    subscribe,
  };
})();

window.SelectionStore = SelectionStore;

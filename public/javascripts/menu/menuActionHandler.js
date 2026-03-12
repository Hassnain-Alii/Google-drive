const menuState = {
  currentFile: null,
  lastTrigger: null,
  currentPopperInstance: null,
  currentView: "default",
};

function detectCurrentView() {
  const path = window.location.pathname;
  if (path.includes("/starred")) return "starred";
  if (path.includes("/bin")) return "bin";
  return "default";
}

function setCurrentFile(file) {
  menuState.currentFile = file;
  menuState.currentView = detectCurrentView();
}
function clearCurrentFile() {
  menuState.currentFile = null;
  menuState.lastTrigger = null;
}

window.menuActionHandler = {
  menuState,
  detectCurrentView,
  setCurrentFile,
  clearCurrentFile,
};

document.addEventListener("DOMContentLoaded", function () {
  // Use querySelector for class selectors (with dot)
  const trigger = document.querySelector(".custom-date-range");
  const panel = document.querySelector(".custom-date-panel");
  const afterDate = document.querySelector(".after");

  if (trigger && panel && afterDate) {
    // Add null check
    trigger.addEventListener("click", () => {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) {
        afterDate.focus();
      }
    });
  }
});

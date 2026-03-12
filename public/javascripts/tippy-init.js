document.addEventListener("DOMContentLoaded", () =>
  tippy("[data-tooltip]", {
    content: (el) => el.getAttribute("data-tooltip"),
    placement: "bottom",
    animation: "scale",
    arrow: false,
    theme: "translucent",
    duration: 0,
    delay: 500,
  })
);

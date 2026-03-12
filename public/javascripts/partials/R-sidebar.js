document.addEventListener("DOMContentLoaded", () => {
  const rSdbChevronBtn = document.querySelector(".r-sdb-chevron-btn");
  const rSdb = document.querySelector(".r-sidebar");
  rSdbChevronBtn.addEventListener("click", (e) => {
    rSdbChevronBtn.classList.toggle("active");
  });
});

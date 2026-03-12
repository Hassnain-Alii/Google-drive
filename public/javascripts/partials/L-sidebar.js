document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".l-sdb-li-item-a");

  function setActiveItem(clickedLink) {
    // Remove active class from all links
    document
      .querySelectorAll(".l-sdb-li-item, .l-sdb-sub-item")
      .forEach((li) => {
        li.classList.remove("active");
      });

    // Add active class to clicked link and its parent <li>
    const parentLi = clickedLink.closest(".l-sdb-li-item, .l-sdb-sub-item");
    if (parentLi) parentLi.classList.add("active");
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // e.preventDefault(); //  Stop the browser from following href="/"
      setActiveItem(link);
    });
  });
});

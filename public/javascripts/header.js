document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Sidebar Toggle
    const toggleBtn = document.getElementById("mobile-sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("show");
        document.body.classList.toggle("sidebar-open");
      });
  
      document.addEventListener("click", (e) => {
        if (document.body.classList.contains("sidebar-open")) {
          if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            sidebar.classList.remove("show");
            document.body.classList.remove("sidebar-open");
          }
        }
      });
    }

    // 2. Gemini Button Handler
    const geminiBtn = document.getElementById("gemini-btn");
    if (geminiBtn) {
        geminiBtn.addEventListener("click", () => {
            window.open('https://gemini.google.com', '_blank');
        });
    }
  });

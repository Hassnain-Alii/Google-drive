document.addEventListener("DOMContentLoaded", () => {
  const profileImgInput = document.getElementById("profileImgInput");
  const profilePreview = document.getElementById("settings-profile-preview");
  const settingsForm = document.getElementById("settings-form");
  const changePictureBtn = document.getElementById("changePictureBtn");
  const changePictureOverlay = document.getElementById("changePictureOverlay");

  // Secure Change Picture trigger
  if (changePictureBtn && changePictureOverlay) {
    changePictureBtn.addEventListener("click", () => {
      profileImgInput.click();
    });
    changePictureOverlay.addEventListener("click", () => {
      profileImgInput.click();
    });
  }

  // Image preview logic
  profileImgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profilePreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Sidebar navigation logic (dummy for now)
  const navLinks = document.querySelectorAll(".settings-sidebar nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Form submission feedback (optional, since it's a standard POST)
  /*
    settingsForm.addEventListener('submit', async (e) => {
        // You could add AJAX here if you wanted a smoother experience
    });
    */

  // Password visibility toggle logic
  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const passwordInput = document.getElementById(targetId);
      const icon = btn.querySelector(".eye-icon");

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Change eye to eye-off (add a slash line)
        icon.innerHTML =
          '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      } else {
        passwordInput.type = "password";
        // Change back to regular eye
        icon.innerHTML =
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
      }
    });
  });
});

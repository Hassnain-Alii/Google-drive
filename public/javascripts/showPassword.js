const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const input = document.querySelectorAll(".input");
const inputLabel = document.querySelectorAll(".input-label");
const showPasswordCheckbox = document.getElementById("show-password");
if ((passwordInput || confirmPasswordInput) && showPasswordCheckbox) {
  showPasswordCheckbox.addEventListener("change", function () {
    if (this.checked) {
      passwordInput.type = "text";
      confirmPasswordInput.type = "text";
    } else {
      passwordInput.type = "password";
      confirmPasswordInput.type = "password";
    }
  });
}

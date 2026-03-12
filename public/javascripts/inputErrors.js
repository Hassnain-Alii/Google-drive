document.addEventListener("invalid", (e) => e.preventDefault(), true);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form").forEach((form) => {
    const nextBtn = form.querySelector(".next-btn,button[type='submit']");
    if (!nextBtn) return;

    const validateForm = (e) => {
      e.preventDefault();
      e.stopPropagation();

      let firstBad = null;
      form.querySelectorAll("select[required][data-for]").forEach((sel) => {
        const row = sel.closest(
          ".signin-form-input, .login-form-input, .input-field"
        );
        const ok = sel.value !== "";
        form
          .querySelectorAll(`.input-error[data-for="${sel.id}"]`)
          .forEach((m) => (m.style.display = "none"));

        if (!ok) {
          form
            .querySelector(`.input-error[data-for="${sel.id}"]`)
            ?.style.setProperty("display", "flex");
          row?.classList.add("error");
          if (!firstBad) firstBad = sel;
        } else {
          row?.classList.remove("error");
        }
      });

      form.querySelectorAll("input[pattern][required]").forEach((input) => {
        const row = input.closest(
          ".input-field, .signin-form-input, .login-form-input"
        );

        const msgs = row?.parentElement?.querySelectorAll(".input-error") ?? [];
        const ok = input.checkValidity();

        msgs.forEach((msg) => {
          msg.style.display = "none";
        });
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        if (passwordInput && confirmPasswordInput) {
          if (input === passwordInput) {
            if (input.value !== confirmPasswordInput.value) {
              row.parentElement
                .querySelectorAll(".err-confirm")
                ?.forEach((msg) => (msg.style.display = "flex"));
              ok = false;
            } else {
              row.parentElement
                .querySelectorAll(".err-confirm")
                ?.forEach((msg) => (msg.style.display = "none"));
            }
          }
        }
        if (!ok) {
          const value = input.value;
          if (value === "")
            row.parentElement
              .querySelectorAll(".err-valid")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-valid")
              ?.forEach((msg) => (msg.style.display = "none"));
          if (!/[A-Z]/.test(value))
            row.parentElement
              .querySelectorAll(".err-upper")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-upper")
              ?.forEach((msg) => (msg.style.display = "none"));
          if (!/[a-z]/.test(value))
            row.parentElement
              .querySelectorAll(".err-lower")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-lower")
              ?.forEach((msg) => (msg.style.display = "none"));
          if (!/[0-9]/.test(value))
            row.parentElement
              .querySelectorAll(".err-digit")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-digit")
              ?.forEach((msg) => (msg.style.display = "none"));
          if (value.length < 8)
            row.parentElement
              .querySelectorAll(".err-short")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-short")
              ?.forEach((msg) => (msg.style.display = "none"));

          if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value))
            row.parentElement
              .querySelectorAll(".err-special")
              ?.forEach((msg) => (msg.style.display = "flex"));
          else
            row.parentElement
              .querySelectorAll(".err-special")
              ?.forEach((msg) => (msg.style.display = "none"));
          row?.classList.add("error");
          if (!firstBad) firstBad = input;
        } else {
          row?.classList.remove("error");
        }
      });

      const ok = !firstBad;
      if (!ok && firstBad) {
        firstBad.focus();
      } else {
        // If all client-side validation passes, dispatch a custom event
        const event = new CustomEvent('clientValidationPassed', { bubbles: true });
        form.dispatchEvent(event);
      }
      return ok;
    };
    nextBtn.addEventListener("click", validateForm);
    form.addEventListener("submit", validateForm);
  });
});

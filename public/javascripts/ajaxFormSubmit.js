/* ajaxServerValidate.js  – server-side validation + inline display */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("form[js-ajax]").forEach((form) => {
    const clearErrors = () => {
      form
        .querySelectorAll(".signin-form-input.error")
        .forEach((el) => el.classList.remove("error"));

      form
        .querySelectorAll(".login-form-input.error")
        .forEach((el) => el.classList.remove("error"));
    };
    const safeJson = (res) =>
      res.json().catch(() => ({ error: res.statusText || "Server error" }));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(); // Clear errors on new submission
      const body = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await safeJson(res);

        if (!res.ok) {
          // 400, 401, etc.
          console.log("status", res.status, "errors", data.errors);
          /* 1.  hide old messages & red borders  */
          form
            .querySelectorAll(".input-error[data-for]")
            .forEach((sp) => (sp.style.display = "none"));
          form
            .querySelectorAll(
              ".signin-form-input, login-form-input, .input-field"
            )
            .forEach((r) => r.classList.remove("error"));
          const errors = data.errors || {
            generic: data.error || res.statusText,
          };

          /* 2.  show new message + colour row  */
          if (errors.generic) {
            // 429, 500, no field map
            alert(errors.generic); // simple pop-up
          } else {
            Object.entries(errors).forEach(([field, message]) => {
              const span = form.querySelector(
                `.input-error[data-for="${field}"]`
              );
              const inputElement = form.querySelector(`[name="${field}"]`);
              const row = form
                .querySelector(`[name="${field}"]`)
                ?.closest(".signin-form-input, login-form-input, .input-field");
              console.log(span);
              console.log(row);
              if (span) {
                span.querySelector(".msg-text").textContent = message;
                span.style.display = "flex";
              }
              console.log(row);

              if (row) row.classList.add("error"); // ← turns row red
            });

            /* 3.  focus first bad field  */
            const firstBad = Object.keys(errors)[0];
            if (firstBad) form[firstBad]?.focus();
          }
          /* your colour + message code here */
          return;
        }
        window.location.href = data.redirect;
      } catch (err) {
        console.error(err);
        alert("Network error – please try again");
      }
    });
  });
});

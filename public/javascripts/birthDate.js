// Custom dropdown functionality
document.addEventListener("DOMContentLoaded", function () {
  // Month select handling
  const monthSelect = document.getElementById("birth-month");
  const monthLabel = monthSelect.parentElement.querySelector(
    ".login-form-input-label"
  );

  // Handle month select change
  monthSelect.addEventListener("change", function () {
    if (this.value) {
      monthLabel.classList.add("active");
    } else {
      monthLabel.classList.remove("active");
    }

    // Update day max based on selected month and year
    updateDayLimit();
  });

  // Handle month select focus
  monthSelect.addEventListener("focus", function () {
    monthLabel.classList.add("active");
  });

  // Handle month select blur
  monthSelect.addEventListener("blur", function () {
    if (!this.value) {
      monthLabel.classList.remove("active");
    }
  });

  // Set initial state if month has value
  if (monthSelect.value) {
    monthLabel.classList.add("active");
  }

  // Gender select handling
  const genderSelect = document.getElementById("gender");
  const genderLabel = genderSelect.parentElement.querySelector(
    ".login-form-input-label"
  );

  // Handle gender select change
  genderSelect.addEventListener("change", function () {
    if (this.value) {
      genderLabel.classList.add("active");
    } else {
      genderLabel.classList.remove("active");
    }
  });

  // Handle gender select focus
  genderSelect.addEventListener("focus", function () {
    genderLabel.classList.add("active");
  });

  // Handle gender select blur
  genderSelect.addEventListener("blur", function () {
    if (!this.value) {
      genderLabel.classList.remove("active");
    }
  });

  // Set initial state if gender has value
  if (genderSelect.value) {
    genderLabel.classList.add("active");
  }

  // Handle day and year inputs
  const dayInput = document.getElementById("birth-day");
  const yearInput = document.getElementById("birth-year");
  const dayLabel = dayInput.nextElementSibling;
  const yearLabel = yearInput.nextElementSibling;

  // Day input events
  dayInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^\d]/g, "");
    if (parseInt(this.value) < 1) this.value = 1;
    if (parseInt(this.value) > 31) this.value = 31;

    if (this.value.length > 0) {
      dayLabel.classList.add("active");
    } else {
      dayLabel.classList.remove("active");
    }
  });

  dayInput.addEventListener("focus", function () {
    dayLabel.classList.add("active");
  });

  dayInput.addEventListener("blur", function () {
    if (this.value.length === 0) {
      dayLabel.classList.remove("active");
    }
  });

  // Year input events
  yearInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^\d]/g, "");
    const currentYear = new Date().getFullYear();
    if (parseInt(this.value) < 1900) this.value = 1900;
    if (parseInt(this.value) > currentYear) this.value = currentYear;

    if (this.value.length > 0) {
      yearLabel.classList.add("active");
    } else {
      yearLabel.classList.remove("active");
    }

    // Update day max based on selected month and year
    updateDayLimit();
  });

  yearInput.addEventListener("focus", function () {
    yearLabel.classList.add("active");
  });

  yearInput.addEventListener("blur", function () {
    if (this.value.length === 0) {
      yearLabel.classList.remove("active");
    }
  });
});

// Update maximum days based on selected month and year
function updateDayLimit() {
  const monthSelect = document.getElementById("birth-month");
  const dayInput = document.getElementById("birth-day");
  const yearInput = document.getElementById("birth-year");

  if (monthSelect && dayInput && yearInput) {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);

    if (month && year) {
      const lastDay = new Date(year, month, 0).getDate();
      dayInput.max = lastDay;

      // Adjust day if it exceeds the new maximum
      if (parseInt(dayInput.value) > lastDay) {
        dayInput.value = lastDay;
      }
    }
  }
}

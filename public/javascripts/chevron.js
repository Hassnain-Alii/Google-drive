document.addEventListener("click", function (e) {
  const btn = e.target.closest(".chevron-btn");
  if (!btn || !btn.dataset.toggleClass) return;

  e.preventDefault();

  /* arrow towards left
   <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /> */
  /*Fill arrow toward left
   <path d="M12 5l-5 5 5 5z" /> */
  /* arrow towards right
    <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />  */
  /* Fill arrow towards right
   <path d="M8 5l5 5-5 5" />  */
  /* arrow towards up
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />  */
  /* Fill arrow towards up
     <path d="M5 12l5-5 5 5z"/> */
  /* arrow towards  down
     <path d="M7.41 8.59 12 13.17 16.59 8.59 18 10l-6 6-6-6z" />  */
  /* Fill arrow towards down
     <path d="M5 8l5 5 5-5z" /> */

  //if target don't have none

  const chevronRToU = btn.querySelector(".chevron-right-up");
  const chevronRToD = btn.querySelector(".chevron-right-down");
  const chevronRToL = btn.querySelector(".chevron-right-left");
  const chevronLToU = btn.querySelector(".chevron-left-up");
  const chevronLToD = btn.querySelector(".chevron-left-down");
  const chevronLToR = btn.querySelector(".chevron-left-right");
  const chevronUToR = btn.querySelector(".chevron-up-right");
  const chevronUToL = btn.querySelector(".chevron-up-left");
  const chevronUToD = btn.querySelector(".chevron-up-down");
  const chevronDToR = btn.querySelector(".chevron-down-right");
  const chevronDToL = btn.querySelector(".chevron-down-left");
  const chevronDToU = btn.querySelector(".chevron-down-up");

  //if target have none
  const chevronRToU0 = btn.querySelector(".chevron-right-up-none");
  const chevronRToD0 = btn.querySelector(".chevron-right-down-none");
  const chevronRToL0 = btn.querySelector(".chevron-right-left-none");
  const chevronLToU0 = btn.querySelector(".chevron-left-up-none");
  const chevronLToD0 = btn.querySelector(".chevron-left-down-none");
  const chevronLToR0 = btn.querySelector(".chevron-left-right-none");
  const chevronUToR0 = btn.querySelector(".chevron-up-right-none");
  const chevronUToL0 = btn.querySelector(".chevron-up-left-none");
  const chevronUToD0 = btn.querySelector(".chevron-up-down-none");
  const chevronDToR0 = btn.querySelector(".chevron-down-right-none");
  const chevronDToL0 = btn.querySelector(".chevron-down-left-none");
  const chevronDToU0 = btn.querySelector(".chevron-down-up-none");

  //if target have none
  const targets = document.querySelector("." + btn.dataset.toggleClass.trim());
  if (chevronRToU0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToU0.style.transform = willShow ? "rotate(-90deg)" : "rotate(0deg)";
  } else if (chevronRToD0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToD0.style.transform = willShow ? "rotate(90deg)" : "rotate(0deg)";
  } else if (chevronRToL0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToL0.style.transform = willShow ? "rotate(180deg)" : "rotate(0deg)";
  } else if (chevronLToU0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToU0.style.transform = willShow ? "rotate(90deg)" : "rotate(0deg)";
  } else if (chevronLToD0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToD0.style.transform = willShow ? "rotate(-90deg)" : "rotate(0deg)";
  } else if (chevronLToR0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToR0.style.transform = willShow ? "rotate(180deg)" : "rotate(0deg)";
  } else if (chevronUToR0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronUToR0.style.transform = willShow ? "rotate(90deg)" : "rotate(0deg)";
  } else if (chevronUToL0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronUToL0.style.transform = willShow ? "rotate(-90deg)" : "rotate(0deg)";
  } else if (chevronUToD0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronUToD0.style.transform = willShow ? "rotate(180deg)" : "rotate(0deg)";
  } else if (chevronDToR0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToR0.style.transform = willShow ? "rotate(-90deg)" : "rotate(0deg)";
  } else if (chevronDToL0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToL0.style.transform = willShow ? "rotate(90deg)" : "rotate(0deg)";
  } else if (chevronDToU0 && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToU0.style.transform = willShow ? "rotate(180deg)" : "rotate(0deg)";
  }

  //If target don't have none
  if (chevronRToU && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToU.style.transform = willShow ? "rotate(0deg)" : "rotate(-90deg)";
  } else if (chevronRToD && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToD.style.transform = willShow ? "rotate(0deg)" : "rotate(90deg)";
  } else if (chevronRToL && targets) {
    const willShow = targets.classList.contains("none");
    chevronRToL.style.transform = willShow ? "rotate(0deg)" : "rotate(180deg)";
  } else if (chevronLToU && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToU.style.transform = willShow ? "rotate(0deg)" : "rotate(90deg)";
  } else if (chevronLToD && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToD.style.transform = willShow ? "rotate(0deg)" : "rotate(-90deg)";
  } else if (chevronLToR && targets) {
    const willShow = targets.classList.contains("none");
    chevronLToR.style.transform = willShow ? "rotate(0deg)" : "rotate(180deg)";
  } else if (chevronUToR && targets) {
    const willShow = targets.classList.contains("none");
    chevronUToR.style.transform = willShow ? "rotate(0deg)" : "rotate(90deg)";
  } else if (chevronUToL && targets) {
    const willShow = !targets.classList.contains("none");
    chevronUToL.style.transform = willShow ? "rotate(0deg)" : "rotate(-90deg)";
  } else if (chevronUToD && targets) {
    const willShow = targets.classList.contains("none");
    chevronUToD.style.transform = willShow ? "rotate(0deg)" : "rotate(180deg)";
  } else if (chevronDToR && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToR.style.transform = willShow ? "rotate(0deg)" : "rotate(-90deg)";
  } else if (chevronDToL && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToL.style.transform = willShow ? "rotate(0deg)" : "rotate(90deg)";
  } else if (chevronDToU && targets) {
    const willShow = targets.classList.contains("none");
    chevronDToU.style.transform = willShow ? "rotate(0deg)" : "rotate(180deg)";
  }

  targets.classList.toggle("none");
});

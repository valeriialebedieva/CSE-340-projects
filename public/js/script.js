document.addEventListener("DOMContentLoaded", function () {
    const footerText = document.querySelector(".copyright");
    const year = new Date().getFullYear();
    if (footerText) {
        footerText.innerHTML = `&copy; ${year}, CSE 340 App`;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.querySelector("nav ul");

    navToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show-nav");
    });
});

const form = document.getElementById("updateForm");
form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button");
  updateBtn.removeAttribute("disabled");
});
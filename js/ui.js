"use strict";

(() => {
  let hideTimer = 0;
  let removeTimer = 0;

  function showToast(message, type = "success", duration = 3200) {
    let toast = document.querySelector("#amanin-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "amanin-toast";
      toast.className = "amanin-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.innerHTML = '<span class="toast-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></span><span class="toast-message"></span><span class="toast-progress" aria-hidden="true"></span>';
      document.body.append(toast);
    }

    window.clearTimeout(hideTimer);
    window.clearTimeout(removeTimer);
    toast.dataset.type = type;
    toast.querySelector(".toast-message").textContent = message;
    toast.style.setProperty("--toast-duration", `${duration}ms`);
    toast.classList.remove("is-visible", "is-leaving");
    const progress = toast.querySelector(".toast-progress");
    progress.classList.remove("is-running");
    void toast.offsetWidth;
    progress.classList.add("is-running");
    toast.classList.add("is-visible");
    hideTimer = window.setTimeout(() => {
      toast.classList.add("is-leaving");
      toast.classList.remove("is-visible");
      removeTimer = window.setTimeout(() => {
        toast.remove();
      }, 260);
    }, duration);
  }

  window.AmaninToast = Object.freeze({ show: showToast });

  for (const toggle of document.querySelectorAll("#theme-toggle")) {
    toggle.addEventListener("change", () => {
      showToast(toggle.checked ? "Mode gelap diaktifkan" : "Mode terang diaktifkan", "info", 1400);
    });
  }
})();

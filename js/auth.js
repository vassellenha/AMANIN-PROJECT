"use strict";

(() => {
  const PROFILE_KEY = "amanin_profile";
  const SESSION_KEY = "amanin_session";
  const page = window.location.pathname.split("/").pop();
  const loginForm = document.querySelector("#login-form");
  const guestButton = document.querySelector("#guest-button");
  const profileForm = document.querySelector("#profile-form");
  const statusElements = [...document.querySelectorAll(".account-status")];

  function showStatus(message, state = "error") {
    for (const element of statusElements) {
      element.textContent = message;
      element.dataset.state = state;
    }
  }

  function readStored(key) {
    let value;
    try {
      value = localStorage.getItem(key);
    } catch (error) {
      console.error(`Data ${key} tidak dapat diakses:`, error);
      showStatus("Browser tidak mengizinkan akses penyimpanan lokal. Periksa pengaturan privasi browser.");
      return null;
    }
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Data ${key} tidak dapat dibaca:`, error);
      try {
        localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Data ${key} yang rusak tidak dapat dihapus:`, removeError);
      }
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Data ${key} gagal disimpan:`, error);
      showStatus("Data tidak dapat disimpan di browser ini. Periksa pengaturan penyimpanan browser.", "error");
      return false;
    }
  }

  function getSession() {
    const session = readStored(SESSION_KEY);
    return session && (session.mode === "guest" || session.mode === "user") ? session : null;
  }

  function getProfile() {
    const profile = readStored(PROFILE_KEY);
    return profile && typeof profile.name === "string" && typeof profile.email === "string"
      ? profile
      : { name: "", email: "" };
  }

  function getDestination() {
    const requested = new URLSearchParams(window.location.search).get("next");
    if (requested === "dashboard.html") return requested;
    if (/^scan\.html\?mode=(qr|chat|link)$/.test(requested || "")) return requested;
    return "dashboard.html";
  }

  function startSession(mode) {
    return writeStored(SESSION_KEY, { mode, startedAt: new Date().toISOString() });
  }

  if (loginForm) {
    const profile = getProfile();
    loginForm.elements.name.value = profile.name;
    loginForm.elements.email.value = profile.email;

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const nextProfile = {
        name: loginForm.elements.name.value.trim(),
        email: loginForm.elements.email.value.trim(),
      };
      if (!nextProfile.name || !nextProfile.email) {
        showStatus("Isi nama dan email dengan benar untuk melanjutkan.");
        return;
      }
      if (!writeStored(PROFILE_KEY, nextProfile) || !startSession("user")) return;
      window.location.assign(getDestination());
    });

    guestButton.addEventListener("click", () => {
      if (!startSession("guest")) return;
      window.location.assign(getDestination());
    });
  }

  if (page === "dashboard.html") {
    const session = getSession();
    if (!session) {
      window.location.replace("login.html?next=dashboard.html");
      return;
    }

    const profile = getProfile();
    const userName = session.mode === "user" && profile.name ? profile.name : "Tamu";
    const welcome = document.querySelector("#welcome-title");
    if (welcome) welcome.textContent = `Halo, ${userName}`;

    const dialog = document.querySelector("#profile-dialog");
    const profileName = document.querySelector("#profile-name");
    const profileEmail = document.querySelector("#profile-email");
    const profileMode = document.querySelector("#profile-mode");
    const signIn = document.querySelector("#profile-signin");
    const openButton = document.querySelector("#profile-open");
    const closeButton = document.querySelector("#profile-close");
    const logoutButton = document.querySelector("#logout-button");

    function openProfile() {
      if (!dialog.open) dialog.showModal();
      if (window.location.hash !== "#profil") history.replaceState(null, "", "#profil");
    }

    function closeProfile() {
      dialog.close();
      if (window.location.hash === "#profil") history.replaceState(null, "", window.location.pathname);
    }

    if (profileName && profileEmail) {
      profileName.value = session.mode === "user" ? profile.name : "";
      profileEmail.value = session.mode === "user" ? profile.email : "";
      profileMode.textContent = session.mode === "guest"
        ? "Kamu sedang menggunakan AMANIN sebagai tamu. Isi nama dan email untuk menyimpan profil lokal."
        : "Perbarui informasi profil yang tersimpan di perangkat ini.";
      signIn.classList.toggle("is-hidden", session.mode !== "guest");
    }

    openButton?.addEventListener("click", openProfile);
    document.querySelector("#profil")?.addEventListener("click", (event) => {
      event.preventDefault();
      openProfile();
    });
    closeButton?.addEventListener("click", closeProfile);
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) closeProfile();
    });
    if (window.location.hash === "#profil") openProfile();

    profileForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!profileForm.reportValidity()) return;
      const nextProfile = {
        name: profileName.value.trim(),
        email: profileEmail.value.trim(),
      };
      if (!nextProfile.name || !nextProfile.email) {
        showStatus("Isi nama dan email dengan benar untuk menyimpan profil.");
        return;
      }
      if (!writeStored(PROFILE_KEY, nextProfile) || !startSession("user")) return;
      if (welcome) welcome.textContent = `Halo, ${nextProfile.name}`;
      showStatus("Profil berhasil diperbarui di browser ini.", "success");
      profileMode.textContent = "Profil tersimpan di browser ini dan belum tersinkron ke layanan akun/server.";
      signIn.classList.add("is-hidden");
    });

    logoutButton?.addEventListener("click", () => {
      try {
        localStorage.removeItem(SESSION_KEY);
        window.location.assign("index.html");
      } catch (error) {
        console.error("Sesi AMANIN gagal dihapus:", error);
        showStatus("Tidak dapat menghapus sesi. Periksa pengaturan penyimpanan browser.");
      }
    });
  }

  if (page === "scan.html" && !getSession()) {
    if (!startSession("guest")) return;
  }
})();

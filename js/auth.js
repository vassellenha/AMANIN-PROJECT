"use strict";

(() => {
  const PROFILE_KEY = "amanin_profile";
  const SESSION_KEY = "amanin_session";
  const isDashboardPage = Boolean(document.querySelector("#profile-dialog"));
  const isScanPage = Boolean(document.querySelector(".scanner-app"));
  const loginForm = document.querySelector("#login-form");
  const guestButton = document.querySelector("#guest-button");
  const profileForm = document.querySelector("#profile-form");
  const defaultAvatar = "assets/avatar.svg";
  let selectedAvatar = "";
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
    if (!profile || typeof profile !== "object") return { username: "", email: "", avatar: "" };
    return {
      username: typeof profile.username === "string" ? profile.username : typeof profile.name === "string" ? profile.name : "",
      email: typeof profile.email === "string" ? profile.email : "",
      avatar: typeof profile.avatar === "string" && profile.avatar.startsWith("data:image/") ? profile.avatar : "",
    };
  }

  function makeAvatar(file) {
    if (!file || !file.type.startsWith("image/")) {
      return Promise.reject(new Error("Pilih file gambar untuk foto profil."));
    }
    if (file.size > 8 * 1024 * 1024) {
      return Promise.reject(new Error("Ukuran foto maksimal 8 MB."));
    }
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - side) / 2;
        const sourceY = (image.naturalHeight - side) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Foto tidak bisa diproses di browser ini."));
          return;
        }
        context.drawImage(image, sourceX, sourceY, side, side, 0, 0, 256, 256);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch (error) {
          reject(new Error(`Foto gagal diproses: ${error.message}`));
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Foto tidak dapat dibuka. Pilih gambar lain."));
      };
      image.src = objectUrl;
    });
  }

  function displayAvatar(avatar) {
    const src = avatar || defaultAvatar;
    const avatarImage = document.querySelector("#profile-avatar");
    const previewImage = document.querySelector("#profile-avatar-preview");
    if (avatarImage) avatarImage.src = src;
    if (previewImage) previewImage.src = src;
  }

  function displayAvatarPreview(avatar) {
    const previewImage = document.querySelector("#profile-avatar-preview");
    if (previewImage) previewImage.src = avatar || defaultAvatar;
  }

  function setImageLabels(username) {
    const label = username ? `Foto profil ${username}` : "Foto profil";
    const avatarImage = document.querySelector("#profile-avatar");
    const previewImage = document.querySelector("#profile-avatar-preview");
    if (avatarImage) avatarImage.alt = label;
    if (previewImage) previewImage.alt = `Pratinjau ${label.toLowerCase()}`;
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
    loginForm.elements.username.value = profile.username;
    loginForm.elements.email.value = profile.email;

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const nextProfile = {
        username: loginForm.elements.username.value.trim(),
        email: loginForm.elements.email.value.trim(),
        avatar: profile.avatar,
      };
      if (!nextProfile.username || !nextProfile.email) {
        showStatus("Isi username dan email dengan benar untuk melanjutkan.");
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

  if (isDashboardPage) {
    const session = getSession();
    if (!session) {
      window.location.replace("login.html?next=dashboard.html");
      return;
    }

    const profile = getProfile();
    let activeProfile = session.mode === "user" ? profile : { username: "", email: "", avatar: "" };
    const userName = session.mode === "user" && profile.username ? profile.username : "Tamu";
    const welcome = document.querySelector("#welcome-title");
    if (welcome) welcome.textContent = `Halo, ${userName}`;
    displayAvatar(activeProfile.avatar);
    setImageLabels(userName === "Tamu" ? "" : userName);

    const dialog = document.querySelector("#profile-dialog");
    const profileUsername = document.querySelector("#profile-username");
    const profileEmail = document.querySelector("#profile-email");
    const avatarInput = document.querySelector("#profile-avatar-file");
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
      if (window.location.hash === "#profil") history.replaceState(null, "", window.location.pathname);
      if (!dialog.open || dialog.classList.contains("is-closing")) return;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        dialog.close();
        return;
      }
      dialog.classList.add("is-closing");
      dialog.addEventListener("animationend", function finish() {
        dialog.removeEventListener("animationend", finish);
        dialog.classList.remove("is-closing");
        dialog.close();
      });
    }

    selectedAvatar = activeProfile.avatar;
    if (profileUsername && profileEmail) {
      profileUsername.value = activeProfile.username;
      profileEmail.value = activeProfile.email;
      profileMode.textContent = session.mode === "guest"
        ? "Atur username dan foto profil untuk personalisasi AMANIN."
        : "Ganti username dan foto profilmu.";
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

    avatarInput?.addEventListener("change", async () => {
      const file = avatarInput.files?.[0];
      if (!file) return;
      showStatus("");
      try {
        selectedAvatar = await makeAvatar(file);
        displayAvatarPreview(selectedAvatar);
        showStatus("");
        window.AmaninToast?.show("Foto profil siap digunakan");
      } catch (error) {
        showStatus(error.message);
      }
    });

    document.querySelector("#profile-avatar-reset")?.addEventListener("click", () => {
      selectedAvatar = "";
      displayAvatarPreview("");
      showStatus("");
      window.AmaninToast?.show("Foto profil akan dihapus setelah disimpan", "info");
    });

    function discardProfileEdits() {
      if (profileUsername) profileUsername.value = activeProfile.username;
      if (profileEmail) profileEmail.value = activeProfile.email;
      selectedAvatar = activeProfile.avatar;
      displayAvatarPreview(activeProfile.avatar);
      if (avatarInput) avatarInput.value = "";
      showStatus("");
    }

    dialog?.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeProfile();
    });
    dialog?.addEventListener("close", discardProfileEdits);

    profileForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!profileForm.reportValidity()) return;
      const nextProfile = {
        username: profileUsername.value.trim().replace(/^@+/, ""),
        email: profileEmail.value.trim(),
        avatar: selectedAvatar,
      };
      if (!nextProfile.username) {
        showStatus("Username tidak boleh kosong.");
        return;
      }
      if (!/^[\p{L}\p{N}._-]{2,32}$/u.test(nextProfile.username)) {
        showStatus("Username harus 2–32 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.");
        return;
      }
      if (nextProfile.email && !profileEmail.validity.valid) {
        showStatus("Format email belum benar.");
        return;
      }
      if (!writeStored(PROFILE_KEY, nextProfile) || !startSession("user")) return;
      activeProfile = nextProfile;
      displayAvatar(nextProfile.avatar);
      if (welcome) welcome.textContent = `Halo, ${nextProfile.username}`;
      setImageLabels(nextProfile.username);
      profileMode.textContent = "Ganti username dan foto profilmu.";
      signIn.classList.add("is-hidden");
      closeProfile();
      window.AmaninToast?.show("Profil berhasil diperbarui");
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

  if (isScanPage) {
    const session = getSession();
    if (!session && !startSession("guest")) return;
    const profileImage = document.querySelector(".profile img");
    const profile = getProfile();
    if (profileImage && session?.mode === "user" && profile.avatar) {
      profileImage.src = profile.avatar;
      profileImage.alt = profile.username ? `Foto profil ${profile.username}` : "Foto profil";
    }
  }
})();

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

  const t = (key) => window.AmaninI18n?.t(key) ?? key;

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
      showStatus(t("auth.err.storageread"));
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
      showStatus(t("auth.err.storagewrite"), "error");
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
      return Promise.reject(new Error(t("auth.err.avatartype")));
    }
    if (file.size > 8 * 1024 * 1024) {
      return Promise.reject(new Error(t("auth.err.avatarsize")));
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
          reject(new Error(t("auth.err.avatarcanvas")));
          return;
        }
        context.drawImage(image, sourceX, sourceY, side, side, 0, 0, 256, 256);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } catch (error) {
          reject(new Error(`${t("auth.err.avatarencode")} ${error.message}`));
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(t("auth.err.avatardecode")));
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
    const label = username ? t("profile.alt.named").replace("{name}", username) : t("profile.alt.default");
    const avatarImage = document.querySelector("#profile-avatar");
    const previewImage = document.querySelector("#profile-avatar-preview");
    if (avatarImage) avatarImage.alt = label;
    if (previewImage) previewImage.alt = `${t("profile.alt.preview")}`;
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
        showStatus(t("auth.err.loginrequired"));
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
    const welcome = document.querySelector("#welcome-title");

    function renderWelcome() {
      const userName = activeProfile.username ? activeProfile.username : t("common.guest");
      if (welcome) welcome.textContent = `${t("common.greeting")}, ${userName}`;
      setImageLabels(activeProfile.username ? userName : "");
    }

    renderWelcome();
    displayAvatar(activeProfile.avatar);

    const dialog = document.querySelector("#profile-dialog");
    const profileUsername = document.querySelector("#profile-username");
    const profileEmail = document.querySelector("#profile-email");
    const avatarInput = document.querySelector("#profile-avatar-file");
    const profileMode = document.querySelector("#profile-mode");
    const signIn = document.querySelector("#profile-signin");
    const openButton = document.querySelector("#profile-open");
    const closeButton = document.querySelector("#profile-close");
    const logoutButton = document.querySelector("#logout-button");

    function renderProfileMode() {
      if (!profileMode) return;
      profileMode.textContent = session.mode === "guest" ? t("profile.desc.guest") : t("profile.desc.user");
    }

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
      renderProfileMode();
      signIn.classList.toggle("is-hidden", session.mode !== "guest");
    }

    document.addEventListener("amanin:langchange", () => {
      renderWelcome();
      renderProfileMode();
    });

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
        window.AmaninToast?.show(t("toast.avatarready"));
      } catch (error) {
        showStatus(error.message);
      }
    });

    document.querySelector("#profile-avatar-reset")?.addEventListener("click", () => {
      selectedAvatar = "";
      displayAvatarPreview("");
      showStatus("");
      window.AmaninToast?.show(t("toast.avatarremove"), "info");
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
        showStatus(t("auth.err.usernameempty"));
        return;
      }
      if (!/^[\p{L}\p{N}._-]{2,32}$/u.test(nextProfile.username)) {
        showStatus(t("auth.err.usernameformat"));
        return;
      }
      if (nextProfile.email && !profileEmail.validity.valid) {
        showStatus(t("auth.err.emailformat"));
        return;
      }
      if (!writeStored(PROFILE_KEY, nextProfile) || !startSession("user")) return;
      session.mode = "user";
      activeProfile = nextProfile;
      displayAvatar(nextProfile.avatar);
      renderWelcome();
      renderProfileMode();
      signIn.classList.add("is-hidden");
      closeProfile();
      window.AmaninToast?.show(t("toast.profileupdated"));
    });

    logoutButton?.addEventListener("click", () => {
      try {
        localStorage.removeItem(SESSION_KEY);
        window.location.assign("index.html");
      } catch (error) {
        console.error("Sesi AMANIN gagal dihapus:", error);
        showStatus(t("auth.err.sessionclear"));
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
      profileImage.alt = profile.username ? t("profile.alt.named").replace("{name}", profile.username) : t("profile.alt.default");
    }
  }

  function applyTopbarAuthState() {
    const loginLink = document.querySelector("#topbar-login");
    const profileLink = document.querySelector(".profile, #profile-open");
    if (!loginLink && !profileLink) return;
    const session = getSession();
    const isGuest = !session || session.mode === "guest";
    loginLink?.classList.toggle("is-hidden", !isGuest);
    profileLink?.classList.toggle("is-hidden", isGuest);
  }
  applyTopbarAuthState();
})();

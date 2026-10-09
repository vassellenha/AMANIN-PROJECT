"use strict";

window.AmaninHistory = (() => {
  const KEY = "amanin_history";
  const MAX_ENTRIES = 50;

  const TYPE_KEY = {
    qr: "history.type.qr",
    chat: "history.type.chat",
    screenshot: "history.type.screenshot",
    link: "history.type.link",
    rekening: "history.type.rekening",
    pembayaran: "history.type.pembayaran",
  };
  const t = (key) => window.AmaninI18n?.t(key) ?? key;
  const tf = (key, vars) => window.AmaninI18n?.tf(key, vars) ?? key;
  const TYPE_ICON = {
    qr: '<path d="M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M8 8h3v3H8zm5 0h3v3h-3zm-5 5h3v3H8zm6 1h2m-2 2h2"/>',
    chat: '<path d="M4 5h16v12H8l-4 3V5Z"/><path d="M8 9h8m-8 4h5"/>',
    screenshot: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="10" r="2"/><path d="m4 16 5-4 3 3 2-2 6 4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',
    rekening: '<path d="M3 6h18v13H3z"/><circle cx="10" cy="11" r="2.5"/><path d="M6 17c.8-2 2.2-3 4-3s3.2 1 4 3m3-6h2"/>',
    pembayaran: '<path d="M4 6h16v14H4z"/><path d="M4 9h16m-6 5h3"/>',
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.error("Riwayat tidak dapat dibaca:", error);
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
      return true;
    } catch (error) {
      console.error("Riwayat gagal disimpan:", error);
      return false;
    }
  }

  function add(entry) {
    const list = readAll();
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: TYPE_KEY[entry.type] ? entry.type : "chat",
      level: entry.level === "danger" || entry.level === "caution" ? entry.level : "safe",
      score: typeof entry.score === "number" ? entry.score : null,
      title: entry.title || "",
      source: entry.source || "",
      timestamp: new Date().toISOString(),
    };
    list.unshift(record);
    writeAll(list);
    return record;
  }

  function getAll() {
    return readAll();
  }

  function remove(id) {
    return writeAll(readAll().filter((item) => item.id !== id));
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch (error) {
      console.error("Riwayat gagal dihapus:", error);
      return false;
    }
  }

  function timeAgo(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minute = 60000, hour = 3600000, day = 86400000;
    const lang = window.AmaninI18n?.getLang?.() ?? "id";
    if (diffMs < minute) return t("common.justnow");
    if (diffMs < hour) return tf("common.minago", { n: Math.max(1, Math.floor(diffMs / minute)) });
    if (diffMs < day) return tf("common.hourago", { n: Math.floor(diffMs / hour) });
    if (diffMs < day * 7) return tf("common.dayago", { n: Math.floor(diffMs / day) });
    return new Date(isoString).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function levelMeta(level) {
    if (level === "danger") return { iconClass: "risk-icon", pillClass: "risk-pill", label: t("history.level.bahaya") };
    if (level === "caution") return { iconClass: "caution-icon", pillClass: "caution-pill", label: t("history.level.waspada") };
    return { iconClass: "safe-icon", pillClass: "safe-pill", label: t("history.level.aman") };
  }

  function renderCard(entry) {
    const meta = levelMeta(entry.level);
    const scoreText = typeof entry.score === "number" ? `${meta.label} ${entry.score}/100` : meta.label;
    const typeLabel = t(TYPE_KEY[entry.type] || "history.type.chat");
    const icon = TYPE_ICON[entry.type] || TYPE_ICON.chat;
    const href = entry.type === "qr" ? "scan.html?mode=qr" : `scan.html?mode=chat&context=${entry.type}`;
    const titleText = entry.source ? entry.source : entry.title;
    return `<a class="recent-card" href="${href}" data-history-id="${entry.id}">
      <span class="recent-icon ${meta.iconClass}"><svg viewBox="0 0 24 24">${icon}</svg></span>
      <span class="recent-copy"><strong>${escapeHtml(titleText)}</strong><small>${timeAgo(entry.timestamp)} <i></i> <em>${escapeHtml(typeLabel)}</em></small></span>
      <span class="${meta.pillClass}"><i></i> ${escapeHtml(scoreText)}</span>
    </a>`;
  }

  function renderList(container, entries, options = {}) {
    if (!container) return;
    const emptyMessage = options.emptyMessage || "Belum ada pemeriksaan.";
    if (!entries.length) {
      container.innerHTML = `<p class="history-empty">${escapeHtml(emptyMessage)}</p>`;
      return;
    }
    container.innerHTML = entries.map(renderCard).join("");
  }

  return Object.freeze({ add, getAll, remove, clear, timeAgo, renderCard, renderList, levelMeta });
})();

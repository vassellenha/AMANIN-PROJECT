"use strict";

const $ = (selector) => document.querySelector(selector);
const canvas = $("#processing-canvas");
const context = canvas.getContext("2d", { willReadFrequently: true });
const tabs = [...document.querySelectorAll(".scan-tab")];
const panels = { qr: $("#panel-qr"), chat: $("#panel-chat") };
const analysisLoading = $("#analysis-loading");
const analysisScreen = $("#analysis-screen");
const analysisLoadingMessage = $("#analysis-loading-message");
const riskGaugeCircumference = 2 * Math.PI * 49;
let analysisStartedAt = 0;
let analysisReturnFocus = null;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"]);
const maxFileSize = 12 * 1024 * 1024;
let cameraStream = null;
let cameraFrame = null;
let cameraBusy = false;
let lastFrameAt = 0;
let ocrWorkerPromise = null;
let tesseractScriptPromise = null;
let ocrBusy = false;
let qrBusy = false;
let selectedChatFile = null;
let selectedQrFile = null;
let barcodeDetector = null;

function setStatus(element, message, state = "") {
  element.textContent = message;
  if (state) element.dataset.state = state;
  else delete element.dataset.state;
}

function startAnalysis(message) {
  analysisStartedAt = performance.now();
  analysisReturnFocus = document.activeElement;
  analysisLoadingMessage.textContent = message;
  analysisScreen.classList.add("is-hidden");
  analysisLoading.classList.remove("is-hidden");
}

function closeAnalysisScreen() {
  analysisScreen.classList.add("is-hidden");
  analysisReturnFocus?.focus?.({ preventScroll: true });
}

$("#analysis-back").addEventListener("click", closeAnalysisScreen);
$("#analysis-done").addEventListener("click", closeAnalysisScreen);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !analysisScreen.classList.contains("is-hidden")) {
    closeAnalysisScreen();
  }
});

async function presentAnalysis({
  level = "safe",
  title,
  message,
  findings = [],
  source = "",
  sourceTitle = "Konten diperiksa",
  score = null,
  type = "chat",
}) {
  const remaining = Math.max(0, 1350 - (performance.now() - analysisStartedAt));
  if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));

  if (score !== null) {
    window.AmaninHistory?.add({ type, level, score, title, source });
  }

  const safeFindings = findings.length ? findings : ["Tidak ditemukan indikator spesifik dari pola yang diperiksa."];
  const summary = $("#risk-summary");
  summary.dataset.level = level;
  summary.toggleAttribute("data-unscored", score === null);
  $("#risk-score").textContent = score === null ? "—" : String(score);
  $("#risk-score-label").textContent = score === null ? "STATUS" : "SKOR RISIKO";
  $("#risk-gauge").setAttribute("aria-label", score === null ? title : `Skor indikasi risiko ${score} dari 100`);
  $("#risk-gauge-value").style.strokeDasharray = String(riskGaugeCircumference);
  $("#risk-gauge-value").style.strokeDashoffset = String(riskGaugeCircumference * (1 - (score ?? 0) / 100));
  $("#risk-level-pill").textContent = score === null
    ? "Konten belum terbaca"
    : level === "danger"
      ? "Risiko tinggi · waspada"
      : level === "caution"
        ? "Perlu diperiksa"
        : "Risiko rendah terdeteksi";
  $("#risk-result-title").textContent = title;
  $("#risk-result-message").textContent = score === null
    ? "Konten belum bisa diberi skor. Coba periksa dengan gambar atau teks yang lebih jelas."
    : level === "danger"
      ? "Ditemukan beberapa sinyal kuat yang perlu kamu tangani dengan hati-hati."
      : level === "caution"
        ? "Ada pola yang sebaiknya diverifikasi sebelum kamu bertindak."
        : "Tidak ditemukan pola risiko umum dalam pemeriksaan ini.";
  $("#analysis-explanation-text").textContent = message;
  $("#analysis-findings-title").textContent = `${safeFindings.length} indikator pemeriksaan`;
  $("#analysis-findings-count").textContent = level === "danger" ? "Perlu diwaspadai" : level === "caution" ? "Cek kembali" : "Pola umum";

  const sourceCard = $("#analysis-source-card");
  sourceCard.classList.toggle("is-hidden", !source);
  if (source) {
    $("#analysis-source-title").textContent = sourceTitle;
    $("#analysis-source-text").textContent = source.length > 360 ? `${source.slice(0, 360)}…` : source;
  }

  const findingsList = $("#analysis-findings");
  findingsList.replaceChildren();
  for (const finding of safeFindings) {
    const item = document.createElement("li");
    item.textContent = finding;
    findingsList.append(item);
  }

  $("#analysis-advice-title").textContent = level === "danger" ? "Jangan lanjutkan dulu" : "Langkah aman";
  $("#analysis-advice-text").textContent = level === "danger"
    ? "Jangan klik tautan, kirim uang, atau bagikan OTP/PIN. Hubungi pihak terkait lewat aplikasi atau nomor resmi."
    : level === "caution"
      ? "Pastikan identitas pengirim dan tujuan secara terpisah melalui kanal resmi sebelum membayar atau membagikan data."
      : "Tetap cek alamat situs dan identitas pengirim. Tidak ada pola yang terdeteksi bukan berarti pesan pasti aman.";

  analysisLoading.classList.add("is-hidden");
  analysisScreen.classList.remove("is-hidden");
  analysisScreen.scrollTop = 0;
  $("#analysis-back").focus({ preventScroll: true });
}

function hideAnalysisLoading() {
  analysisLoading.classList.add("is-hidden");
}

$("#qr-analyze").addEventListener("click", () => {
  if (selectedQrFile) scanQrFile(selectedQrFile);
});

function setMode(mode, updateUrl = true) {
  const nextMode = mode === "qr" ? "qr" : "chat";
  for (const tab of tabs) {
    const selected = tab.dataset.mode === nextMode;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  for (const [key, panel] of Object.entries(panels)) {
    panel.classList.toggle("is-hidden", key !== nextMode);
  }
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    url.hash = "";
    history.replaceState(null, "", url);
  }
  if (nextMode !== "qr") stopCamera();
}

function validateImage(file, statusElement) {
  if (!file) return false;
  if (!file.type.startsWith("image/") || !allowedTypes.has(file.type)) {
    setStatus(statusElement, "Format tidak didukung. Pilih gambar JPG, PNG, WebP, GIF, atau BMP.", "error");
    return false;
  }
  if (file.size > maxFileSize) {
    setStatus(statusElement, "Ukuran gambar maksimal 12 MB. Kompres gambar lalu coba lagi.", "error");
    return false;
  }
  return true;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Gambar tidak dapat dibuka. Coba pilih file gambar lain."));
    };
    image.src = objectUrl;
  });
}

function drawImageForScan(image) {
  const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function normalizeUrl(value) {
  const trimmed = value.trim().replace(/[),.;!?]+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return `https://${trimmed}`;
}

function getUrlFindings(urlValue) {
  const findings = [];
  let parsed;
  try {
    parsed = new URL(normalizeUrl(urlValue));
  } catch {
    return { level: "danger", findings: ["Format tautan tidak dikenali; jangan buka sebelum memverifikasi alamatnya."] };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:") findings.push("Tautan tidak menggunakan HTTPS.");
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) findings.push("Alamat tujuan berupa alamat IP, bukan nama situs biasa.");
  if (/^(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|shorturl\.at|rb\.gy)$/i.test(hostname)) findings.push("Tautan menggunakan layanan pemendek sehingga tujuan akhirnya tersembunyi.");
  if (hostname.startsWith("xn--") || hostname.split(".").some((part) => part.startsWith("xn--"))) findings.push("Nama domain memakai karakter internasional yang perlu diperiksa dengan saksama.");
  if (/(login|verify|verifikasi|hadiah|promo|claim|klaim|secure|akun|bank)/i.test(hostname)) findings.push("Nama domain mengandung kata yang sering dipakai untuk menyamar sebagai halaman akun atau promosi.");
  if (hostname.split(".").length > 4) findings.push("Subdomain tujuan cukup panjang dan sebaiknya diverifikasi.");
  const level = findings.length >= 2 ? "danger" : findings.length === 1 ? "caution" : "safe";
  return { level, findings };
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractScriptPromise) return tesseractScriptPromise;
  tesseractScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        tesseractScriptPromise = null;
        reject(new Error("Mesin pembaca teks tidak merespons. Muat ulang halaman lalu coba lagi."));
      }
    };
    script.onerror = () => {
      tesseractScriptPromise = null;
      reject(new Error("Mesin pembaca teks gagal dimuat. Periksa koneksi internet, lalu coba lagi."));
    };
    document.head.append(script);
  });
  return tesseractScriptPromise;
}

function extractUrls(text) {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>"']+|(?<![@\w.-])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|id|co|me|site|xyz|top|online|info|app|biz|live|link)(?:\/[^\s<>"']*)?/gi);
  return [...new Set((matches || []).map((entry) => entry.replace(/[),.;!?]+$/, "")))];
}

function analyzeText(text) {
  const lower = text.toLowerCase();
  const findings = [];
  const rules = [
    { pattern: /\b(otp|pin|kata sandi|password|kode verifikasi)\b/i, message: "Pesan meminta data rahasia seperti OTP, PIN, atau kata sandi.", severity: 3 },
    { pattern: /(?:\.apk\b|\bapk\b|\bunduh.{0,20}apk\b|\bfile apk\b|\baplikasi.{0,20}android\b)/i, message: "Pesan menyebut file APK atau pemasangan aplikasi dari luar toko resmi.", severity: 3 },
    { pattern: /\b(akun.{0,20}(diblokir|ditangguhkan|dinonaktifkan)|blokir.{0,20}akun|verifikasi.{0,20}akun)\b/i, message: "Ada tekanan untuk memulihkan atau memverifikasi akun.", severity: 2 },
    { pattern: /\b(hadiah|menang|undian|gratis|kuota gratis|klaim sekarang|voucher)\b/i, message: "Ada iming-iming hadiah, voucher, atau penawaran gratis.", severity: 1 },
    { pattern: /\b(segera|darurat|terakhir hari ini|dalam \d+ menit|akan hangus|jangan abaikan)\b/i, message: "Pesan menggunakan tekanan waktu atau bahasa mendesak.", severity: 1 },
    { pattern: /\b(transfer|biaya admin|bayar sekarang|rekening pribadi|qris)\b/i, message: "Pesan mengarahkan pembayaran atau transfer.", severity: 1 },
  ];
  let score = 0;
  for (const rule of rules) {
    if (rule.pattern.test(lower)) {
      findings.push(rule.message);
      score += rule.severity;
    }
  }
  const urls = extractUrls(text);
  for (const url of urls) {
    const assessment = getUrlFindings(url);
    if (assessment.level === "danger") score += 3;
    else if (assessment.level === "caution") score += 1;
    for (const finding of assessment.findings) findings.push(`${finding} (${url})`);
  }
  return {
    findings: [...new Set(findings)],
    urls,
    score,
    level: score >= 4 ? "danger" : score >= 1 ? "caution" : "safe",
  };
}

function levelFromScore(score) {
  return score >= 4 ? "danger" : score >= 1 ? "caution" : "safe";
}

const conversationInput = $("#chat-text");
const conversationCount = $("#chat-text-count");
const conversationAnalyzeButton = $("#chat-text-analyze");
const conversationResult = $("#chat-text-result");
const conversationStatus = $("#chat-text-status");

conversationInput.addEventListener("input", () => {
  const text = conversationInput.value.slice(0, 2000);
  if (conversationInput.value !== text) conversationInput.value = text;
  conversationCount.textContent = `${text.length} / 2000 karakter`;
  updateAnalyzeButtonState();
  conversationResult.classList.add("is-hidden");
  setStatus(conversationStatus, getComposedText().trim() ? "Siap dianalisis di perangkat." : "Lengkapi data di atas untuk memulai analisis.");
});

for (const id of ["#quick-rekening-number", "#quick-pay-amount", "#quick-pay-name"]) {
  $(id)?.addEventListener("input", () => {
    updateAnalyzeButtonState();
    conversationResult.classList.add("is-hidden");
    setStatus(conversationStatus, getComposedText().trim() ? "Siap dianalisis di perangkat." : "Lengkapi data di atas untuk memulai analisis.");
  });
}

$("#chat-example").addEventListener("click", () => {
  conversationInput.value = "Selamat! Anda mendapat hadiah 150jt. Akun Anda akan diblokir jika tidak verifikasi sekarang. Klik https://bit.ly/hadiah-klaim dan kirim kode OTP Anda.";
  conversationInput.dispatchEvent(new Event("input", { bubbles: true }));
  conversationInput.focus();
});

$("#chat-paste").addEventListener("click", async () => {
  try {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== "function") {
      throw new Error("Akses clipboard tidak tersedia di browser ini.");
    }
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      setStatus(conversationStatus, "Clipboard kosong. Salin pesan terlebih dahulu.", "error");
      return;
    }
    conversationInput.value = text.slice(0, 2000);
    conversationInput.dispatchEvent(new Event("input", { bubbles: true }));
    conversationInput.focus();
    if (text.length > 2000) {
      setStatus(conversationStatus, "Teks terlalu panjang dan dipotong menjadi 2.000 karakter.", "error");
    }
  } catch (error) {
    setStatus(conversationStatus, `${error.message || "Clipboard tidak dapat diakses."} Tempel langsung ke kolom teks.`, "error");
  }
});

conversationAnalyzeButton.addEventListener("click", async () => {
  const text = getComposedText().trim();
  if (!text) {
    setStatus(conversationStatus, "Lengkapi data di atas terlebih dahulu.", "error");
    return;
  }
  conversationAnalyzeButton.disabled = true;
  setStatus(conversationStatus, "Menganalisis pola di perangkat…", "working");
  startAnalysis("Membaca data dan memeriksa tanda-tanda penipuan.");

  const base = analyzeText(text);
  const quick = getQuickFieldFindings();
  const findings = [...new Set([...base.findings, ...quick.findings])];
  const level = levelFromScore(base.score + quick.bonus);

  const title = level === "danger"
    ? "Ada tanda risiko tinggi"
    : level === "caution"
      ? "Perlu diperiksa lebih lanjut"
      : "Tidak ada pola umum yang terdeteksi";
  const message = level === "danger"
    ? "Ditemukan beberapa pola yang sering ditemukan pada penipuan. Jangan klik tautan atau bagikan kode dan data rahasia."
    : level === "caution"
      ? "Ada pola yang perlu diwaspadai. Verifikasi pengirim dan tujuan melalui kanal resmi sebelum bertindak."
      : "Tidak ditemukan pola umum yang mencurigakan. Hasil ini bukan jaminan bahwa data ini aman.";
  renderResult(conversationResult, {
    title,
    subtitle: "Pemeriksaan pola lokal · bukan verifikasi identitas pengirim",
    message,
    findings: findings.length ? findings : ["Tidak ditemukan kata pemicu atau tautan mencurigakan yang dikenali."],
    level,
  });
  for (const url of base.urls) {
    const urlElement = document.createElement("div");
    urlElement.className = "result-url";
    urlElement.textContent = `Tautan ditemukan: ${url}`;
    conversationResult.append(urlElement);
  }
  setStatus(conversationStatus, "Analisis selesai. Data tidak keluar dari perangkat.");
  updateAnalyzeButtonState();
  await presentAnalysis({
    level,
    title,
    message,
    findings: findings.length ? findings : ["Tidak ditemukan kata pemicu atau tautan mencurigakan yang dikenali."],
    source: text,
    sourceTitle: CHAT_CONTEXTS[currentContext]?.sourceTitle || "Cuplikan percakapan",
    score: level === "danger" ? 92 : level === "caution" ? 58 : 12,
    type: CHAT_CONTEXTS[currentContext]?.historyType || "chat",
  });
});

function renderResult(container, { title, subtitle, message, findings = [], level = "safe", value = "" }) {
  container.replaceChildren();
  container.classList.remove("is-hidden");
  const heading = document.createElement("div");
  heading.className = "result-heading";
  const indicator = document.createElement("span");
  indicator.className = "result-indicator";
  indicator.dataset.level = level;
  indicator.setAttribute("aria-hidden", "true");
  const indicatorIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  indicatorIcon.setAttribute("viewBox", "0 0 24 24");
  const indicatorPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  indicatorPath.setAttribute("d", level === "safe" ? "m5 12 4 4L19 6" : "M12 7v6m0 4h.01");
  indicatorIcon.append(indicatorPath);
  indicator.append(indicatorIcon);
  const headingText = document.createElement("span");
  const titleElement = document.createElement("strong");
  titleElement.textContent = title;
  const subtitleElement = document.createElement("small");
  subtitleElement.textContent = subtitle;
  headingText.append(titleElement, subtitleElement);
  heading.append(indicator, headingText);

  const messageElement = document.createElement("p");
  messageElement.className = "result-message";
  messageElement.textContent = message;
  container.append(heading, messageElement);

  if (findings.length) {
    const details = document.createElement("div");
    details.className = "result-details";
    for (const finding of findings) {
      const row = document.createElement("span");
      row.className = "result-detail";
      row.textContent = finding;
      details.append(row);
    }
    container.append(details);
  }
  if (value) {
    const valueElement = document.createElement("div");
    valueElement.className = "result-url";
    valueElement.textContent = value;
    container.append(valueElement);
  }
}

function previewFile(file, input, image, wrapper, statusElement, removeButton, onRemove, successMessage) {
  if (!validateImage(file, statusElement)) {
    input.value = "";
    return false;
  }
  const objectUrl = URL.createObjectURL(file);
  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    window.AmaninToast?.show(successMessage);
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    setStatus(statusElement, "Gambar gagal dimuat. Coba pilih file gambar lain.", "error");
    wrapper.classList.add("is-hidden");
  };
  image.src = objectUrl;
  wrapper.classList.remove("is-hidden");
  removeButton.onclick = () => {
    input.value = "";
    image.removeAttribute("src");
    wrapper.classList.add("is-hidden");
    onRemove();
  };
  return true;
}

$("#qr-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const input = event.target;
  input.value = "";
  selectedQrFile = null;
  $("#qr-analyze").disabled = true;
  $("#qr-preview-wrap").classList.add("is-hidden");
  $("#qr-result").classList.add("is-hidden");
  if (previewFile(file, input, $("#qr-preview"), $("#qr-preview-wrap"), $("#qr-status"), $("#qr-remove"), () => {
    selectedQrFile = null;
    $("#qr-analyze").disabled = true;
    $("#qr-result").classList.add("is-hidden");
  }, "QR code berhasil diunggah")) {
    selectedQrFile = file;
    $("#qr-analyze").disabled = false;
    $("#qr-result").classList.add("is-hidden");
    setStatus($("#qr-status"), "Gambar siap dipindai.", "");
  }
});

$("#qr-camera-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const input = event.target;
  input.value = "";
  selectedQrFile = null;
  $("#qr-analyze").disabled = true;
  $("#qr-preview-wrap").classList.add("is-hidden");
  $("#qr-result").classList.add("is-hidden");
  if (previewFile(file, input, $("#qr-preview"), $("#qr-preview-wrap"), $("#qr-status"), $("#qr-remove"), () => {
    selectedQrFile = null;
    $("#qr-analyze").disabled = true;
    $("#qr-result").classList.add("is-hidden");
  }, "Foto QR berhasil dimuat")) {
    selectedQrFile = file;
    $("#qr-analyze").disabled = false;
    $("#qr-result").classList.add("is-hidden");
    setStatus($("#qr-status"), "Foto siap dipindai.", "");
  }
});

$("#chat-file").addEventListener("change", handleChatFile);
$("#chat-camera-file").addEventListener("change", handleChatFile);

function handleChatFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const input = event.target;
  input.value = "";
  selectedChatFile = null;
  $("#chat-analyze").disabled = true;
  $("#chat-preview-wrap").classList.add("is-hidden");
  $("#chat-result").classList.add("is-hidden");
  if (previewFile(file, input, $("#chat-preview"), $("#chat-preview-wrap"), $("#chat-status"), $("#chat-remove"), () => {
    selectedChatFile = null;
    $("#chat-analyze").disabled = true;
    $("#chat-result").classList.add("is-hidden");
    $("#chat-file").value = "";
    $("#chat-camera-file").value = "";
  }, "Screenshot chat berhasil diunggah")) {
    selectedChatFile = file;
    $("#chat-analyze").disabled = false;
    $("#chat-result").classList.add("is-hidden");
    setStatus($("#chat-status"), "Screenshot siap diperiksa.", "");
  }
}

for (const zone of document.querySelectorAll(".upload-zone")) {
  for (const eventName of ["dragenter", "dragover"]) {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.add("is-dragover");
    });
  }
  for (const eventName of ["dragleave", "drop"]) {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragover");
    });
  }
  zone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (!file) return;
    const mode = zone.id.startsWith("qr") ? "qr" : "chat";
    const input = mode === "qr" ? $("#qr-file") : $("#chat-file");
    const setter = new DataTransfer();
    setter.items.add(file);
    input.files = setter.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function readQr(imageData) {
  if (typeof window.jsQR === "function") {
    return window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
  }
  if ("BarcodeDetector" in window) {
    try {
      barcodeDetector ||= new BarcodeDetector({ formats: ["qr_code"] });
      const detected = await barcodeDetector.detect(canvas);
      return detected.length ? { data: detected[0].rawValue } : null;
    } catch (error) {
      throw new Error(`Pemindai QR gagal memproses gambar: ${error.message || "format QR tidak didukung."}`);
    }
  }
  throw new Error("Pemindai QR belum tersedia. Periksa koneksi internet, lalu muat ulang halaman.");
}

async function scanQrFile(file) {
  if (qrBusy) return;
  qrBusy = true;
  startAnalysis("Membaca QR dan memeriksa tujuan kontennya.");
  $("#qr-analyze").disabled = true;
  setStatus($("#qr-status"), "Membaca gambar dan mencari QR…", "working");
  $("#qr-result").classList.add("is-hidden");
  try {
    const image = await loadImage(file);
    const imageData = drawImageForScan(image);
    const result = await readQr(imageData);
    if (!result) {
      renderResult($("#qr-result"), {
        title: "QR belum ditemukan",
        subtitle: "Gambar sudah diproses di perangkat",
        message: "Pastikan QR terlihat jelas, tidak terpotong, dan tidak buram. Jika gambar berisi screenshot chat, gunakan tab Chat & Gambar.",
        level: "caution",
      });
      setStatus($("#qr-status"), "Tidak menemukan QR pada gambar.", "error");
      await presentAnalysis({
        level: "caution",
        title: "QR belum ditemukan",
        message: "Gambar sudah diperiksa, tetapi pola QR belum terbaca. Pastikan kode terlihat utuh, fokus, dan mendapat pencahayaan yang cukup.",
        findings: ["Coba unggah gambar yang lebih jelas atau ambil foto dari jarak lebih dekat."],
        score: null,
      });
      return;
    }
    const payload = result.data;
    const isWebLink = /^(https?:\/\/|www\.)/i.test(payload);
    if (isWebLink) {
      const assessment = getUrlFindings(payload);
      renderResult($("#qr-result"), {
        title: assessment.level === "danger" ? "Tautan QR perlu diwaspadai" : assessment.level === "caution" ? "Periksa tujuan QR ini" : "QR berisi tautan",
        subtitle: "Analisis format dan alamat — bukan verifikasi reputasi situs",
        message: assessment.findings.length ? "Ditemukan beberapa hal yang sebaiknya diperiksa sebelum membuka tautan." : "Tidak ditemukan pola umum yang mencurigakan pada alamat. Ini bukan jaminan bahwa situs aman.",
        findings: assessment.findings.length ? assessment.findings : ["Tetap pastikan nama situs dan penerima benar sebelum memasukkan data atau melakukan pembayaran."],
        level: assessment.level,
        value: payload.slice(0, 1000),
      });
      setStatus($("#qr-status"), "QR berhasil dibaca. Jangan buka otomatis; cek alamat di bawah.", "");
      await presentAnalysis({
        level: assessment.level,
        title: assessment.level === "danger" ? "Tautan QR perlu diwaspadai" : assessment.level === "caution" ? "Periksa tujuan QR ini" : "QR berisi tautan",
        message: assessment.findings.length
          ? "Ditemukan pola yang perlu diperiksa sebelum membuka tautan."
          : "Tidak ditemukan pola umum yang mencurigakan pada alamat. Ini bukan jaminan bahwa situs aman.",
        findings: assessment.findings.length
          ? assessment.findings
          : ["Pastikan nama situs dan penerima benar sebelum memasukkan data atau melakukan pembayaran."],
        source: payload,
        sourceTitle: "Tautan yang dibaca dari QR",
        score: assessment.level === "danger" ? 92 : assessment.level === "caution" ? 58 : 12,
        type: "qr",
      });
    } else {
      renderResult($("#qr-result"), {
        title: "QR berhasil dibaca",
        subtitle: "Konten QR bukan tautan web",
        message: /^(000201|https?:\/\/)/i.test(payload)
          ? "QR tampaknya berisi format pembayaran. Pastikan nama merchant, nominal, dan penerima di aplikasi pembayaran sebelum menyetujui."
          : "Periksa isi dan tujuan QR ini sebelum bertindak. QR non-tautan tidak otomatis berarti aman.",
        findings: ["Pemindaian ini tidak memvalidasi identitas penerima atau status pembayaran."],
        level: "caution",
        value: payload.slice(0, 1000),
      });
      setStatus($("#qr-status"), "QR berhasil dibaca di perangkat.", "");
      await presentAnalysis({
        level: "caution",
        title: "QR berhasil dibaca",
        message: /^(000201|https?:\/\/)/i.test(payload)
          ? "QR tampaknya berisi format pembayaran. Pastikan nama merchant, nominal, dan penerima di aplikasi pembayaran sebelum menyetujui."
          : "Periksa isi dan tujuan QR ini sebelum bertindak. QR non-tautan tidak otomatis berarti aman.",
        findings: ["Pemindaian ini tidak memvalidasi identitas penerima atau status pembayaran."],
        source: payload,
        sourceTitle: "Konten QR",
        score: 58,
        type: "qr",
      });
    }
  } catch (error) {
    hideAnalysisLoading();
    setStatus($("#qr-status"), error.message || "Gambar QR tidak dapat diproses.", "error");
  } finally {
    qrBusy = false;
    $("#qr-analyze").disabled = !selectedQrFile;
  }
}

async function getOcrWorker() {
  if (ocrWorkerPromise) return ocrWorkerPromise;
  const tesseract = await loadTesseract();
  if (typeof tesseract.createWorker !== "function") {
    throw new Error("Mesin pembaca teks tidak kompatibel. Muat ulang halaman lalu coba lagi.");
  }
  ocrWorkerPromise = tesseract.createWorker("ind+eng", 1, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0_best",
    logger: (progress) => {
      if (progress.status === "recognizing text" && progress.progress) {
        const percent = Math.round(progress.progress * 100);
        analysisLoadingMessage.textContent = `Memindai teks pada gambar… ${percent}%`;
        setStatus($("#chat-status"), `Membaca teks screenshot… ${percent}%`, "working");
      } else if (progress.status === "loading language traineddata") {
        analysisLoadingMessage.textContent = "Menyiapkan pembaca teks untuk gambar.";
        setStatus($("#chat-status"), "Menyiapkan pembaca teks Indonesia dan Inggris…", "working");
      }
    },
  }).catch((error) => {
    ocrWorkerPromise = null;
    throw error;
  });
  return ocrWorkerPromise;
}

async function analyzeChatImage() {
  if (!selectedChatFile || ocrBusy) return;
  ocrBusy = true;
  startAnalysis("Membaca teks pada screenshot dan memeriksa pola risikonya.");
  $("#chat-analyze").disabled = true;
  $("#chat-result").classList.add("is-hidden");
  setStatus($("#chat-status"), "Menyiapkan pemeriksa teks di perangkat…", "working");
  try {
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(selectedChatFile);
    const text = (data.text || "").trim();
    if (!text) {
      renderResult($("#chat-result"), {
        title: "Teks belum terbaca",
        subtitle: "Screenshot sudah diproses di perangkat",
        message: "Coba gambar dengan teks lebih besar, terang, dan tidak terpotong. Kamu bisa upload gambar yang lebih jelas lalu coba lagi.",
        level: "caution",
      });
      setStatus($("#chat-status"), "Belum ada teks yang bisa dianalisis.", "error");
      await presentAnalysis({
        level: "caution",
        title: "Teks belum terbaca",
        message: "Screenshot sudah diproses di perangkat, tetapi teksnya belum cukup jelas untuk dianalisis.",
        findings: ["Gunakan gambar yang lebih terang, teks lebih besar, dan tidak terpotong."],
        score: null,
      });
      return;
    }
    const assessment = analyzeText(text);
    const title = assessment.level === "danger" ? "Ada tanda risiko tinggi" : assessment.level === "caution" ? "Perlu diperiksa lebih lanjut" : "Tidak ada pola umum yang terdeteksi";
    const message = assessment.level === "danger"
      ? "Screenshot mengandung beberapa tanda yang sering muncul pada pesan penipuan. Jangan klik tautan atau bagikan data rahasia."
      : assessment.level === "caution"
        ? "Ada pola yang perlu kamu waspadai. Pastikan pengirim dan tujuan pembayaran melalui kanal resmi."
        : "Tidak menemukan pola umum yang mencurigakan pada teks yang terbaca. Hasil ini tidak menjamin pesan aman.";
    renderResult($("#chat-result"), {
      title,
      subtitle: "Pemeriksaan pola lokal · bukan verifikasi identitas pengirim",
      message,
      findings: assessment.findings.length ? assessment.findings : ["Tidak ditemukan kata pemicu atau tautan mencurigakan yang dikenali."],
      level: assessment.level,
    });
    for (const url of assessment.urls) {
      const urlAssessment = getUrlFindings(url);
      const urlElement = document.createElement("div");
      urlElement.className = "result-url";
      urlElement.textContent = `Tautan ditemukan: ${url}`;
      $("#chat-result").append(urlElement);
      if (!assessment.findings.length && urlAssessment.findings.length) {
        const note = document.createElement("span");
        note.className = "result-detail";
        note.textContent = urlAssessment.findings.join(" ");
        $("#chat-result").append(note);
      }
    }
    const extracted = document.createElement("details");
    extracted.className = "result-extracted-details";
    const summary = document.createElement("summary");
    summary.textContent = "Lihat teks yang terbaca";
    const content = document.createElement("div");
    content.className = "result-extracted";
    content.textContent = text;
    extracted.append(summary, content);
    $("#chat-result").append(extracted);
    setStatus($("#chat-status"), "Pemeriksaan selesai. Teks screenshot tidak keluar dari perangkat.", "");
    await presentAnalysis({
      level: assessment.level,
      title,
      message,
      findings: assessment.findings.length ? assessment.findings : ["Tidak ditemukan kata pemicu atau tautan mencurigakan yang dikenali."],
      source: text,
      sourceTitle: "Teks yang terbaca dari screenshot",
      score: assessment.level === "danger" ? 92 : assessment.level === "caution" ? 58 : 12,
      type: "screenshot",
    });
  } catch (error) {
    hideAnalysisLoading();
    setStatus($("#chat-status"), `Pemeriksaan gagal: ${error.message || "mesin OCR tidak dapat dijalankan."}`, "error");
  } finally {
    ocrBusy = false;
    $("#chat-analyze").disabled = !selectedChatFile;
  }
}

$("#chat-analyze").addEventListener("click", analyzeChatImage);

async function startCamera() {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    setStatus($("#qr-status"), "Kamera langsung butuh HTTPS atau localhost. Gunakan tombol Kamera / Galeri di ponsel untuk memotret QR.", "error");
    return;
  }
  stopCamera();
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
    if ("BarcodeDetector" in window) {
      try {
        barcodeDetector = new BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        barcodeDetector = null;
      }
    }
    if (!barcodeDetector && typeof window.jsQR !== "function") {
      throw new Error("Pemindai QR belum tersedia. Periksa koneksi internet, lalu unggah gambar QR.");
    }
    const video = $("#camera-video");
    video.srcObject = cameraStream;
    await video.play();
    $("#camera-view").classList.remove("is-hidden");
    $("#qr-preview-wrap").classList.add("is-hidden");
    setStatus($("#qr-status"), "Kamera aktif. Arahkan ke QR; hasil tidak dibuka otomatis.", "working");
    cameraFrame = requestAnimationFrame(scanCameraFrame);
  } catch (error) {
    const message = error.name === "NotAllowedError"
      ? "Izin kamera ditolak. Aktifkan izin kamera di browser atau unggah gambar QR."
      : error.name === "NotFoundError"
        ? "Kamera tidak ditemukan. Unggah gambar QR untuk melanjutkan."
        : `Kamera tidak bisa dibuka: ${error.message || "periksa izin atau koneksi aman."}`;
    setStatus($("#qr-status"), message, "error");
  }
}

async function scanCameraFrame(timestamp) {
  if (!cameraStream) return;
  cameraFrame = requestAnimationFrame(scanCameraFrame);
  if (cameraBusy || timestamp - lastFrameAt < 220) return;
  lastFrameAt = timestamp;
  const video = $("#camera-video");
  if (!video.videoWidth || !video.videoHeight) return;
  cameraBusy = true;
  try {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    let result = null;
    if (barcodeDetector) {
      const detected = await barcodeDetector.detect(video);
      if (detected.length) result = { data: detected[0].rawValue };
    } else if (typeof window.jsQR === "function") {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      result = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    }
    if (result) {
      stopCamera();
      const payload = result.data;
      if (/^(https?:\/\/|www\.)/i.test(payload)) {
        const assessment = getUrlFindings(payload);
        renderResult($("#qr-result"), {
          title: assessment.level === "danger" ? "Tautan QR perlu diwaspadai" : assessment.level === "caution" ? "Periksa tujuan QR ini" : "QR berisi tautan",
          subtitle: "Analisis format dan alamat — bukan verifikasi reputasi situs",
          message: assessment.findings.length ? "Jangan buka sebelum memeriksa temuan berikut." : "Tidak ditemukan pola umum yang mencurigakan pada alamat. Tetap pastikan tujuan situs sebelum melanjutkan.",
          findings: assessment.findings.length ? assessment.findings : ["Jangan masukkan kata sandi, PIN, atau OTP dari tautan yang tidak diminta."],
          level: assessment.level,
          value: payload,
        });
      } else {
        renderResult($("#qr-result"), {
          title: "QR berhasil dibaca",
          subtitle: "Konten QR bukan tautan web",
          message: /^(000201|https?:\/\/)/i.test(payload)
            ? "QR tampaknya berisi format pembayaran. Pastikan nama merchant dan nominal sebelum menyetujui."
            : "Tinjau konten QR ini sebelum melanjutkan. QR non-tautan belum tentu aman.",
          findings: ["Pemindaian ini tidak memvalidasi identitas penerima atau status pembayaran."],
          level: "caution",
          value: payload.slice(0, 1000),
        });
      }
      $("#camera-view").classList.add("is-hidden");
      setStatus($("#qr-status"), "QR berhasil dipindai. Tidak ada tautan yang dibuka otomatis.", "");
    }
  } catch (error) {
    setStatus($("#qr-status"), `Pemindaian kamera gagal: ${error.message}`, "error");
    stopCamera();
  } finally {
    cameraBusy = false;
  }
}

function stopCamera() {
  if (cameraFrame) cancelAnimationFrame(cameraFrame);
  cameraFrame = null;
  if (cameraStream) {
    for (const track of cameraStream.getTracks()) track.stop();
  }
  cameraStream = null;
  cameraBusy = false;
  $("#camera-video").srcObject = null;
  $("#camera-view").classList.add("is-hidden");
}

$("#qr-camera").addEventListener("click", startCamera);
$("#camera-close").addEventListener("click", () => {
  stopCamera();
  setStatus($("#qr-status"), "Kamera ditutup. Unggah gambar atau buka kamera lagi.", "");
});
window.addEventListener("pagehide", stopCamera);

for (const tab of tabs) {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const mode = tab.dataset.mode === "qr" ? "chat" : "qr";
    setMode(mode);
    $(`[data-mode="${mode}"]`).focus();
  });
}

function getInitialMode() {
  const requestedMode = new URLSearchParams(window.location.search).get("mode");
  return requestedMode ?? window.location.hash.slice(1);
}

let currentContext = "chat";

const CHAT_CONTEXTS = {
  chat: {
    badge: "Scan Chat",
    badgeIcon: '<path d="M4 5h16v12H8l-4 3V5Z"/><path d="M8 9h8m-8 4h5"/>',
    iconClass: "chat-icon",
    heading: "Input teks percakapan",
    subtitle: "Tempel pesan yang mencurigakan untuk memeriksa pola scam.",
    placeholder: 'Tempel pesan di sini... Contoh: "Akun Anda akan diblokir. Verifikasi sekarang di https://bit.ly/..."',
    focus: "text",
    showText: true,
    showScreenshot: true,
    actionLabel: "Analisis Percakapan",
    idleStatus: "Isi atau tempel pesan untuk memulai analisis.",
    sourceTitle: "Cuplikan percakapan",
    historyType: "chat",
  },
  screenshot: {
    badge: "Screenshot",
    badgeIcon: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="10" r="2"/><path d="m4 16 5-4 3 3 2-2 6 4"/>',
    iconClass: "screenshot-icon",
    heading: "Input teks percakapan",
    subtitle: "Tempel pesan yang mencurigakan untuk memeriksa pola scam.",
    placeholder: 'Tempel pesan di sini... Contoh: "Akun Anda akan diblokir. Verifikasi sekarang di https://bit.ly/..."',
    focus: "screenshot",
    showText: false,
    showScreenshot: true,
    actionLabel: "Analisis Percakapan",
    idleStatus: "Isi atau tempel pesan untuk memulai analisis.",
    sourceTitle: "Cuplikan percakapan",
    historyType: "screenshot",
  },
  link: {
    badge: "Tautan / Link",
    badgeIcon: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',
    iconClass: "link-icon",
    heading: "Periksa tautan yang kamu terima",
    subtitle: "Tempel link lengkap untuk memeriksa domain, pemendek tautan, dan pola phishing.",
    placeholder: "Tempel tautan lengkap di sini... Contoh: https://promo-hadiah-resmi.com/klaim",
    focus: "text",
    showText: true,
    showScreenshot: false,
    actionLabel: "Periksa Tautan",
    idleStatus: "Tempel tautan untuk memulai analisis.",
    sourceTitle: "Tautan yang diperiksa",
    historyType: "link",
  },
  rekening: {
    badge: "No. / Rekening",
    badgeIcon: '<path d="M3 6h18v13H3z"/><circle cx="10" cy="11" r="2.5"/><path d="M6 17c.8-2 2.2-3 4-3s3.2 1 4 3m3-6h2"/>',
    iconClass: "rekening-icon",
    heading: "Periksa nomor HP atau rekening",
    subtitle: "Masukkan nomornya, tambahkan konteks pesan di bawah kalau ada.",
    placeholder: "Opsional: tempel pesan atau percakapan terkait nomor ini...",
    focus: "quick",
    showText: true,
    showScreenshot: false,
    quickFields: "rekening",
    textRequired: false,
    actionLabel: "Periksa Nomor",
    idleStatus: "Isi nomor HP atau rekening untuk memulai analisis.",
    sourceTitle: "Nomor yang diperiksa",
    historyType: "rekening",
  },
  pembayaran: {
    badge: "Pembayaran",
    badgeIcon: '<path d="M4 6h16v14H4z"/><path d="M4 9h16m-6 5h3"/>',
    iconClass: "pembayaran-icon",
    heading: "Periksa detail pembayaran",
    subtitle: "Isi nominal dan penerima, tambahkan detail VA/QRIS di bawah kalau ada.",
    placeholder: "Opsional: tempel detail Virtual Account/QRIS atau pesan terkait...",
    focus: "quick",
    showText: true,
    showScreenshot: false,
    quickFields: "pembayaran",
    textRequired: false,
    actionLabel: "Periksa Pembayaran",
    idleStatus: "Isi nominal dan penerima untuk memulai analisis.",
    sourceTitle: "Pembayaran yang diperiksa",
    historyType: "pembayaran",
  },
};

function getRequestedContext() {
  const params = new URLSearchParams(window.location.search);
  const explicit = params.get("context");
  if (explicit && CHAT_CONTEXTS[explicit]) return explicit;
  if (params.get("mode") === "link") return "link";
  return "chat";
}

function getComposedText() {
  const config = CHAT_CONTEXTS[currentContext] || CHAT_CONTEXTS.chat;
  const extra = conversationInput?.value.trim() || "";
  if (config.quickFields === "rekening") {
    const number = $("#quick-rekening-number")?.value.trim() || "";
    if (!number) return "";
    return `Nomor HP/Rekening yang diperiksa: ${number}.${extra ? ` ${extra}` : ""}`;
  }
  if (config.quickFields === "pembayaran") {
    const amount = $("#quick-pay-amount")?.value.trim() || "";
    const name = $("#quick-pay-name")?.value.trim() || "";
    if (!amount && !name) return "";
    const amountText = amount ? `Rp${amount}` : "jumlah tidak diisi";
    const nameText = name || "penerima tidak diisi";
    return `Pembayaran ke ${nameText} sebesar ${amountText}.${extra ? ` ${extra}` : ""}`;
  }
  return extra;
}

function getQuickFieldFindings() {
  const findings = [];
  let bonus = 0;
  const config = CHAT_CONTEXTS[currentContext];
  if (config?.quickFields === "rekening") {
    const number = $("#quick-rekening-number")?.value.trim() || "";
    const digits = number.replace(/\D/g, "");
    if (number && digits.length < 8) {
      findings.push("Nomor terlalu pendek untuk format HP/rekening yang umum di Indonesia.");
      bonus += 1;
    } else if (digits && /^(\d)\1+$/.test(digits)) {
      findings.push("Nomor terdiri dari digit yang berulang terus-menerus; pola ini sering dipakai pada nomor palsu.");
      bonus += 2;
    }
  }
  if (config?.quickFields === "pembayaran") {
    const amount = Number(($("#quick-pay-amount")?.value || "").replace(/\D/g, ""));
    if (amount >= 5000000) {
      findings.push("Nominal pembayaran cukup besar; pastikan kamu benar-benar mengenali penerimanya sebelum membayar.");
      bonus += 1;
    }
  }
  return { findings, bonus };
}

function updateAnalyzeButtonState() {
  conversationAnalyzeButton.disabled = !getComposedText().trim();
}

function applyChatContext(context) {
  const config = CHAT_CONTEXTS[context] || CHAT_CONTEXTS.chat;
  currentContext = CHAT_CONTEXTS[context] ? context : "chat";

  const badgeLabel = $("#context-badge-label");
  const badgeSvg = $("#context-badge svg");
  if (badgeLabel) badgeLabel.textContent = config.badge;
  if (badgeSvg) badgeSvg.innerHTML = config.badgeIcon;

  const icon = $("#conversation-icon");
  if (icon) {
    icon.classList.remove("chat-icon", "link-icon", "rekening-icon", "pembayaran-icon", "screenshot-icon");
    icon.classList.add(config.iconClass);
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${config.badgeIcon}</svg>`;
  }

  const headingEl = $("#conversation-title");
  const subtitleEl = $("#conversation-subtitle");
  if (headingEl) headingEl.textContent = config.heading;
  if (subtitleEl) subtitleEl.textContent = config.subtitle;
  if (conversationInput) conversationInput.placeholder = config.placeholder;

  const actionLabelEl = $("#chat-text-analyze-label");
  if (actionLabelEl) actionLabelEl.textContent = config.actionLabel;
  if (!conversationInput?.value.trim() && !$("#quick-rekening-number")?.value.trim() && !$("#quick-pay-amount")?.value.trim() && !$("#quick-pay-name")?.value.trim()) {
    setStatus(conversationStatus, config.idleStatus);
  }

  $("#quick-fields-rekening")?.classList.toggle("is-hidden", config.quickFields !== "rekening");
  $("#quick-fields-pembayaran")?.classList.toggle("is-hidden", config.quickFields !== "pembayaran");
  $(".conversation-check")?.classList.toggle("is-hidden", !config.showText);
  $("#screenshot-section")?.classList.toggle("is-hidden", !config.showScreenshot);

  updateAnalyzeButtonState();
  return config;
}

function focusChatTarget(target) {
  window.requestAnimationFrame(() => {
    if (target === "screenshot") {
      const dropzone = $("#chat-dropzone");
      dropzone?.scrollIntoView({ behavior: "smooth", block: "center" });
      dropzone?.classList.add("quick-focus");
      window.setTimeout(() => dropzone?.classList.remove("quick-focus"), 1600);
    } else if (target === "quick") {
      const firstField = document.querySelector(".quick-fields:not(.is-hidden) input");
      (firstField || conversationInput)?.focus({ preventScroll: false });
    } else {
      conversationInput?.focus({ preventScroll: false });
    }
  });
}

window.addEventListener("hashchange", () => setMode(getInitialMode(), false));
const initialMode = getInitialMode();
setMode(initialMode, false);
if (initialMode !== "qr") {
  const context = getRequestedContext();
  const config = applyChatContext(context);
  focusChatTarget(config.focus);
}

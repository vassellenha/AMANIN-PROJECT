"use strict";

const $ = (selector) => document.querySelector(selector);
const t = (key) => window.AmaninI18n?.t(key) ?? key;
const tf = (key, vars) => window.AmaninI18n?.tf(key, vars) ?? key;
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
  sourceTitle,
  score = null,
  type = "chat",
}) {
  const remaining = Math.max(0, 1350 - (performance.now() - analysisStartedAt));
  if (remaining) await new Promise((resolve) => window.setTimeout(resolve, remaining));

  if (score !== null) {
    window.AmaninHistory?.add({ type, level, score, title, source });
  }

  const safeFindings = findings.length ? findings : [t("scan.msg.nospecific")];
  const summary = $("#risk-summary");
  summary.dataset.level = level;
  summary.toggleAttribute("data-unscored", score === null);
  $("#risk-score").textContent = score === null ? "—" : String(score);
  $("#risk-score-label").textContent = score === null ? t("scan.result.scorestatus") : t("scan.result.scorelabel");
  $("#risk-gauge").setAttribute("aria-label", score === null ? title : tf("scan.msg.gaugelabel", { score }));
  $("#risk-gauge-value").style.strokeDasharray = String(riskGaugeCircumference);
  $("#risk-gauge-value").style.strokeDashoffset = String(riskGaugeCircumference * (1 - (score ?? 0) / 100));
  $("#risk-level-pill").textContent = score === null
    ? t("scan.msg.statusunscored")
    : level === "danger"
      ? t("scan.msg.statusdanger")
      : level === "caution"
        ? t("scan.msg.statuscaution")
        : t("scan.msg.statussafe");
  $("#risk-result-title").textContent = title;
  $("#risk-result-message").textContent = score === null
    ? t("scan.msg.resultmsgunscored")
    : level === "danger"
      ? t("scan.msg.resultmsgdanger")
      : level === "caution"
        ? t("scan.msg.resultmsgcaution")
        : t("scan.msg.resultmsgsafe");
  $("#analysis-explanation-text").textContent = message;
  $("#analysis-findings-title").textContent = tf("scan.msg.findingstitle", { count: safeFindings.length });
  $("#analysis-findings-count").textContent = level === "danger" ? t("scan.msg.findingstagdanger") : level === "caution" ? t("scan.msg.findingstagcaution") : t("scan.msg.findingstagsafe");

  const sourceCard = $("#analysis-source-card");
  sourceCard.classList.toggle("is-hidden", !source);
  if (source) {
    $("#analysis-source-title").textContent = sourceTitle || t("scan.result.content");
    $("#analysis-source-text").textContent = source.length > 360 ? `${source.slice(0, 360)}…` : source;
  }

  const findingsList = $("#analysis-findings");
  findingsList.replaceChildren();
  for (const finding of safeFindings) {
    const item = document.createElement("li");
    item.textContent = finding;
    findingsList.append(item);
  }

  $("#analysis-advice-title").textContent = level === "danger" ? t("scan.msg.advicetitledanger") : t("scan.msg.advicetitledefault");
  $("#analysis-advice-text").textContent = level === "danger"
    ? t("scan.msg.advicedanger")
    : level === "caution"
      ? t("scan.msg.advicecaution")
      : t("scan.msg.advicesafe");

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
    setStatus(statusElement, t("scan.err.format"), "error");
    return false;
  }
  if (file.size > maxFileSize) {
    setStatus(statusElement, t("scan.err.size"), "error");
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
      reject(new Error(t("scan.err.imageopenfail")));
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
    return { level: "danger", findings: [t("scan.url.invalid")] };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:") findings.push(t("scan.url.nohttps"));
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) findings.push(t("scan.url.ipaddress"));
  if (/^(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|shorturl\.at|rb\.gy)$/i.test(hostname)) findings.push(t("scan.url.shortener"));
  if (hostname.startsWith("xn--") || hostname.split(".").some((part) => part.startsWith("xn--"))) findings.push(t("scan.url.idn"));
  if (/(login|verify|verifikasi|hadiah|promo|claim|klaim|secure|akun|bank)/i.test(hostname)) findings.push(t("scan.url.keyword"));
  if (hostname.split(".").length > 4) findings.push(t("scan.url.subdomain"));
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
        reject(new Error(t("scan.ocr.errnoresponse")));
      }
    };
    script.onerror = () => {
      tesseractScriptPromise = null;
      reject(new Error(t("scan.ocr.errloadfail")));
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
    { pattern: /\b(otp|pin|kata sandi|password|kode verifikasi)\b/i, key: "scan.rule.otp", severity: 3 },
    { pattern: /(?:\.apk\b|\bapk\b|\bunduh.{0,20}apk\b|\bfile apk\b|\baplikasi.{0,20}android\b)/i, key: "scan.rule.apk", severity: 3 },
    { pattern: /\b(akun.{0,20}(diblokir|ditangguhkan|dinonaktifkan)|blokir.{0,20}akun|verifikasi.{0,20}akun)\b/i, key: "scan.rule.accountblock", severity: 2 },
    { pattern: /\b(hadiah|menang|undian|gratis|kuota gratis|klaim sekarang|voucher)\b/i, key: "scan.rule.prize", severity: 1 },
    { pattern: /\b(segera|darurat|terakhir hari ini|dalam \d+ menit|akan hangus|jangan abaikan)\b/i, key: "scan.rule.urgency", severity: 1 },
    { pattern: /\b(transfer|biaya admin|bayar sekarang|rekening pribadi|qris)\b/i, key: "scan.rule.payment", severity: 1 },
  ];
  let score = 0;
  for (const rule of rules) {
    if (rule.pattern.test(lower)) {
      findings.push(t(rule.key));
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

function renderConversationIdleStatus() {
  setStatus(conversationStatus, getComposedText().trim() ? t("scan.msg.ready") : t("scan.msg.incomplete"));
}

conversationInput.addEventListener("input", () => {
  const text = conversationInput.value.slice(0, 2000);
  if (conversationInput.value !== text) conversationInput.value = text;
  conversationCount.textContent = `${text.length} / 2000 ${t("scan.charcount")}`;
  updateAnalyzeButtonState();
  conversationResult.classList.add("is-hidden");
  renderConversationIdleStatus();
});

for (const id of ["#quick-rekening-number", "#quick-pay-amount", "#quick-pay-name"]) {
  $(id)?.addEventListener("input", () => {
    updateAnalyzeButtonState();
    conversationResult.classList.add("is-hidden");
    renderConversationIdleStatus();
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
      throw new Error(t("scan.msg.clipboardunavailable"));
    }
    const text = await navigator.clipboard.readText();
    if (!text.trim()) {
      setStatus(conversationStatus, t("scan.msg.clipboardempty"), "error");
      return;
    }
    conversationInput.value = text.slice(0, 2000);
    conversationInput.dispatchEvent(new Event("input", { bubbles: true }));
    conversationInput.focus();
    if (text.length > 2000) {
      setStatus(conversationStatus, t("scan.msg.clipboardtoolong"), "error");
    }
  } catch (error) {
    setStatus(conversationStatus, `${error.message || t("scan.msg.clipboardfaildefault")} ${t("scan.msg.clipboardfailsuffix")}`, "error");
  }
});

conversationAnalyzeButton.addEventListener("click", async () => {
  const text = getComposedText().trim();
  if (!text) {
    setStatus(conversationStatus, t("scan.msg.fillfirst"), "error");
    return;
  }
  conversationAnalyzeButton.disabled = true;
  setStatus(conversationStatus, t("scan.msg.analyzing"), "working");
  startAnalysis(t("scan.msg.startanalysis"));

  const base = analyzeText(text);
  const quick = getQuickFieldFindings();
  const findings = [...new Set([...base.findings, ...quick.findings])];
  const level = levelFromScore(base.score + quick.bonus);

  const title = level === "danger"
    ? t("scan.msg.titledanger")
    : level === "caution"
      ? t("scan.msg.titlecaution")
      : t("scan.msg.titlesafe");
  const message = level === "danger"
    ? t("scan.msg.bodydanger")
    : level === "caution"
      ? t("scan.msg.bodycaution")
      : t("scan.msg.bodysafe");
  renderResult(conversationResult, {
    title,
    subtitle: t("scan.msg.subtitlepattern"),
    message,
    findings: findings.length ? findings : [t("scan.msg.nopattern")],
    level,
  });
  for (const url of base.urls) {
    const urlElement = document.createElement("div");
    urlElement.className = "result-url";
    urlElement.textContent = tf("scan.msg.foundlink", { url });
    conversationResult.append(urlElement);
  }
  setStatus(conversationStatus, t("scan.msg.donelocal"));
  updateAnalyzeButtonState();
  await presentAnalysis({
    level,
    title,
    message,
    findings: findings.length ? findings : [t("scan.msg.nopattern")],
    source: text,
    sourceTitle: t(CHAT_CONTEXTS[currentContext]?.sourceTitleKey || "scan.ctx.chat.sourcetitle"),
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
    setStatus(statusElement, t("scan.err.imageloadfail"), "error");
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
  }, t("scan.qr.toastuploaded"))) {
    selectedQrFile = file;
    $("#qr-analyze").disabled = false;
    $("#qr-result").classList.add("is-hidden");
    setStatus($("#qr-status"), t("scan.qr.msgready"), "");
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
  }, t("scan.qr.toastphotoloaded"))) {
    selectedQrFile = file;
    $("#qr-analyze").disabled = false;
    $("#qr-result").classList.add("is-hidden");
    setStatus($("#qr-status"), t("scan.qr.msgphotoready"), "");
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
  }, t("scan.ocr.toastuploaded"))) {
    selectedChatFile = file;
    $("#chat-analyze").disabled = false;
    $("#chat-result").classList.add("is-hidden");
    setStatus($("#chat-status"), t("scan.ocr.msgready"), "");
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
      throw new Error(tf("scan.qr.errdetectfail", { reason: error.message || t("scan.qr.errdetectfailreason") }));
    }
  }
  throw new Error(t("scan.qr.errnotavailable"));
}

async function scanQrFile(file) {
  if (qrBusy) return;
  qrBusy = true;
  startAnalysis(t("scan.cam.msgstart"));
  $("#qr-analyze").disabled = true;
  setStatus($("#qr-status"), t("scan.qr.msgreading"), "working");
  $("#qr-result").classList.add("is-hidden");
  try {
    const image = await loadImage(file);
    const imageData = drawImageForScan(image);
    const result = await readQr(imageData);
    if (!result) {
      renderResult($("#qr-result"), {
        title: t("scan.qr.notfoundtitle"),
        subtitle: t("scan.qr.notfoundsubtitle"),
        message: t("scan.qr.notfoundbody"),
        level: "caution",
      });
      setStatus($("#qr-status"), t("scan.qr.notfoundstatus"), "error");
      await presentAnalysis({
        level: "caution",
        title: t("scan.qr.notfoundtitle"),
        message: t("scan.qr.notfoundanalysis"),
        findings: [t("scan.qr.notfoundfinding")],
        score: null,
      });
      return;
    }
    const payload = result.data;
    const isWebLink = /^(https?:\/\/|www\.)/i.test(payload);
    if (isWebLink) {
      const assessment = getUrlFindings(payload);
      const linkTitle = assessment.level === "danger" ? t("scan.qr.linktitledanger") : assessment.level === "caution" ? t("scan.qr.linktitlecaution") : t("scan.qr.linktitlesafe");
      renderResult($("#qr-result"), {
        title: linkTitle,
        subtitle: t("scan.qr.linksubtitle"),
        message: assessment.findings.length ? t("scan.qr.linkbodyfindings") : t("scan.qr.linkbodynofindings"),
        findings: assessment.findings.length ? assessment.findings : [t("scan.qr.linkfallbackfinding")],
        level: assessment.level,
        value: payload.slice(0, 1000),
      });
      setStatus($("#qr-status"), t("scan.qr.linkstatus"), "");
      await presentAnalysis({
        level: assessment.level,
        title: linkTitle,
        message: assessment.findings.length ? t("scan.qr.linkanalysisfindings") : t("scan.qr.linkbodynofindings"),
        findings: assessment.findings.length ? assessment.findings : [t("scan.qr.linkfallbackfinding")],
        source: payload,
        sourceTitle: t("scan.qr.sourcetitlelink"),
        score: assessment.level === "danger" ? 92 : assessment.level === "caution" ? 58 : 12,
        type: "qr",
      });
    } else {
      const contentBody = /^(000201|https?:\/\/)/i.test(payload) ? t("scan.qr.paymentbody") : t("scan.qr.nonlinkbody");
      renderResult($("#qr-result"), {
        title: t("scan.qr.contenttitle"),
        subtitle: t("scan.qr.contentsubtitle"),
        message: contentBody,
        findings: [t("scan.qr.contentfinding")],
        level: "caution",
        value: payload.slice(0, 1000),
      });
      setStatus($("#qr-status"), t("scan.qr.contentstatus"), "");
      await presentAnalysis({
        level: "caution",
        title: t("scan.qr.contenttitle"),
        message: contentBody,
        findings: [t("scan.qr.contentfinding")],
        source: payload,
        sourceTitle: t("scan.qr.sourcetitlecontent"),
        score: 58,
        type: "qr",
      });
    }
  } catch (error) {
    hideAnalysisLoading();
    setStatus($("#qr-status"), error.message || t("scan.qr.errgeneric"), "error");
  } finally {
    qrBusy = false;
    $("#qr-analyze").disabled = !selectedQrFile;
  }
}

async function getOcrWorker() {
  if (ocrWorkerPromise) return ocrWorkerPromise;
  const tesseract = await loadTesseract();
  if (typeof tesseract.createWorker !== "function") {
    throw new Error(t("scan.ocr.errincompatible"));
  }
  ocrWorkerPromise = tesseract.createWorker("ind+eng", 1, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0_best",
    logger: (progress) => {
      if (progress.status === "recognizing text" && progress.progress) {
        const percent = Math.round(progress.progress * 100);
        analysisLoadingMessage.textContent = tf("scan.ocr.msgscanning", { percent });
        setStatus($("#chat-status"), tf("scan.ocr.msgreadingstatus", { percent }), "working");
      } else if (progress.status === "loading language traineddata") {
        analysisLoadingMessage.textContent = t("scan.ocr.msgpreparing");
        setStatus($("#chat-status"), t("scan.ocr.msgpreparingstatus"), "working");
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
  startAnalysis(t("scan.ocr.msgstart"));
  $("#chat-analyze").disabled = true;
  $("#chat-result").classList.add("is-hidden");
  setStatus($("#chat-status"), t("scan.ocr.msgpreparingchecker"), "working");
  try {
    const worker = await getOcrWorker();
    const { data } = await worker.recognize(selectedChatFile);
    const text = (data.text || "").trim();
    if (!text) {
      renderResult($("#chat-result"), {
        title: t("scan.ocr.notfoundtitle"),
        subtitle: t("scan.ocr.notfoundsubtitle"),
        message: t("scan.ocr.notfoundbody"),
        level: "caution",
      });
      setStatus($("#chat-status"), t("scan.ocr.notfoundstatus"), "error");
      await presentAnalysis({
        level: "caution",
        title: t("scan.ocr.notfoundtitle"),
        message: t("scan.ocr.notfoundanalysis"),
        findings: [t("scan.ocr.notfoundfinding")],
        score: null,
      });
      return;
    }
    const assessment = analyzeText(text);
    const title = assessment.level === "danger" ? t("scan.msg.titledanger") : assessment.level === "caution" ? t("scan.msg.titlecaution") : t("scan.msg.titlesafe");
    const message = assessment.level === "danger"
      ? t("scan.ocr.bodydanger")
      : assessment.level === "caution"
        ? t("scan.ocr.bodycaution")
        : t("scan.ocr.bodysafe");
    renderResult($("#chat-result"), {
      title,
      subtitle: t("scan.msg.subtitlepattern"),
      message,
      findings: assessment.findings.length ? assessment.findings : [t("scan.msg.nopattern")],
      level: assessment.level,
    });
    for (const url of assessment.urls) {
      const urlAssessment = getUrlFindings(url);
      const urlElement = document.createElement("div");
      urlElement.className = "result-url";
      urlElement.textContent = tf("scan.msg.foundlink", { url });
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
    summary.textContent = t("scan.ocr.viewtext");
    const content = document.createElement("div");
    content.className = "result-extracted";
    content.textContent = text;
    extracted.append(summary, content);
    $("#chat-result").append(extracted);
    setStatus($("#chat-status"), t("scan.ocr.donestatus"), "");
    await presentAnalysis({
      level: assessment.level,
      title,
      message,
      findings: assessment.findings.length ? assessment.findings : [t("scan.msg.nopattern")],
      source: text,
      sourceTitle: t("scan.ocr.sourcetitle"),
      score: assessment.level === "danger" ? 92 : assessment.level === "caution" ? 58 : 12,
      type: "screenshot",
    });
  } catch (error) {
    hideAnalysisLoading();
    setStatus($("#chat-status"), tf("scan.ocr.failstatus", { error: error.message || t("scan.ocr.errdefault") }), "error");
  } finally {
    ocrBusy = false;
    $("#chat-analyze").disabled = !selectedChatFile;
  }
}

$("#chat-analyze").addEventListener("click", analyzeChatImage);

async function startCamera() {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    setStatus($("#qr-status"), t("scan.cam.errnohttps"), "error");
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
      throw new Error(t("scan.cam.errnodetector"));
    }
    const video = $("#camera-video");
    video.srcObject = cameraStream;
    await video.play();
    $("#camera-view").classList.remove("is-hidden");
    $("#qr-preview-wrap").classList.add("is-hidden");
    setStatus($("#qr-status"), t("scan.cam.msgactive"), "working");
    cameraFrame = requestAnimationFrame(scanCameraFrame);
  } catch (error) {
    const message = error.name === "NotAllowedError"
      ? t("scan.cam.errdenied")
      : error.name === "NotFoundError"
        ? t("scan.cam.errnotfound")
        : tf("scan.cam.errgeneric", { reason: error.message || t("scan.cam.errgenericreason") });
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
        const linkTitle = assessment.level === "danger" ? t("scan.qr.linktitledanger") : assessment.level === "caution" ? t("scan.qr.linktitlecaution") : t("scan.qr.linktitlesafe");
        renderResult($("#qr-result"), {
          title: linkTitle,
          subtitle: t("scan.qr.linksubtitle"),
          message: assessment.findings.length ? t("scan.cam.linkbodyfindings") : t("scan.cam.linkbodynofindings"),
          findings: assessment.findings.length ? assessment.findings : [t("scan.cam.linkfinding")],
          level: assessment.level,
          value: payload,
        });
      } else {
        renderResult($("#qr-result"), {
          title: t("scan.qr.contenttitle"),
          subtitle: t("scan.qr.contentsubtitle"),
          message: /^(000201|https?:\/\/)/i.test(payload) ? t("scan.cam.paymentbody") : t("scan.cam.nonlinkbody"),
          findings: [t("scan.qr.contentfinding")],
          level: "caution",
          value: payload.slice(0, 1000),
        });
      }
      $("#camera-view").classList.add("is-hidden");
      setStatus($("#qr-status"), t("scan.cam.msgscansuccess"), "");
    }
  } catch (error) {
    setStatus($("#qr-status"), tf("scan.cam.msgscanfail", { error: error.message }), "error");
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
  setStatus($("#qr-status"), t("scan.cam.msgclosed"), "");
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
    iconClass: "chat-icon",
    badgeIcon: '<path d="M4 5h16v12H8l-4 3V5Z"/><path d="M8 9h8m-8 4h5"/>',
    focus: "text",
    showText: true,
    showScreenshot: true,
    badgeKey: "scan.ctx.chat.badge",
    headingKey: "scan.ctx.chat.heading",
    subtitleKey: "scan.ctx.chat.subtitle",
    placeholderKey: "scan.ctx.chat.placeholder",
    actionKey: "scan.ctx.chat.action",
    idleKey: "scan.ctx.chat.idle",
    sourceTitleKey: "scan.ctx.chat.sourcetitle",
    historyType: "chat",
  },
  screenshot: {
    iconClass: "screenshot-icon",
    badgeIcon: '<path d="M4 5h16v14H4z"/><circle cx="9" cy="10" r="2"/><path d="m4 16 5-4 3 3 2-2 6 4"/>',
    focus: "screenshot",
    showText: false,
    showScreenshot: true,
    badgeKey: "scan.ctx.screenshot.badge",
    headingKey: "scan.ctx.chat.heading",
    subtitleKey: "scan.ctx.chat.subtitle",
    placeholderKey: "scan.ctx.chat.placeholder",
    actionKey: "scan.ctx.chat.action",
    idleKey: "scan.ctx.chat.idle",
    sourceTitleKey: "scan.ctx.chat.sourcetitle",
    historyType: "screenshot",
  },
  link: {
    iconClass: "link-icon",
    badgeIcon: '<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',
    focus: "text",
    showText: true,
    showScreenshot: false,
    badgeKey: "scan.ctx.link.badge",
    headingKey: "scan.ctx.link.heading",
    subtitleKey: "scan.ctx.link.subtitle",
    placeholderKey: "scan.ctx.link.placeholder",
    actionKey: "scan.ctx.link.action",
    idleKey: "scan.ctx.link.idle",
    sourceTitleKey: "scan.ctx.link.sourcetitle",
    historyType: "link",
  },
  rekening: {
    iconClass: "rekening-icon",
    badgeIcon: '<path d="M3 6h18v13H3z"/><circle cx="10" cy="11" r="2.5"/><path d="M6 17c.8-2 2.2-3 4-3s3.2 1 4 3m3-6h2"/>',
    focus: "quick",
    showText: true,
    showScreenshot: false,
    quickFields: "rekening",
    badgeKey: "scan.ctx.rekening.badge",
    headingKey: "scan.ctx.rekening.heading",
    subtitleKey: "scan.ctx.rekening.subtitle",
    placeholderKey: "scan.ctx.rekening.placeholder",
    actionKey: "scan.ctx.rekening.action",
    idleKey: "scan.ctx.rekening.idle",
    sourceTitleKey: "scan.ctx.rekening.sourcetitle",
    historyType: "rekening",
  },
  pembayaran: {
    iconClass: "pembayaran-icon",
    badgeIcon: '<path d="M4 6h16v14H4z"/><path d="M4 9h16m-6 5h3"/>',
    focus: "quick",
    showText: true,
    showScreenshot: false,
    quickFields: "pembayaran",
    badgeKey: "scan.ctx.pembayaran.badge",
    headingKey: "scan.ctx.pembayaran.heading",
    subtitleKey: "scan.ctx.pembayaran.subtitle",
    placeholderKey: "scan.ctx.pembayaran.placeholder",
    actionKey: "scan.ctx.pembayaran.action",
    idleKey: "scan.ctx.pembayaran.idle",
    sourceTitleKey: "scan.ctx.pembayaran.sourcetitle",
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
    return `${tf("scan.quick.composerekening", { number })}${extra ? ` ${extra}` : ""}`;
  }
  if (config.quickFields === "pembayaran") {
    const amount = $("#quick-pay-amount")?.value.trim() || "";
    const name = $("#quick-pay-name")?.value.trim() || "";
    if (!amount && !name) return "";
    const amountText = amount ? `Rp${amount}` : t("scan.quick.payamountempty");
    const nameText = name || t("scan.quick.paynameempty");
    return `${tf("scan.quick.composepay", { name: nameText, amount: amountText })}${extra ? ` ${extra}` : ""}`;
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
      findings.push(t("scan.quick.rekeningshort"));
      bonus += 1;
    } else if (digits && /^(\d)\1+$/.test(digits)) {
      findings.push(t("scan.quick.rekeningrepeated"));
      bonus += 2;
    }
  }
  if (config?.quickFields === "pembayaran") {
    const amount = Number(($("#quick-pay-amount")?.value || "").replace(/\D/g, ""));
    if (amount >= 5000000) {
      findings.push(t("scan.quick.paylarge"));
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
  if (badgeLabel) badgeLabel.textContent = t(config.badgeKey);
  if (badgeSvg) badgeSvg.innerHTML = config.badgeIcon;

  const icon = $("#conversation-icon");
  if (icon) {
    icon.classList.remove("chat-icon", "link-icon", "rekening-icon", "pembayaran-icon", "screenshot-icon");
    icon.classList.add(config.iconClass);
    icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${config.badgeIcon}</svg>`;
  }

  const headingEl = $("#conversation-title");
  const subtitleEl = $("#conversation-subtitle");
  if (headingEl) headingEl.textContent = t(config.headingKey);
  if (subtitleEl) subtitleEl.textContent = t(config.subtitleKey);
  if (conversationInput) conversationInput.placeholder = t(config.placeholderKey);

  const actionLabelEl = $("#chat-text-analyze-label");
  if (actionLabelEl) actionLabelEl.textContent = t(config.actionKey);
  if (!getComposedText().trim()) {
    setStatus(conversationStatus, t(config.idleKey));
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

document.addEventListener("amanin:langchange", () => {
  applyChatContext(currentContext);
  conversationCount.textContent = `${conversationInput.value.length} / 2000 ${t("scan.charcount")}`;
});

window.addEventListener("hashchange", () => setMode(getInitialMode(), false));
const initialMode = getInitialMode();
setMode(initialMode, false);
if (initialMode !== "qr") {
  const context = getRequestedContext();
  const config = applyChatContext(context);
  focusChatTarget(config.focus);
}

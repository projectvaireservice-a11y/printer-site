const SUPABASE_BASE_URL = "https://wxkqfkjaretsqzdfnzhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4a3Fma2phcmV0c3F6ZGZuemh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDM1NTMsImV4cCI6MjA5OTI3OTU1M30.7ztRTIZM9ytG9LLCFE5pvVTEpV9re5IrxIomMrJxVKw";
const TELEGRAM_BOT_TOKEN = "8998606162:AAE_prALU6AkZqWQ_bQV4mjXNqaji1Uw-rk";
const TELEGRAM_CHAT_ID = "935909798";

let clientPhone = "";
let clientData = null;
let clientPrinters = [];
let qrPrinterId = "";

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_BASE_URL, SUPABASE_ANON_KEY)
  : null;

const normalizePhone = (value) => String(value || "").trim();

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function setBusy(button, isBusy, busyText, idleText) {
  if (!button) return;
  button.disabled = isBusy;
  button.textContent = isBusy ? busyText : idleText;
}

function showSuccess(message) {
  const toast = document.getElementById("successToast");
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

async function requestRest(path, options = {}) {
  return fetch(`${SUPABASE_BASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

async function sendTelegramRequest({ selectedPrinters, serviceType, visitTime, comment }) {
  const address = selectedPrinters.find((printer) => printer.location_note || printer.address || printer.street)?.location_note
    || selectedPrinters.find((printer) => printer.location_note || printer.address || printer.street)?.address
    || selectedPrinters.find((printer) => printer.location_note || printer.address || printer.street)?.street
    || clientData?.address
    || clientData?.street
    || "Не указан";
  const printerLines = selectedPrinters
    .map((printer) => `• ${escapeHtml(printer.model || "Модель не указана")} (${escapeHtml(printer.id)})`)
    .join("\n");

  const text = [
    "<b>Новая заявка на обслуживание принтера</b>",
    "",
    `<b>Клиент:</b> ${escapeHtml(clientData?.name || "Не указан")}`,
    `<b>Телефон:</b> ${escapeHtml(clientPhone)}`,
    `<b>Адрес:</b> ${escapeHtml(address)}`,
    `<b>Услуга:</b> ${escapeHtml(serviceType)}`,
    `<b>Время:</b> ${escapeHtml(visitTime)}`,
    `<b>Комментарий:</b> ${escapeHtml(comment || "Без комментария")}`,
    "",
    "<b>Принтеры:</b>",
    printerLines
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML"
    })
  });

  console.log("Telegram API status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram API error ${response.status}: ${errorText}`);
  }
}

function generatePrinterId() {
  return "PR-" + Math.floor(100 + Math.random() * 900);
}

// generator.html: admin/master QR generation.
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("nameInput")?.value.trim() || "";
    const phone = normalizePhone(document.getElementById("phoneInput")?.value);
    const model = document.getElementById("modelInput")?.value.trim() || "";
    const cartridge = document.getElementById("cartridgeNumber")?.value.trim() || "Не указан";
    const address = document.getElementById("addressInput")?.value.trim() || "";
    const printerId = generatePrinterId();
    const submitBtn = orderForm.querySelector('button[type="submit"]');

    if (!name || !phone || !model || !address) {
      alert("Заполните имя, телефон, модель принтера и адрес.");
      return;
    }

    setBusy(submitBtn, true, "Сохраняем...", "Сгенерировать и отправить в базу");

    try {
      const clientResponse = await requestRest("clients?on_conflict=phone", {
        method: "POST",
        headers: { "Prefer": "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ name, phone, address })
      });

      if (!clientResponse.ok) throw new Error("Client upsert failed");

      const printerResponse = await requestRest("printers", {
        method: "POST",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({
          id: printerId,
          phone,
          model,
          cartridge_number: cartridge,
          address,
          status: "Новый",
        })
      });

      if (!printerResponse.ok) throw new Error("Printer insert failed");

      const baseUrl = window.location.href.replace(/[^/]*$/, "").replace(/\/$/, "");
      const fullUrl = `${baseUrl}/index.html?phone=${encodeURIComponent(phone)}&printer_id=${encodeURIComponent(printerId)}`;
      const qrContainer = document.getElementById("qrcode");
      const qrResult = document.getElementById("qrResult");
      const qrUrl = document.getElementById("qrUrl");
      const qrPrinterId = document.getElementById("qrPrinterId");

      if (qrContainer) {
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, { text: fullUrl, width: 200, height: 200 });
      }

      if (qrPrinterId) qrPrinterId.textContent = `ID: ${printerId}`;
      if (qrUrl) qrUrl.innerHTML = `<a href="${fullUrl}" target="_blank" rel="noopener">${fullUrl}</a>`;
      if (qrResult) qrResult.classList.remove("hidden");
      qrResult?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      console.error("Ошибка генерации QR:", error);
      alert("Не удалось сохранить клиента или принтер. Проверьте настройки Supabase.");
    } finally {
      setBusy(submitBtn, false, "Сохраняем...", "Сгенерировать и отправить в базу");
    }
  });
}

// generator.html: quick maintenance history update.
const saveServiceBtn = document.getElementById("saveServiceBtn");
if (saveServiceBtn) {
  saveServiceBtn.addEventListener("click", async () => {
    const printerId = document.getElementById("updatePrinterId")?.value.trim();
    const serviceText = document.getElementById("updateServiceText")?.value.trim();

    if (!printerId || !serviceText) {
      alert("Введите ID принтера и описание проведенных работ.");
      return;
    }

    setBusy(saveServiceBtn, true, "Сохраняем...", "Сохранить обслуживание");

    try {
      const response = await requestRest(`printers?id=eq.${encodeURIComponent(printerId)}`, {
        method: "PATCH",
        headers: { "Prefer": "return=minimal" },
        body: JSON.stringify({ last_service: serviceText })
      });

      if (!response.ok) throw new Error("Service update failed");
      alert("История обслуживания успешно обновлена!");
    } catch (error) {
      console.error("Ошибка обновления обслуживания:", error);
      alert("Не удалось обновить историю обслуживания. Попробуйте позже.");
    } finally {
      setBusy(saveServiceBtn, false, "Сохраняем...", "Сохранить обслуживание");
    }
  });
}

function openModal() {
  const modal = document.getElementById("addPrinterModal");
  const input = document.getElementById("newPrinterModel");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => input?.focus(), 0);
}

function closeModal() {
  const modal = document.getElementById("addPrinterModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  ["newPrinterModel", "newPrinterCartridge", "newPrinterLocation"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });
}

function renderPrinters() {
  const printerList = document.getElementById("printerList");
  if (!printerList) return;

  if (!clientPrinters.length) {
    printerList.innerHTML = `<div class="empty-state">Принтеров пока нет. Добавьте первый принтер, чтобы создать заявку.</div>`;
    return;
  }

  printerList.innerHTML = clientPrinters.map((printer) => {
    const id = printer.id ?? "";
    const model = printer.model || "Модель не указана";
    const cartridge = printer.cartridge_number ? `Картридж: ${printer.cartridge_number}` : "Картридж не указан";
    const checked = String(id) === String(qrPrinterId) ? "checked" : "";

    return `
      <label class="printer-item">
        <input type="checkbox" name="printerIds" value="${id}" ${checked}>
        <span>
          <span class="printer-name">${model}</span>
          <span class="printer-meta">${cartridge}</span>
        </span>
      </label>
    `;
  }).join("");
}

async function resolvePhoneFromUrl() {
  const params = new URLSearchParams(window.location.search);
  clientPhone = normalizePhone(params.get("phone"));
  qrPrinterId = normalizePhone(params.get("printer_id"));

  if (clientPhone || !qrPrinterId) return;

  const result = await supabaseClient
    .from("printers")
    .select("phone")
    .eq("id", qrPrinterId)
    .maybeSingle();

  if (result.error) throw result.error;
  clientPhone = normalizePhone(result.data?.phone);
}

async function loadClient() {
  if (!supabaseClient) throw new Error("Supabase SDK is not loaded");

  await resolvePhoneFromUrl();
  if (!clientPhone) throw new Error("Phone is missing");

  const clientResult = await supabaseClient
    .from("clients")
    .select("*")
    .eq("phone", clientPhone)
    .maybeSingle();

  if (clientResult.error) throw clientResult.error;
  clientData = clientResult.data || { phone: clientPhone, name: "клиент" };

  const greeting = document.getElementById("clientGreeting");
  if (greeting) greeting.textContent = `Здравствуйте, ${clientData.name || "клиент"}`;

  const consultationLink = document.getElementById("consultationLink");
  if (consultationLink) {
    const cleanPhone = clientPhone.replace(/\D/g, "");
    consultationLink.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Здравствуйте, нужна консультация")}`;
  }

  await Promise.all([loadPrinters(), loadLastRequest()]);
}

async function loadPrinters() {
  const result = await supabaseClient
    .from("printers")
    .select("*")
    .eq("phone", clientPhone)
    .order("created_at", { ascending: false });

  if (result.error) throw result.error;
  clientPrinters = result.data || [];
  renderPrinters();
}

async function loadLastRequest() {
  const result = await supabaseClient
    .from("service_history")
    .select("*")
    .eq("phone", clientPhone)
    .order("created_at", { ascending: false })
    .limit(1);

  if (result.error) throw result.error;

  const status = document.getElementById("lastRequestStatus");
  if (!status) return;

  const lastRequest = result.data?.[0];
  if (!lastRequest) {
    status.textContent = "Заявок пока нет";
    return;
  }

  status.textContent = `${lastRequest.service_type || "Заявка"} · ${lastRequest.visit_time || "Время не указано"}`;
}

async function addPrinter() {
  const modelInput = document.getElementById("newPrinterModel");
  const cartridgeInput = document.getElementById("newPrinterCartridge");
  const locationInput = document.getElementById("newPrinterLocation");
  const button = document.getElementById("savePrinterBtn");

  const model = modelInput?.value.trim();
  const cartridge = cartridgeInput?.value.trim() || null;
  const location = locationInput?.value.trim() || null;

  if (!model) {
    alert("Введите модель принтера.");
    return;
  }

  setBusy(button, true, "Сохраняем...", "Сохранить");

  try {
    const result = await supabaseClient
      .from("printers")
      .insert({
        id: generatePrinterId(),
        phone: clientPhone,
        model,
        cartridge_number: cartridge,
        address: location,
        location_note: location,
        status: "Новый"
      })
      .select()
      .single();

    if (result.error) throw result.error;

    qrPrinterId = result.data.id;
    await loadPrinters();
    closeModal();
  } catch (error) {
    console.error("Ошибка добавления принтера:", error);
    alert("Не удалось добавить принтер. Попробуйте позже.");
  } finally {
    setBusy(button, false, "Сохраняем...", "Сохранить");
  }
}

async function submitClientRequest(event) {
  event.preventDefault();

  const button = document.getElementById("submitRequestBtn");
  const checkedPrinters = Array.from(document.querySelectorAll('input[name="printerIds"]:checked'));
  const serviceType = document.querySelector('input[name="serviceType"]:checked')?.value || "Замена картриджа";
  const selectedVisitTime = document.getElementById("visitTimeSelect")?.value || "В течение дня";
  const customVisitTime = document.getElementById("customVisitTimeInput")?.value.trim() || "";
  const visitTime = selectedVisitTime === "custom" ? (customVisitTime || "Не указано") : selectedVisitTime;
  const comment = document.getElementById("commentInput")?.value.trim() || "";

  if (!checkedPrinters.length) {
    alert("Выберите хотя бы один принтер.");
    return;
  }

  const selectedIds = new Set(checkedPrinters.map((item) => String(item.value)));
  const selectedPrinters = clientPrinters.filter((printer) => selectedIds.has(String(printer.id)));

  const rows = selectedPrinters.map((printer) => ({
    printer_id: printer.id,
    phone: clientPhone,
    service_type: serviceType,
    problem_description: comment || serviceType,
    visit_time: visitTime,
    comment
  }));

  setBusy(button, true, "Отправляем...", "Отправить заявку");

  try {
    const historyResult = await supabaseClient
      .from("service_history")
      .insert(rows);

    if (historyResult.error) throw historyResult.error;

    const statusResult = await supabaseClient
      .from("printers")
      .update({ status: "Заявка отправлена" })
      .in("id", Array.from(selectedIds));

    if (statusResult.error) throw statusResult.error;

    await sendTelegramRequest({ selectedPrinters, serviceType, visitTime, comment });

    document.getElementById("clientRequestForm")?.reset();
    const customVisitTimeInput = document.getElementById("customVisitTimeInput");
    if (customVisitTimeInput) {
      customVisitTimeInput.value = "";
      customVisitTimeInput.classList.add("hidden");
    }
    qrPrinterId = "";
    await Promise.all([loadPrinters(), loadLastRequest()]);
    showSuccess("Заявка успешно принята!");
  } catch (error) {
    console.error("Ошибка отправки заявки:", error);
    alert("Не удалось отправить заявку. Попробуйте позже.");
  } finally {
    setBusy(button, false, "Отправляем...", "Отправить заявку");
  }
}

async function initClientRequestApp() {
  const app = document.getElementById("clientRequestApp");
  if (!app) return;

  const loading = document.getElementById("loadingState");
  const error = document.getElementById("errorState");
  const content = document.getElementById("mainContent");

  document.getElementById("addPrinterBtn")?.addEventListener("click", openModal);
  document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("savePrinterBtn")?.addEventListener("click", addPrinter);
  document.getElementById("clientRequestForm")?.addEventListener("submit", submitClientRequest);
  document.getElementById("visitTimeSelect")?.addEventListener("change", (event) => {
    const customInput = document.getElementById("customVisitTimeInput");
    if (!customInput) return;
    customInput.classList.toggle("hidden", event.target.value !== "custom");
    if (event.target.value === "custom") customInput.focus();
  });
  document.getElementById("addPrinterModal")?.addEventListener("click", (event) => {
    if (event.target.id === "addPrinterModal") closeModal();
  });

  try {
    await loadClient();
    loading?.classList.add("hidden");
    content?.classList.remove("hidden");
  } catch (reason) {
    console.error("Ошибка загрузки клиента:", reason);
    loading?.classList.add("hidden");
    error?.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", initClientRequestApp);

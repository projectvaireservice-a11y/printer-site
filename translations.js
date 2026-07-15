let translations = {};

const fallbackTranslations = {
  ru: {
    page_title: "Заявка на обслуживание принтера",
    greeting_title: "Приветствие",
    greeting_default: "Здравствуйте!",
    greeting: "Здравствуйте",
    client: "клиент",
    office_schedule: "Офис и график работы",
    office_time: "Ежедневно",
    office_address: "Богенбай батыр 23, 2-й этаж, 1-3 кабинет",
    hero_title: "Сервис по заправке картриджей",
    hero_slogan: "Заправка без забот",
    hero_subtitle: "Приезжаем, меняем картридж, и вы продолжаете работу.",
    benefit_1: "Быстрый выезд<br>в день заявки",
    benefit_2: "Замена картриджа<br>за 3-5 минут",
    benefit_3: "Обменный фонд<br>всегда в наличии",
    benefit_4: "Гарантия качества<br>на все услуги",
    how_we_work: "Как мы работаем",
    step_1: "1. Заявка",
    step_1_desc: "Заказ на сайте или WhatsApp",
    step_2: "2. Выезд",
    step_2_desc: "Мастер едет к вам",
    step_3: "3. Замена",
    step_3_desc: "Меняем картридж за 3-5 минут",
    step_4: "4. Работаем",
    step_4_desc: "Вы продолжаете печать",
    loading_client: "Загружаем данные клиента...",
    load_error: "Не удалось загрузить данные. Проверьте ссылку с номером телефона.",
    last_request: "Последняя заявка",
    no_info: "Информация отсутствует",
    no_requests: "Заявок пока нет",
    request: "Заявка",
    time_not_set: "Время не указано",
    leave_request: "Оставить заявку",
    step1_title: "1. Выберите принтер",
    step2_title: "2. Выберите услугу (можно несколько)",
    service_refill: "Нужна замена картриджа",
    service_repair: "Принтер сломался / ремонт",
    service_consult: "Консультация",
    add_printer: "+ Добавить новый принтер",
    step3_title: "3. Комментарий",
    comment_placeholder: "Опишите проблему, удобный вход или дополнительные детали",
    step4_title: "4. Удобное время выезда",
    custom_time_placeholder: "Например: после 17:00 или завтра к 14:30",
    send_request: "Отправить заявку",
    modal_add_printer: "Добавить принтер",
    printer_model_placeholder: "Модель принтера, например Canon LBP6030",
    cartridge_placeholder: "Номер картриджа, например CF259A",
    location_placeholder: "Кабинет или адрес, например каб. 104",
    cancel: "Отмена",
    save: "Сохранить",
    saving: "Сохраняем...",
    sending: "Отправляем...",
    modal_consult: "Консультация с мастером",
    consult_desc: "Желаете перейти в WhatsApp для личной консультации с мастером?",
    success_toast: "Заявка успешно принята!",
    empty_printers: "Принтеров пока нет. Добавьте первый принтер, чтобы создать заявку.",
    unknown_model: "Модель не указана",
    cartridge_label: "Картридж",
    cartridge_missing: "Картридж не указан",
    model_required: "Введите модель принтера.",
    choose_printer: "Выберите хотя бы один принтер.",
    submit_error: "Не удалось отправить заявку. Попробуйте позже.",
    add_printer_error: "Не удалось добавить принтер. Попробуйте позже.",
    time_1: "Сегодня до 12:00",
    time_2: "Сегодня 12:00 - 15:00",
    time_3: "Сегодня 15:00 - 18:00",
    time_4: "Завтра до 12:00",
    time_5: "Завтра 12:00 - 15:00",
    time_6: "Завтра 15:00 - 18:00",
    time_7: "В течение дня",
    time_8: "Указать свое время"
  },
  kk: {
    page_title: "Принтерге қызмет көрсетуге өтінім",
    greeting_title: "Сәлемдесу",
    greeting_default: "Сәлеметсіз бе!",
    greeting: "Сәлеметсіз бе",
    client: "клиент",
    office_schedule: "Кеңсе және жұмыс кестесі",
    office_time: "Күнделікті",
    office_address: "Бөгенбай батыр 23, 2-қабат, 1-3 кабинет",
    hero_title: "Картридждерді толтыру қызметі",
    hero_slogan: "Уайымсыз толтыру",
    hero_subtitle: "Келеміз, картриджді ауыстырамыз, сіз жұмысыңызды жалғастырасыз.",
    benefit_1: "Өтінім берілген күні<br>жылдам шығу",
    benefit_2: "Картриджді<br>3-5 минутта ауыстыру",
    benefit_3: "Ауыстыру қоры<br>әрдайым бар",
    benefit_4: "Барлық қызметке<br>сапа кепілдігі",
    how_we_work: "Біз қалай жұмыс істейміз",
    step_1: "1. Өтінім",
    step_1_desc: "Сайтта немесе WhatsApp арқылы тапсырыс",
    step_2: "2. Шығу",
    step_2_desc: "Маман сізге келеді",
    step_3: "3. Ауыстыру",
    step_3_desc: "Картриджді 3-5 минутта ауыстырамыз",
    step_4: "4. Жұмыс",
    step_4_desc: "Сіз басып шығаруды жалғастырасыз",
    loading_client: "Клиент деректері жүктелуде...",
    load_error: "Деректерді жүктеу мүмкін болмады. Телефон нөмірі бар сілтемені тексеріңіз.",
    last_request: "Соңғы өтінім",
    no_info: "Ақпарат жоқ",
    no_requests: "Әзірге өтінім жоқ",
    request: "Өтінім",
    time_not_set: "Уақыт көрсетілмеген",
    leave_request: "Өтінім қалдыру",
    step1_title: "1. Принтерді таңдаңыз",
    step2_title: "2. Қызметті таңдаңыз (бірнешеуін таңдауға болады)",
    service_refill: "Картриджді ауыстыру қажет",
    service_repair: "Принтер бұзылды / жөндеу",
    service_consult: "Кеңес алу",
    add_printer: "+ Жаңа принтер қосу",
    step3_title: "3. Түсініктеме",
    comment_placeholder: "Мәселені, ыңғайлы кіру жолын немесе қосымша мәліметтерді сипаттаңыз",
    step4_title: "4. Шығуға ыңғайлы уақыт",
    custom_time_placeholder: "Мысалы: 17:00-ден кейін немесе ертең 14:30-ға",
    send_request: "Заявка жіберу",
    modal_add_printer: "Принтер қосу",
    printer_model_placeholder: "Принтер моделі, мысалы Canon LBP6030",
    cartridge_placeholder: "Картридж нөмірі, мысалы CF259A",
    location_placeholder: "Кабинет немесе мекенжай, мысалы каб. 104",
    cancel: "Болдырмау",
    save: "Сақтау",
    saving: "Сақталуда...",
    sending: "Жіберілуде...",
    modal_consult: "Маманнан кеңес алу",
    consult_desc: "Маманмен жеке кеңесу үшін WhatsApp-қа өтесіз бе?",
    success_toast: "Өтінім сәтті қабылданды!",
    empty_printers: "Әзірге принтер жоқ. Өтінім жасау үшін бірінші принтерді қосыңыз.",
    unknown_model: "Модель көрсетілмеген",
    cartridge_label: "Картридж",
    cartridge_missing: "Картридж көрсетілмеген",
    model_required: "Принтер моделін енгізіңіз.",
    choose_printer: "Кемінде бір принтерді таңдаңыз.",
    submit_error: "Өтінімді жіберу мүмкін болмады. Кейінірек қайталап көріңіз.",
    add_printer_error: "Принтерді қосу мүмкін болмады. Кейінірек қайталап көріңіз.",
    time_1: "Бүгін 12:00-ге дейін",
    time_2: "Бүгін 12:00 - 15:00",
    time_3: "Бүгін 15:00 - 18:00",
    time_4: "Ертең 12:00-ге дейін",
    time_5: "Ертең 12:00 - 15:00",
    time_6: "Ертең 15:00 - 18:00",
    time_7: "Күн ішінде",
    time_8: "Өз уақытыңызды көрсету"
  }
};

function getSavedLang() {
  return localStorage.getItem("site_lang") || "ru";
}

function t(key, fallback = "") {
  const lang = getSavedLang();
  return translations?.[lang]?.[key] || fallbackTranslations?.[lang]?.[key] || fallbackTranslations.ru[key] || fallback || key;
}

async function loadTranslations() {
  try {
    const [ruResponse, kkResponse] = await Promise.all([
      fetch("ru.json"),
      fetch("kk.json")
    ]);

    translations = {
      ru: await ruResponse.json(),
      kk: await kkResponse.json()
    };
  } catch (error) {
    translations = fallbackTranslations;
  }
}

function setLang(lang) {
  localStorage.setItem("site_lang", lang);
  updateLangUI(lang);
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

function updateLangUI(lang = getSavedLang()) {
  const dict = translations[lang] || fallbackTranslations[lang] || fallbackTranslations.ru;
  document.documentElement.lang = lang === "kk" ? "kk" : "ru";

  if (dict.page_title) {
    document.title = dict.page_title;
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.innerHTML = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (dict[key]) el.setAttribute("aria-label", dict[key]);
  });

  document.querySelectorAll("option[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-lang]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-lang") === lang);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadTranslations();
  const lang = getSavedLang();
  updateLangUI(lang);
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
});

window.setLang = setLang;
window.t = t;

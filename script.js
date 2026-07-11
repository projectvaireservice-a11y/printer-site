const SUPABASE_BASE_URL = "https://wxkqfkjaretsqzdfnzhw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4a3Fma2phcmV0c3F6ZGZuemh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MDM1NTMsImV4cCI6MjA5OTI3OTU1M30.7ztRTIZM9ytG9LLCFE5pvVTEpV9re5IrxIomMrJxVKw";
const TELEGRAM_BOT_TOKEN = "8998606162:AAE_prALU6AkZqWQ_bQV4mjXNqaji1Uw-rk";
const TELEGRAM_CHAT_ID = "935909798";

let currentPrinterId = null;
let currentPrinterData = null;

function escapeTelegramMarkdown(text) {
    return String(text || '—').replace(/([_*`\[])/g, '\\$1');
}

// 1. ОТПРАВКА ДАННЫХ ИЗ ГЕНЕРАТОРА (generator.html)
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('nameInput');
        const modelInput = document.getElementById('modelInput');
        const addressInput = document.getElementById('addressInput');

        const name = nameInput ? nameInput.value.trim() : '';
        const model = modelInput ? modelInput.value.trim() : '';
        const address = addressInput ? addressInput.value.trim() : '';
        const textId = 'PR-' + Math.floor(100 + Math.random() * 900);

        const submitBtn = orderForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Сохраняем…';
        }

        try {
            const response = await fetch(`${SUPABASE_BASE_URL}/rest/v1/printers`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    id: textId,
                    model: model,
                    address: address,
                    status: 'Новый',
                    name: name
                })
            });

            if (response.ok) {
                const baseUrl = window.location.href.replace(/[^/]*$/, '').replace(/\/$/, '');
                const fullUrl = `${baseUrl}/index.html?id=${textId}`;
                const qrContainer = document.getElementById('qrcode');
                const qrResult = document.getElementById('qrResult');
                const qrUrl = document.getElementById('qrUrl');
                const qrPrinterId = document.getElementById('qrPrinterId');

                if (qrContainer) {
                    qrContainer.innerHTML = '';
                    new QRCode(qrContainer, {
                        text: fullUrl,
                        width: 200,
                        height: 200
                    });
                }

                if (qrPrinterId) {
                    qrPrinterId.textContent = `ID: ${textId}`;
                }

                if (qrUrl) {
                    qrUrl.innerHTML = `<a href="${fullUrl}" target="_blank" rel="noopener">${fullUrl}</a>`;
                }

                if (qrResult) {
                    qrResult.classList.remove('hidden');
                }

                qrResult?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                alert('Ошибка при отправке данных в базу.');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Не удалось связаться с базой данных.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Сгенерировать и отправить в базу';
            }
        }
    });
}

// 2. ПОЛУЧЕНИЕ ДАННЫХ И ОТОБРАЖЕНИЕ (index.html)
async function loadPrinterData() {
    const urlParams = new URLSearchParams(window.location.search);
    const printerId = urlParams.get('id');

    const removeLoader = () => {
        const loader = document.getElementById('loader')
                    || document.getElementById('loading')
                    || document.querySelector('.loader')
                    || document.querySelector('.loading-state');
        if (loader) {
            loader.remove();
        }
    };

    const errorBlock = document.getElementById('error');
    const contentBlock = document.getElementById('content');
    const infoText = document.getElementById('info-text');
    const greetingText = document.getElementById('greeting-text');

    if (!printerId) {
        removeLoader();
        if (errorBlock) errorBlock.classList.remove('hidden');
        return;
    }

    currentPrinterId = printerId;

    try {
        const response = await fetch(`${SUPABASE_BASE_URL}/rest/v1/printers?id=eq.${printerId}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const data = await response.json();

        removeLoader();

        if (data && data.length > 0) {
            const printer = data[0];
            currentPrinterData = printer;

            if (greetingText && printer.name) {
                greetingText.textContent = `Здравствуйте, ${printer.name}!`;
            }

            if (infoText) {
                const responsible = printer.name || '—';
                infoText.innerHTML = `
                    <span class="highlight">Модель:</span> ${printer.model}<br>
                    <span class="highlight">Адрес:</span> ${printer.address}<br>
                    <span class="highlight">Ответственный:</span> ${responsible} · <span class="highlight">Статус:</span> ${printer.status}
                `;
            }

            if (contentBlock) {
                contentBlock.classList.remove('hidden');
            }
        } else {
            if (errorBlock) errorBlock.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        removeLoader();
        if (errorBlock) errorBlock.classList.remove('hidden');
    }
}

// 3. ОТПРАВКА ЗАЯВКИ КЛИЕНТОМ (index.html)
async function submitRequest() {
    if (!currentPrinterId || !currentPrinterData) return;

    const submitBtn = document.getElementById('submit-btn');
    const commentField = document.getElementById('comment');
    const infoText = document.getElementById('info-text');
    const activeTab = document.querySelector('.tab.active');

    const problemType = activeTab ? activeTab.textContent.trim() : 'Не указана';
    const comment = commentField ? commentField.value.trim() : '—';
    const printerId = currentPrinterId;
    const model = currentPrinterData.model || '—';
    const address = currentPrinterData.address || '—';
    const name = currentPrinterData.name || '—';

    const message = [
        '🚨 *Новая заявка на обслуживание!*',
        `• *ID принтера:* ${escapeTelegramMarkdown(printerId)}`,
        `• *Модель:* ${escapeTelegramMarkdown(model)}`,
        `• *Адрес:* ${escapeTelegramMarkdown(address)}`,
        `• *Ответственный:* ${escapeTelegramMarkdown(name)}`,
        `• *Проблема:* ${escapeTelegramMarkdown(problemType)}`,
        `• *Комментарий:* ${escapeTelegramMarkdown(comment)}`,
        '• Статус: 🔴 В работе'
    ].join('\n');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем…';
    }

    try {
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [
                                { text: "➡️ Завершить заявку", callback_data: "finish_order" }
                            ]
                        ]
                    })
                })
            }
        );

        let telegramOk = telegramResponse.type === 'opaque';
        if (!telegramOk) {
            const telegramData = await telegramResponse.json();
            telegramOk = telegramData.ok === true;
            if (!telegramOk) {
                throw new Error(telegramData.description || 'Ошибка Telegram API');
            }
        }

        await fetch(`${SUPABASE_BASE_URL}/rest/v1/printers?id=eq.${printerId}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ status: 'Заявка отправлена' })
        });

        currentPrinterData.status = 'Заявка отправлена';
        if (infoText) {
            const responsible = currentPrinterData.name || '—';
            infoText.innerHTML = `
                <span class="highlight">Модель:</span> ${currentPrinterData.model}<br>
                <span class="highlight">Адрес:</span> ${currentPrinterData.address}<br>
                <span class="highlight">Ответственный:</span> ${responsible} · <span class="highlight">Статус:</span> Заявка отправлена
            `;
        }

        if (commentField) commentField.value = '';
        alert('Заявка успешно отправлена! Мастер уже получил уведомление.');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить заявку. Попробуйте позже.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить заявку';
        }
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-selected', 'true');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadPrinterData();

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitRequest);
    }
});

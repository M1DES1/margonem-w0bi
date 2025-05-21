// ==UserScript==
// @name         cosmetica
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Loader i motyw tła w jednym panelu - Cosmetica
// @author       w0bise
// @match        https://*.margonem.pl/
// @grant        GM_addStyle
// @updateURL    https://github.com/M1DES1/margonem-w0bi/raw/refs/heads/main/cosmetica.user.js
// @downloadURL  https://github.com/M1DES1/margonem-w0bi/raw/refs/heads/main/cosmetica.user.js
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_IMAGE = 'custom-loader-url';
    const STORAGE_LOADER_ENABLED = 'custom-loader-enabled';
    const STORAGE_ENABLED = 'motywEnabled';
    const STORAGE_URL = 'motywBackgroundURL';

    // Pobieramy ustawienia z localStorage
    let savedUrl = localStorage.getItem(STORAGE_IMAGE);
    let loaderEnabled = localStorage.getItem(STORAGE_LOADER_ENABLED);
    if (loaderEnabled === null) loaderEnabled = 'true';

    let isEnabled = localStorage.getItem(STORAGE_ENABLED) === 'true';
    let backgroundURL = localStorage.getItem(STORAGE_URL) || '';

    // Jeśli motyw był włączony i jest URL, stosujemy od razu styl
    if (isEnabled && backgroundURL) {
        applyStyles();
    }

    // Loader obrazka wczytywania, jeśli włączony i jest URL
    if (loaderEnabled === 'true' && savedUrl) {
        const customLoading = document.createElement('div');
        customLoading.id = 'custom-loading-screen';
        customLoading.innerHTML = `
            <div class="loading-box">
                <div class="loader-text">Wczytywanie</div>
                <img src="${savedUrl}" alt="Loading..." class="loader-image"/>
                <progress id="purple-loader" max="100" value="1"></progress>
            </div>
        `;
        document.body.appendChild(customLoading);

        let progress = 1;
        const progressBar = document.getElementById('purple-loader');
        const interval = setInterval(() => {
            if (progress < 100) {
                progress += 5;
                if (progress > 100) progress = 100;
                progressBar.value = progress;
            }
        }, 30);

        window.addEventListener('load', () => {
            setTimeout(() => {
                clearInterval(interval);
                document.getElementById('custom-loading-screen')?.remove();
            }, 1500);
        });
    }

    // Funkcja dodająca style motywu
    function applyStyles() {
        removeStyles();
        const style = document.createElement('style');
        style.id = 'motyw-style';
        style.textContent = `
            html, body, #root {
                background-image: url('${backgroundURL}') !important;
                background-size: cover !important;
                background-position: center center !important;
                background-attachment: fixed !important;
            }

            .chat-message-wrapper,
            .equipment,
            .bags-navigation-bg,
            .bags-navigation,
            .loot-items,
            .right-column.main-column,
            .top.positioner,
            .bottom.positioner,
            .equipment-item {
                background-image: url('${backgroundURL}') !important;
                background-size: cover !important;
                background-position: center center !important;
                background-attachment: fixed !important;
                position: relative;
                z-index: 1;
            }

            .chat-message-wrapper::before,
            .equipment::before,
            .bags-navigation-bg::before,
            .bags-navigation::before,
            .loot-items::before,
            .right-column.main-column::before,
            .top.positioner::before,
            .bottom.positioner::before,
            .equipment-item::before {
                content: "";
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.4);
                pointer-events: none;
                z-index: 0;
            }

            .chat-message,
            .chat-message * {
                color: #fff !important;
                background: transparent !important;
                text-shadow: 0 0 3px rgba(0,0,0,0.8);
            }
        `;
        document.head.appendChild(style);
    }

    // Usuwa style motywu (jeśli istnieją)
    function removeStyles() {
        const style = document.getElementById('motyw-style');
        if (style) style.remove();
    }

    // Przełącza motyw: włącz/wyłącz, zmienia stan przycisków i zapisuje w localStorage
    function toggleMotyw(enabled, applyBtn, input) {
        isEnabled = enabled;
        localStorage.setItem(STORAGE_ENABLED, String(enabled));
        if (enabled) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = 'Zastosuj';
            input.disabled = false;
            if (backgroundURL) applyStyles();
        } else {
            applyBtn.disabled = true;
            applyBtn.innerHTML = '🔒 Zablokowane';
            input.disabled = true;
            removeStyles();
        }
    }

    // Tworzy panel kontrolny Cosmetica z loaderem i motywem
    function showMainPanel() {
        if (document.getElementById('main-control-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'main-control-panel';
        panel.innerHTML = `
            <div class="panel-inner">
                <button id="close-main-panel" title="Zamknij panel" aria-label="Zamknij panel">&times;</button>
                <h2>Panel Cosmetica - Loader i Motyw</h2>

                <section>
                    <h3>Loader Obraz Wczytywania</h3>
                    <input type="text" id="loader-url" placeholder="https://..." value="${savedUrl ?? ''}">
                    <button id="save-loader">Zapisz URL</button>
                    <label class="switch-label" title="Włącz/wyłącz loader">
                        <input type="checkbox" id="loader-enable-switch" ${loaderEnabled === 'true' ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </section>

                <hr style="margin: 20px 0; border-color: #555;">

                <section>
                    <h3>Motyw Tła</h3>
                    <input id="motyw-url" type="text" placeholder="Wklej URL tła" value="${backgroundURL}">
                    <button id="motyw-apply">Zastosuj</button>
                    <label class="switch-label" title="Włącz/wyłącz motyw">
                        <input type="checkbox" id="motyw-switch" ${isEnabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </section>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('close-main-panel').onclick = () => {
            panel.remove();
        };

        const switchLoader = document.getElementById('loader-enable-switch');
        switchLoader.addEventListener('change', () => {
            loaderEnabled = switchLoader.checked ? 'true' : 'false';
            localStorage.setItem(STORAGE_LOADER_ENABLED, loaderEnabled);
            alert(`Loader ${loaderEnabled === 'true' ? 'włączony' : 'wyłączony'}! Odśwież grę, aby zobaczyć efekt.`);
        });

        document.getElementById('save-loader').onclick = () => {
            const url = document.getElementById('loader-url').value.trim();
            if (url && /^https?:\/\/.+\.(gif|jpg|jpeg|png)$/i.test(url)) {
                localStorage.setItem(STORAGE_IMAGE, url);
                savedUrl = url;
                alert('Zapisano! Odśwież grę, aby zobaczyć efekt.');
            } else {
                alert('Niepoprawny URL.');
            }
        };

        const motywSwitch = document.getElementById('motyw-switch');
        const motywApplyBtn = document.getElementById('motyw-apply');
        const motywUrlInput = document.getElementById('motyw-url');

        motywSwitch.addEventListener('change', () => {
            toggleMotyw(motywSwitch.checked, motywApplyBtn, motywUrlInput);
        });

        motywApplyBtn.addEventListener('click', () => {
            const url = motywUrlInput.value.trim();
            if (!url) return alert("Wprowadź URL tła.");
            backgroundURL = url;
            localStorage.setItem(STORAGE_URL, backgroundURL);
            applyStyles();
        });

        toggleMotyw(isEnabled, motywApplyBtn, motywUrlInput);
    }

    // Tworzy przycisk COS do otwierania panelu
    function createToggleButton() {
        if (document.getElementById('toggle-main-panel-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'toggle-main-panel-btn';
        btn.title = 'Pokaż/Ukryj panel Cosmetica';
        btn.textContent = 'COS';
        btn.onclick = () => {
            const panel = document.getElementById('main-control-panel');
            if (panel) {
                panel.remove();
            } else {
                showMainPanel();
            }
        };
        document.body.appendChild(btn);
    }

    // Style CSS dla wszystkiego
    const styleCss = `
        /* przycisk COS */
        #toggle-main-panel-btn {
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 42px;
            height: 22px;
            font-size: 12px;
            font-weight: bold;
            background-color: #007bff;
            color: white;
            border: 1px solid #005cbf;
            border-radius: 5px;
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            cursor: pointer;
        }
        /* loader */
        #custom-loading-screen {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: #000;
            display: flex; align-items: center; justify-content: center;
            z-index: 99999;
        }
        .loading-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
        }
        #custom-loading-screen .loader-text {
            color: white;
            font-size: 1.5rem;
            font-family: sans-serif;
            margin-bottom: 8px;
            user-select: none;
        }
        #custom-loading-screen img.loader-image {
            max-width: 480px;
            max-height: 360px;
            border-radius: 12px;
            margin: 0 0 10px 0;
            user-select: none;
        }
        #custom-loading-screen progress#purple-loader {
            width: 480px;
            height: 16px;
            appearance: none;
            -webkit-appearance: none;
            border-radius: 8px;
            overflow: hidden;
            background-color: #3a065f;
            margin: 0;
        }
        #custom-loading-screen progress#purple-loader::-webkit-progress-bar {
            background-color: #3a065f;
            border-radius: 8px;
        }
        #custom-loading-screen progress#purple-loader::-webkit-progress-value {
            background-color: #8b05fc;
            border-radius: 8px;
        }
        #custom-loading-screen progress#purple-loader::-moz-progress-bar {
            background-color: #8b05fc;
            border-radius: 8px;
        }

        /* przełączniki */
        .switch-label {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 22px;
            margin-left: 10px;
            vertical-align: middle;
            margin-top: 5px;
        }
        .switch-label input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .switch-label .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #ccc;
            border-radius: 22px;
            transition: .4s;
        }
        .switch-label .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            border-radius: 50%;
            transition: .4s;
        }
        .switch-label input:checked + .slider {
            background-color: #28a745;
        }
        .switch-label input:checked + .slider:before {
            transform: translateX(18px);
        }

        /* panel */
        #main-control-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e;
            color: white;
            padding: 20px 25px 30px 25px;
            border-radius: 12px;
            box-shadow: 0 0 15px #8b05fcaa;
            width: 600px;
            max-width: 95vw;
            font-family: sans-serif;
            z-index: 99999999;
        }
        #main-control-panel .panel-inner {
            position: relative;
        }
        #close-main-panel {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 28px;
            font-weight: bold;
            color: #bbb;
            cursor: pointer;
            line-height: 1;
        }
        #main-control-panel h2 {
            margin: 0 0 18px 0;
            font-weight: 700;
            font-size: 24px;
        }
        #main-control-panel h3 {
            margin: 12px 0 6px 0;
            font-weight: 600;
            font-size: 18px;
        }
        #main-control-panel input[type=text] {
            background: #333;
            border: 1px solid #666;
            border-radius: 6px;
            padding: 7px 10px;
            width: calc(100% - 110px);
            color: #fff;
            box-sizing: border-box;
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
        }
        #main-control-panel button {
            margin-left: 8px;
            padding: 7px 14px;
            font-weight: 600;
            font-size: 14px;
            border-radius: 6px;
            border: none;
            display: inline-block;
            vertical-align: middle;
            cursor: pointer;
        }
        #main-control-panel section {
            margin-bottom: 10px;
        }
    `;

    // Dodajemy style do strony
    const styleElem = document.createElement('style');
    styleElem.textContent = styleCss;
    document.head.appendChild(styleElem);

    // Inicjujemy przycisk COS po załadowaniu strony
    window.addEventListener('load', () => {
        createToggleButton();
    });
})();

// ==UserScript==
// @name         w0bi
// @namespace    http://tampermonkey.net/
// @version      1.0beta
// @description  .
// @author       w0bise
// @match        https://*.margonem.pl/
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_IMAGE = 'custom-loader-url';
    const STORAGE_LOADER_ENABLED = 'custom-loader-enabled';

    let savedUrl = localStorage.getItem(STORAGE_IMAGE);
    let loaderEnabled = localStorage.getItem(STORAGE_LOADER_ENABLED);
    if (loaderEnabled === null) loaderEnabled = 'true';

    // === Loader startowy ===
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

    // === Panel Obraz Wczytywania (dawniej W0bi) ===
    function showSettings() {
        if (document.getElementById('custom-loader-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'custom-loader-panel';
        panel.innerHTML = `
            <div class="panel-inner">
                <h2>Panel Obraz Wczytywania</h2>
                <label>🖼️ Obrazek ładowania (URL .gif/.jpg/.png):</label>
                <input type="text" id="loader-url" placeholder="https://..." value="${savedUrl ?? ''}">
                <label class="switch-label">
                    <input type="checkbox" id="loader-enable-switch" ${loaderEnabled === 'true' ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <button id="save-loader" style="margin-top: 10px;">Zapisz URL</button>
                <button id="close-loader" style="margin-top: 10px;">Zamknij</button>
            </div>
        `;
        document.body.appendChild(panel);

        const switchEl = document.getElementById('loader-enable-switch');
        switchEl.addEventListener('change', () => {
            loaderEnabled = switchEl.checked ? 'true' : 'false';
            localStorage.setItem(STORAGE_LOADER_ENABLED, loaderEnabled);
            alert(`Loader ${loaderEnabled === 'true' ? 'włączony' : 'wyłączony'}! Odśwież grę, aby zobaczyć efekt.`);
            const mainSwitch = document.getElementById('main-loader-switch');
            if (mainSwitch) mainSwitch.checked = switchEl.checked;
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

        document.getElementById('close-loader').onclick = () => {
            panel.remove();
        };
    }

    // === Główny panel ===
    function showMainPanel() {
        if (document.getElementById('main-control-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'main-control-panel';
        panel.innerHTML = `
            <div class="panel-inner">
                <button id="close-main-panel" title="Zamknij panel" aria-label="Zamknij panel">&times;</button>
                <h2>Główny Panel Kontrolny</h2>
                <div style="display:flex; align-items:center; gap: 10px; margin-top: 10px;">
                    <label class="switch-label" style="margin:0;">
                        <input type="checkbox" id="main-loader-switch" ${loaderEnabled === 'true' ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                    <button id="open-w0bi-gear" title="Otwórz Panel Obraz Wczytywania ⚙️" aria-label="Otwórz Panel Obraz Wczytywania" style="font-size: 20px; padding: 0 8px; cursor: pointer; background:none; border:none; color:#ccc; display:flex; align-items:center; gap:6px;">
                        ⚙️ <span class="gear-text">Obraz Wczytywania</span>
                    </button>
                </div>
                <div class="coming-soon-text">Coming soon</div>
            </div>
        `;
        document.body.appendChild(panel);

        const mainSwitch = document.getElementById('main-loader-switch');
        mainSwitch.addEventListener('change', () => {
            loaderEnabled = mainSwitch.checked ? 'true' : 'false';
            localStorage.setItem(STORAGE_LOADER_ENABLED, loaderEnabled);
            const w0biSwitch = document.getElementById('loader-enable-switch');
            if (w0biSwitch) w0biSwitch.checked = mainSwitch.checked;
            alert(`Loader ${loaderEnabled === 'true' ? 'włączony' : 'wyłączony'}! Odśwież grę, aby zobaczyć efekt.`);
        });

        document.getElementById('open-w0bi-gear').onclick = showSettings;
        document.getElementById('close-main-panel').onclick = () => {
            panel.remove();
        };
    }

    // === Przycisk W0bi w lewym dolnym rogu ===
    function createToggleButton() {
        if (document.getElementById('toggle-main-panel-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'toggle-main-panel-btn';
        btn.title = 'Włącz/wyłącz panel W0bi';
        btn.textContent = 'W0bi';
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

    window.addEventListener('load', () => {
        setTimeout(createToggleButton, 1000);
    });

    // === Style ===
    GM_addStyle(`
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
            background-color: #9b30ff;
            border-radius: 8px;
        }
        #custom-loading-screen progress#purple-loader::-moz-progress-bar {
            background-color: #9b30ff;
            border-radius: 8px;
        }
        #custom-loader-panel, #main-control-panel {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e; border: 2px solid #444;
            padding: 30px 40px 40px 40px;
            z-index: 999999;
            color: white;
            font-family: sans-serif;
            border-radius: 12px;
            width: 600px;
            min-height: 400px;
            max-width: 95vw;
            box-sizing: border-box;
        }
        #close-main-panel {
            position: absolute;
            top: 12px;
            right: 12px;
            background: transparent;
            border: none;
            color: #bbb;
            font-size: 22px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            user-select: none;
            transition: color 0.2s;
        }
        #close-main-panel:hover {
            color: #fff;
        }
        .panel-inner {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        input[type="text"] {
            padding: 6px;
            background: #333;
            color: #fff;
            border: 1px solid #666;
            width: 100%;
            box-sizing: border-box;
        }
        button {
            padding: 8px 12px;
            background: #444;
            border: none;
            color: white;
            cursor: pointer;
            transition: background 0.2s;
            border-radius: 6px;
        }
        button:hover {
            background: #666;
        }
        label {
            font-size: 16px;
        }

        /* Suwak toggle (zieleniejący) */
        .switch-label {
            display: inline-block;
            position: relative;
            width: 44px;
            height: 24px;
            user-select: none;
            cursor: pointer;
        }
        .switch-label input {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
        }
        .switch-label .slider {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #555;
            border-radius: 24px;
            transition: 0.3s;
        }
        .switch-label .slider::before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            border-radius: 50%;
            transition: 0.3s;
        }
        .switch-label input:checked + .slider {
            background-color: #4caf50;
        }
        .switch-label input:checked + .slider::before {
            transform: translateX(20px);
        }

        /* Główny panel - suwak i ikonka z tekstem */
        #main-control-panel > .panel-inner > div {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        .gear-text {
            color: white;
            user-select: none;
            pointer-events: none;
            font-size: 14px;
        }
        .coming-soon-text {
            color: #ccc;
            font-size: 18px;
            user-select: none;
            font-weight: 600;
            text-align: center;
            margin-top: 20px;
        }
    `);
})();

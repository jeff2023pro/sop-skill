// SOP Skill Settings Page
(function () {
    'use strict';

    const isZh = /^zh\b/i.test(navigator.language || '');
    const LOCALE = isZh ? 'zh' : 'en';

    // ── Provider state (fully managed here) ──
    let _currentProvider = 'aliyun';
    const elDgKey = document.getElementById('dg-key');
    const elDgLang = document.getElementById('deepgram-lang');
    const elAliyunKey = document.getElementById('aliyun-key');
    const elAliyunRegion = document.getElementById('aliyun-region');
    const elAliyunModel = document.getElementById('aliyun-model');
    const elClaudeKey = document.getElementById('claude-key');

    const btnSave = document.getElementById('btn-save');
    const btnTest = document.getElementById('btn-test');
    const statusEl = document.getElementById('status');

    function switchProvider(name) {
        _currentProvider = normalizeProvider(name);
        document.querySelectorAll('.provider-btn').forEach(function(b) {
            b.classList.toggle('active', b.dataset.provider === _currentProvider);
        });
        document.querySelectorAll('.provider-section').forEach(function(s) {
            s.classList.toggle('visible', s.id === ('provider-' + _currentProvider));
        });
        const testBtn = document.getElementById('btn-test');
        if (testBtn) testBtn.disabled = (_currentProvider === 'manual');
    }

    const STORAGE_KEYS = [
        'sttProvider',
        'deepgramKey',
        'deepgramLang',
        'aliyunKey',
        'aliyunRegion',
        'aliyunModel',
        'claudeApiKey'
    ];

    const DEFAULTS = {
        sttProvider: 'aliyun',
        deepgramLang: 'zh-CN',
        aliyunRegion: 'cn',
        aliyunModel: 'qwen3-asr-flash-realtime'
    };

    const I18N = {
        zh: {
            kicker: '扩展设置',
            pageTitle: 'SOP Skill 设置',
            title: 'SOP Skill 语音设置',
            subtitle: '录制前请先配置语音服务 Provider 和凭证。',

            cardEngine: '语音服务 Provider',
            labelProvider: 'Provider',

            dgTitle: 'Deepgram',
            labelDgKey: 'API Key',
            dgKeyPlaceholder: '输入你的 Deepgram API Key',
            labelDgLang: '识别语言',
            dgLangHint: 'Deepgram 流式识别需要明确指定语言。',
            dgHintHtml: '免费注册即送 $200 额度 → <a href="https://console.deepgram.com/signup" target="_blank" rel="noreferrer noopener">console.deepgram.com</a>',

            aliyunTitle: '阿里云 Qwen3-ASR-Flash-Realtime',
            labelAliyunKey: 'API Key',
            aliyunKeyPlaceholder: '输入你的 DashScope API Key',
            labelAliyunRegion: '区域',
            labelAliyunModel: '模型',
            aliyunModelPlaceholder: 'qwen3-asr-flash-realtime',
            aliyunHint: '官方模型名：qwen3-asr-flash-realtime',

            cardClaude: 'AI 蒸馏引擎',
            labelClaudeKey: 'Claude API Key',
            claudeKeyPlaceholder: 'sk-ant-api03-xxxxxxxx',
            claudeKeyHint: '用于将 SOP 蒸馏为 Playwright 脚本和 MCP 工具定义，使用 claude-opus-4-6 模型',

            saveBtn: '保存设置',
            testBtn: '测试连接',
            testing: '测试中…',
            toggleTitle: '显示/隐藏',

            notesTitle: '使用说明',
            note1: '• 录制时只会使用当前选中的一个语音 Provider。',
            note2: '• Deepgram 需要手动选择中文或英文。',
            note3: '• 所有凭证只存储在本地浏览器中。',
            note4: '• 凭证缺失时，”开始录制”会被禁用。选择”手动模式”无需凭证。',

            manualOption: '手动注释（无需语音 API）',
            manualNoTest: '手动模式无需测试',
            statusSaved: '✅ 设置已保存',
            statusSavedManual: '✅ 手动模式已启用，无需 API Key',
            statusMissingDg: '⚠️ Deepgram API Key 未配置',
            statusMissingAliyun: '⚠️ 阿里云 API Key 未配置',
            statusNeedDg: '⚠️ 请先输入 Deepgram API Key',
            statusNeedAliyun: '⚠️ 请先输入阿里云 API Key',
            statusOkDg: '✅ Deepgram 连接成功，API Key 有效',
            statusBadDg: '❌ Deepgram API Key 无效，请检查后重试',
            statusServerDg: '⚠️ Deepgram 返回 {status}，请稍后重试',
            statusNetworkDg: '❌ 无法连接 Deepgram，请检查网络',
            statusOkAliyun: '✅ 阿里云连接成功，API Key 有效',
            statusBadAliyun: '❌ 阿里云 API Key 无效，或与区域不匹配，请检查后重试',
            statusBadAliyunFormat: '❌ 阿里云 API Key 包含非法字符（如中文/全角符号），请重新复制粘贴',
            statusServerAliyun: '⚠️ 阿里云返回 {status}，请稍后重试',
            statusNetworkAliyun: '❌ 无法连接阿里云，请检查网络'
        },
        en: {
            kicker: 'Extension Settings',
            pageTitle: 'SOP Skill Settings',
            title: 'SOP Skill Speech Settings',
            subtitle: 'Configure your speech provider and credentials before recording.',

            cardEngine: 'Speech Provider',
            labelProvider: 'Provider',

            dgTitle: 'Deepgram',
            labelDgKey: 'API Key',
            dgKeyPlaceholder: 'Enter your Deepgram API key',
            labelDgLang: 'Recognition Language',
            dgLangHint: 'Deepgram streaming requires an explicit language.',
            dgHintHtml: 'Free signup includes $200 credit → <a href="https://console.deepgram.com/signup" target="_blank" rel="noreferrer noopener">console.deepgram.com</a>',

            aliyunTitle: 'Aliyun Qwen3-ASR-Flash-Realtime',
            labelAliyunKey: 'API Key',
            aliyunKeyPlaceholder: 'Enter your DashScope API key',
            labelAliyunRegion: 'Region',
            labelAliyunModel: 'Model',
            aliyunModelPlaceholder: 'qwen3-asr-flash-realtime',
            aliyunHint: 'Official model name: qwen3-asr-flash-realtime',

            cardClaude: 'AI Distillation Engine',
            labelClaudeKey: 'Claude API Key',
            claudeKeyPlaceholder: 'sk-ant-api03-xxxxxxxx',
            claudeKeyHint: 'Used to distill SOPs into Playwright scripts and MCP tool definitions using the claude-opus-4-6 model',

            saveBtn: 'Save Settings',
            testBtn: 'Test Connection',
            testing: 'Testing…',
            toggleTitle: 'Show/Hide',

            notesTitle: 'Usage Notes',
            note1: '• Recording uses only one selected speech provider.',
            note2: '• Deepgram requires manual Chinese/English selection.',
            note3: '• All credentials are stored locally in browser storage.',
            note4: '• Recording start is disabled when credentials are missing. Choose Manual mode to skip this.',

            manualOption: 'Manual (No Speech API)',
            manualNoTest: 'No test needed in manual mode',
            statusSaved: '✅ Settings saved',
            statusSavedManual: '✅ Manual mode enabled — no API key required',
            statusMissingDg: '⚠️ Deepgram API key is missing',
            statusMissingAliyun: '⚠️ Aliyun API key is missing',
            statusNeedDg: '⚠️ Please enter Deepgram API key first',
            statusNeedAliyun: '⚠️ Please enter Aliyun API key first',
            statusOkDg: '✅ Deepgram connection succeeded. API key is valid',
            statusBadDg: '❌ Invalid Deepgram API key. Please check and retry',
            statusServerDg: '⚠️ Deepgram returned {status}. Please retry later',
            statusNetworkDg: '❌ Unable to connect to Deepgram. Check network',
            statusOkAliyun: '✅ Aliyun connection succeeded. API key is valid',
            statusBadAliyun: '❌ Invalid Aliyun API key, or it does not match the selected region. Please check and retry',
            statusBadAliyunFormat: '❌ Aliyun API key contains invalid characters (e.g. non-ASCII/full-width symbols). Re-copy the key',
            statusServerAliyun: '⚠️ Aliyun returned {status}. Please retry later',
            statusNetworkAliyun: '❌ Unable to connect to Aliyun. Check network'
        }
    };

    function t(key, vars = {}) {
        const table = I18N[LOCALE] || I18N.en;
        let text = table[key] || I18N.en[key] || key;
        for (const [k, v] of Object.entries(vars)) {
            text = text.replaceAll(`{${k}}`, String(v));
        }
        return text;
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function normalizeProvider(provider) {
        if (provider === 'deepgram') return 'deepgram';
        if (provider === 'manual') return 'manual';
        return 'aliyun';
    }

    function normalizeCredentialValue(value) {
        return String(value || '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    function normalizeAliyunRegion(region) {
        if (region === 'intl' || region === 'us') return region;
        return 'cn';
    }

    function applyLocale() {
        document.documentElement.lang = isZh ? 'zh-CN' : 'en';
        document.title = isZh ? 'SOP.skill 蒸馏助手 · 语音设置' : 'SOP.skill Distiller · Speech Settings';

        setText('opt-card-engine', t('cardEngine'));
        setText('opt-label-dg-key', t('labelDgKey'));
        setText('opt-label-dg-lang', t('labelDgLang'));
        setText('opt-hint-dg-lang', t('dgLangHint'));
        setText('opt-label-aliyun-key', t('labelAliyunKey'));
        setText('opt-label-aliyun-region', t('labelAliyunRegion'));
        setText('opt-label-aliyun-model', t('labelAliyunModel'));
        setText('opt-hint-aliyun', t('aliyunHint'));
        setText('opt-card-claude', t('cardClaude'));
        setText('opt-label-claude-key', t('labelClaudeKey'));
        setText('opt-hint-claude-key', t('claudeKeyHint'));
        setText('opt-card-notes', t('notesTitle'));
        setText('opt-note-1', t('note1'));
        setText('opt-note-2', t('note2'));
        setText('opt-note-3', t('note3'));
        setText('opt-note-4', t('note4'));

        const dgHint = document.getElementById('opt-hint-dg-key');
        if (dgHint) dgHint.innerHTML = t('dgHintHtml');

        if (elDgKey) elDgKey.placeholder = t('dgKeyPlaceholder');
        if (elAliyunKey) elAliyunKey.placeholder = t('aliyunKeyPlaceholder');
        if (elAliyunModel) elAliyunModel.placeholder = t('aliyunModelPlaceholder');
        if (elClaudeKey) elClaudeKey.placeholder = t('claudeKeyPlaceholder');
    }

    function showStatus(msg, ok) {
        statusEl.textContent = msg;
        statusEl.style.display = '';
        statusEl.className = `status ${ok ? 'ok' : 'err'}`;
    }

    function hideStatus() {
        statusEl.className = 'status';
        statusEl.style.display = '';
    }

    function renderProvider(provider) {
        switchProvider(provider);
    }

    function getProviderCredentialsStatus(provider, data) {
        if (normalizeProvider(provider) === 'manual') return true;
        if (normalizeProvider(provider) === 'deepgram') {
            return Boolean(String(data.deepgramKey || '').trim());
        }
        return Boolean(String(data.aliyunKey || '').trim());
    }

    function getMissingStatusText(provider) {
        if (normalizeProvider(provider) === 'manual') return '';
        if (normalizeProvider(provider) === 'deepgram') return t('statusMissingDg');
        return t('statusMissingAliyun');
    }

    function collectFormData() {
        return {
            sttProvider: _currentProvider,
            deepgramKey: normalizeCredentialValue(elDgKey.value),
            deepgramLang: (elDgLang.value || DEFAULTS.deepgramLang).trim(),
            aliyunKey: normalizeCredentialValue(elAliyunKey.value),
            aliyunRegion: normalizeAliyunRegion((elAliyunRegion.value || DEFAULTS.aliyunRegion).trim()),
            aliyunModel: (elAliyunModel.value.trim() || DEFAULTS.aliyunModel),
            claudeApiKey: normalizeCredentialValue(elClaudeKey ? elClaudeKey.value : '')
        };
    }

    function applyFormData(data) {
        const merged = { ...DEFAULTS, ...(data || {}) };
        const normalizedProvider = normalizeProvider(merged.sttProvider);

        if (elDgKey) elDgKey.value = merged.deepgramKey || '';
        if (elDgLang) elDgLang.value = (merged.deepgramLang === 'en-US' ? 'en-US' : 'zh-CN');
        if (elAliyunKey) elAliyunKey.value = merged.aliyunKey || '';
        if (elAliyunRegion) elAliyunRegion.value = normalizeAliyunRegion(merged.aliyunRegion);
        if (elAliyunModel) elAliyunModel.value = merged.aliyunModel || DEFAULTS.aliyunModel;
        if (elClaudeKey) elClaudeKey.value = merged.claudeApiKey || '';

        renderProvider(normalizedProvider);
    }

    function getAliyunRegionCandidates(preferredRegion) {
        const first = normalizeAliyunRegion(preferredRegion);
        return Array.from(new Set([first, 'cn', 'us', 'intl']));
    }

    function getAliyunBase(region) {
        const normalized = normalizeAliyunRegion(region);
        if (normalized === 'intl') return 'https://dashscope-intl.aliyuncs.com';
        if (normalized === 'us') return 'https://dashscope-us.aliyuncs.com';
        return 'https://dashscope.aliyuncs.com';
    }

    function containsNonLatin1(text) {
        const value = String(text || '');
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) > 255) return true;
        }
        return false;
    }

    async function testDeepgram(key) {
        try {
            const res = await fetch('https://api.deepgram.com/v1/projects', {
                headers: { Authorization: `Token ${key}` }
            });
            if (res.ok) {
                showStatus(t('statusOkDg'), true);
            } else if (res.status === 401 || res.status === 403) {
                showStatus(t('statusBadDg'), false);
            } else {
                showStatus(t('statusServerDg', { status: res.status }), false);
            }
        } catch {
            showStatus(t('statusNetworkDg'), false);
        }
    }

    async function testAliyun(key, region) {
        const normalizedKey = normalizeCredentialValue(key);
        const normalizedRegion = normalizeAliyunRegion(region);
        if (normalizedKey !== key) {
            elAliyunKey.value = normalizedKey;
        }
        if (containsNonLatin1(normalizedKey)) {
            showStatus(t('statusBadAliyunFormat'), false);
            return;
        }

        const candidates = getAliyunRegionCandidates(normalizedRegion);
        let fallbackRegion = '';
        let sawAuthFailure = false;
        let serverStatus = 0;
        let networkDetail = '';

        for (const rg of candidates) {
            const base = getAliyunBase(rg);
            try {
                const res = await fetch(`${base}/compatible-mode/v1/models`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${normalizedKey}` }
                });
                if (res.ok) {
                    if (rg !== normalizedRegion) fallbackRegion = rg;
                    if (fallbackRegion) {
                        elAliyunRegion.value = fallbackRegion;
                        chrome.storage.local.set({ aliyunRegion: fallbackRegion });
                    }
                    showStatus(t('statusOkAliyun'), true);
                    return;
                }
                if (res.status === 401 || res.status === 403) {
                    sawAuthFailure = true;
                    continue;
                }
                serverStatus = serverStatus || res.status;
            } catch (e) {
                const msg = String(e?.message || e || '');
                if (/ISO-8859-1|code point/i.test(msg)) {
                    showStatus(t('statusBadAliyunFormat'), false);
                    return;
                }
                networkDetail = msg || networkDetail;
            }
        }

        if (serverStatus) {
            showStatus(t('statusServerAliyun', { status: serverStatus }), false);
            return;
        }
        if (sawAuthFailure) {
            showStatus(t('statusBadAliyun'), false);
            return;
        }
        const detail = networkDetail ? ` (${networkDetail})` : '';
        showStatus(`${t('statusNetworkAliyun')}${detail}`, false);
    }

    function bindVisibilityToggles() {
        // Eye icon toggles are already wired by the inline script in options.html.
        // This is a fallback in case options.js loads before the inline script sets them up.
        document.querySelectorAll('.toggle-vis[data-toggle-target]').forEach((btn) => {
            if (btn._visWired) return;
            btn._visWired = true;
            btn.addEventListener('click', () => {
                const inp = document.getElementById(btn.dataset.toggleTarget);
                if (!inp) return;
                inp.type = inp.type === 'password' ? 'text' : 'password';
            });
        });
    }

    function bindEvents() {
        // Provider pill switching — fully handled here
        document.querySelectorAll('.provider-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                switchProvider(btn.dataset.provider);
                hideStatus();
            });
        });

        btnSave.addEventListener('click', () => {
            const data = collectFormData();
            chrome.storage.local.set(data, () => {
                if (normalizeProvider(data.sttProvider) === 'manual') {
                    showStatus(t('statusSavedManual'), true);
                    return;
                }
                const ok = getProviderCredentialsStatus(data.sttProvider, data);
                showStatus(ok ? t('statusSaved') : getMissingStatusText(data.sttProvider), ok);
            });
        });

        const TEST_BTN_HTML = btnTest ? btnTest.innerHTML : '';
        btnTest && btnTest.addEventListener('click', async () => {
            const data = collectFormData();
            const provider = data.sttProvider;

            btnTest.disabled = true;
            btnTest.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/></svg>${t('testing')}`;
            hideStatus();

            try {
                if (provider === 'deepgram') {
                    if (!data.deepgramKey) {
                        showStatus(t('statusNeedDg'), false);
                    } else {
                        await testDeepgram(data.deepgramKey);
                    }
                } else if (!data.aliyunKey) {
                    showStatus(t('statusNeedAliyun'), false);
                } else {
                    await testAliyun(data.aliyunKey, data.aliyunRegion);
                }
            } finally {
                btnTest.disabled = (_currentProvider === 'manual');
                btnTest.innerHTML = TEST_BTN_HTML;
            }
        });
    }

    function init() {
        applyLocale();
        bindVisibilityToggles();
        bindEvents();

        chrome.storage.local.get(STORAGE_KEYS, (data) => {
            applyFormData(data);
        });
    }

    init();
})();

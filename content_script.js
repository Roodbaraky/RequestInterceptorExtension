(function () {
    const BRIDGE_SOURCE = '__request_interceptor_extension__';

    function pushRulesToPage(rules) {
        window.postMessage({
            source: BRIDGE_SOURCE,
            type: 'setRules',
            rules: Array.isArray(rules) ? rules : []
        }, '*');
    }

    async function refreshRules() {
        try {
            const response = await chrome.runtime.sendMessage({ type: 'getRules' });
            pushRulesToPage(response && response.rules ? response.rules : []);
        } catch (error) {
            console.warn('[RequestInterceptor] Failed to fetch rules from extension:', error);
        }
    }

    refreshRules();

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg && msg.type === 'rulesUpdated') {
            pushRulesToPage(msg.rules || []);
        }
    });
})();





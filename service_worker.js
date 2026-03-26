
function buildRedirectRule({ id, matchPrefix, replacePrefix, isEnabled = true }) {
    const urlFilter = matchPrefix.endsWith('/') ? matchPrefix + '*' : matchPrefix + '/*';

    return {
        id,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                transform: {
                }
            }
        },
        condition: {
            urlFilter,
            resourceTypes: [
                "main_frame", "sub_frame",
                "xmlhttprequest", "script", "image", "font", "other",
                "ping", "stylesheet"
            ]
        },
    };
}

function buildRegexRedirectRule({ id, matchPrefix, replacePrefix, isEnabled = true }) {
    const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const from = `^${escape(matchPrefix)}(.*)$`;
    const to = `${replacePrefix}$1`;

    return {
        id,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                regexSubstitution: to
            }
        },
        condition: {
            regexFilter: from,
            resourceTypes: [
                "main_frame", "sub_frame", "xmlhttprequest", "other"
            ]
        },
        enabled: isEnabled
    };
}

async function getStoredRules() {
    return new Promise(resolve => {
        chrome.storage.local.get({ rules: [] }, (res) => resolve(res.rules));
    });
}

async function setStoredRules(rules) {
    return new Promise(resolve => {
        chrome.storage.local.set({ rules }, () => resolve());
    });
}

async function applyRulesToDNR(rules) {
    const current = await chrome.declarativeNetRequest.getDynamicRules();
    const currentIds = current.map(r => r.id);
    const newIds = rules.map(r => r.id);

    const toRemove = currentIds.filter(id => !newIds.includes(id));
    const toAdd = rules.map(buildRegexRedirectRule);

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: toRemove,
        addRules: toAdd
    });
}

chrome.runtime.onInstalled.addListener(async () => {
    const rules = await getStoredRules();
    if (rules.length === 0) {
        const defaultRule = {
            id: 1,
            name: "CustomCards → localhost",
            matchPrefix: "https://devint.eu.peoplefirst-dev.com/api/v1/customcards/",
            replacePrefix: "https://localhost:8301/api/customcards/",
            active: true
        };
        await setStoredRules([defaultRule]);
        await applyRulesToDNR([defaultRule]);
    }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
        if (msg.type === 'getRules') {
            const rules = await getStoredRules();
            sendResponse({ rules });
            return;
        }

        if (msg.type === 'addRule') {
            const rules = await getStoredRules();
            const nextId = (rules.map(r => r.id).reduce((a, b) => Math.max(a, b), 0) || 0) + 1;
            const newRule = { id: nextId, ...msg.payload, active: true };
            const newRules = [...rules, newRule];
            await setStoredRules(newRules);
            await applyRulesToDNR(newRules.filter(r => r.active));
            sendResponse({ ok: true, rules: newRules });
            return;
        }

        if (msg.type === 'removeRule') {
            const rules = await getStoredRules();
            const newRules = rules.filter(r => r.id !== msg.id);
            await setStoredRules(newRules);
            await applyRulesToDNR(newRules.filter(r => r.active));
            sendResponse({ ok: true, rules: newRules });
            return;
        }

        if (msg.type === 'toggleRule') {
            const rules = await getStoredRules();
            const newRules = rules.map(r => r.id === msg.id ? { ...r, active: !r.active } : r);
            await setStoredRules(newRules);
            await applyRulesToDNR(newRules.filter(r => r.active));
            sendResponse({ ok: true, rules: newRules });
            return;
        }

        sendResponse({ ok: false, error: 'unknown message' });
    })();
    return true;
});

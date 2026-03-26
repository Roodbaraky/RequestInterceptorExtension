function send(msg) {
    return new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));
}

function render(rules) {
    const container = document.getElementById('rules');
    container.innerHTML = '';
    rules.forEach(rule => {
        const div = document.createElement('div');
        div.className = 'rule';
        div.innerHTML = `
      <div><strong>#${rule.id}</strong> ${rule.name || ''}</div>
      <div class="row">
        <div class="grow"><code>${rule.matchPrefix}</code></div>
        <span>→</span>
        <div class="grow"><code>${rule.replacePrefix}</code></div>
      </div>
      <div class="row">
        <button data-act="toggle">${rule.active ? 'Disable' : 'Enable'}</button>
        <button data-act="remove" style="margin-left:auto;color:#b00">Remove</button>
      </div>
    `;
        div.querySelector('[data-act="toggle"]').onclick = async () => {
            const res = await send({ type: 'toggleRule', id: rule.id });
            render(res.rules);
        };
        div.querySelector('[data-act="remove"]').onclick = async () => {
            const res = await send({ type: 'removeRule', id: rule.id });
            render(res.rules);
        };
        container.appendChild(div);
    });
}

document.getElementById('addBtn').onclick = async () => {
    const matchPrefix = document.getElementById('matchPrefix').value.trim();
    const replacePrefix = document.getElementById('replacePrefix').value.trim();
    if (!matchPrefix || !replacePrefix) return alert('Both fields required');

    const payload = {
        name: 'Custom redirect',
        matchPrefix,
        replacePrefix
    };
    const res = await send({ type: 'addRule', payload });
    render(res.rules);
};

(async function init() {
    const res = await send({ type: 'getRules' });
    render(res.rules);
})();
(function () {
    const BRIDGE_SOURCE = '__request_interceptor_extension__';

    if (window.__requestInterceptorMainPatched) return;
    window.__requestInterceptorMainPatched = true;

    let rules = [];

    function setRules(nextRules) {
        rules = Array.isArray(nextRules)
            ? nextRules.filter((rule) => rule && rule.active && rule.matchPrefix && rule.replacePrefix)
            : [];
    }

    function rewriteUrl(urlLike) {
        const original = typeof urlLike === 'string'
            ? urlLike
            : (urlLike instanceof URL ? urlLike.href : String(urlLike));

        for (const rule of rules) {
            if (original.startsWith(rule.matchPrefix)) {
                return rule.replacePrefix + original.slice(rule.matchPrefix.length);
            }
        }
        return null;
    }

    window.addEventListener('message', function (event) {
        if (event.source !== window) return;
        const data = event.data;
        if (!data || data.source !== BRIDGE_SOURCE || data.type !== 'setRules') return;
        setRules(data.rules);
    });

    const originalFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
        const originalUrl = input instanceof Request ? input.url : String(input);
        const rewrittenUrl = rewriteUrl(originalUrl);

        if (!rewrittenUrl) {
            return originalFetch(input, init);
        }

        if (input instanceof Request) {
            const req = input;
            const mergedHeaders = new Headers(req.headers);
            if (init && init.headers) {
                new Headers(init.headers).forEach((value, key) => mergedHeaders.set(key, value));
            }

            const nextInit = Object.assign({}, init || {}, {
                method: init && init.method ? init.method : req.method,
                headers: mergedHeaders,
                credentials: init && init.credentials ? init.credentials : req.credentials,
                mode: init && init.mode ? init.mode : req.mode,
                cache: init && init.cache ? init.cache : req.cache,
                redirect: init && init.redirect ? init.redirect : req.redirect,
                referrer: init && init.referrer ? init.referrer : req.referrer,
                referrerPolicy: init && init.referrerPolicy ? init.referrerPolicy : req.referrerPolicy,
                integrity: init && init.integrity ? init.integrity : req.integrity,
                keepalive: init && typeof init.keepalive === 'boolean' ? init.keepalive : req.keepalive,
                signal: init && init.signal ? init.signal : req.signal
            });

            if (!Object.prototype.hasOwnProperty.call(nextInit, 'body') && req.method !== 'GET' && req.method !== 'HEAD') {
                nextInit.body = req.body;
            }

            return originalFetch(rewrittenUrl, nextInit);
        }

        return originalFetch(rewrittenUrl, init);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        const rewrittenUrl = rewriteUrl(String(url));
        const args = Array.prototype.slice.call(arguments);
        args[1] = rewrittenUrl || url;
        return originalOpen.apply(this, args);
    };
})();


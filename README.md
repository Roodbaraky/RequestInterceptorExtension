# API URL Redirector

A Chrome extension for redirecting requests from one URL prefix to another.

It is designed for local development scenarios where you want a page to keep making requests to a production or integration-style endpoint, but have those requests transparently redirected to a different backend such as `https://localhost`.

## What it does

- Redirects requests when the request URL starts with a configured **match prefix**.
- Replaces that prefix with a configured **target prefix**.
- Supports enabling, disabling, and removing rules from the options page.
- Ships with a default example rule on first install:
  - From: `https://devint.eu.peoplefirst-dev.com/api/v1/customcards/`
  - To: `https://localhost:8301/api/customcards/`

## Download

You can get the extension source in either of these ways:

### Option 1: Download ZIP from GitHub

If this project is hosted on GitHub:

1. Open the repository page.
2. Select **Code**.
3. Select **Download ZIP**.
4. Extract the ZIP to a folder on your computer.

### Option 2: Clone the repository

```powershell
git clone <repository-url>
```

After cloning, the extension folder should contain files such as `manifest.json`, `service_worker.js`, `content_script.js`, and `options.html`.

## Install in Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** in the top-right corner.
4. Select **Load unpacked**.
5. Choose the extracted project folder:
   - the folder that contains `manifest.json`
6. The extension should now appear in your installed extensions list as **API URL Redirector**.

## Open the extension options

After loading the extension:

1. Go to `chrome://extensions`.
2. Find **API URL Redirector**.
3. Select **Details**.
4. Select **Extension options**.

This opens the options page where you can manage redirect rules.

## How to use it

### Add a redirect rule

On the options page:

1. In **Match prefix (From)**, enter the beginning of the URL you want to intercept.
2. In **Replace prefix (To)**, enter the new base URL.
3. Select **Add**.

Example:

- **From**: `https://devint.eu.peoplefirst-dev.com/api/v1/customcards/`
- **To**: `https://localhost:8301/api/customcards/`

With that rule in place, a request like:

`https://devint.eu.peoplefirst-dev.com/api/v1/customcards/items/123`

is redirected to:

`https://localhost:8301/api/customcards/items/123`

### Manage existing rules

In **Current Rules**, each rule can be:

- **Disabled** temporarily using the toggle button
- **Enabled** again later
- **Removed** completely

## Typical development workflow

1. Start your local API.
2. Load this extension in Chrome.
3. Add a rule that maps the remote API prefix to your local API prefix.
4. Open the web app you want to test.
5. Use the app normally; matching requests will be redirected.

## Notes

- The extension uses **Developer mode / Load unpacked**, so it is intended for local or internal use unless you package and publish it separately.
- Use the folder containing `manifest.json` when loading the extension.
- If your local backend uses HTTPS, make sure your local certificate is trusted by Chrome.
- Your local backend must still handle any required CORS, auth, or API behavior expected by the page.

## Troubleshooting

### The extension does not appear in Chrome

- Make sure you selected the correct folder.
- Confirm that `manifest.json` is directly inside the selected folder.
- Check `chrome://extensions` for any load errors.

### Requests are not being redirected

- Confirm the rule is **enabled**.
- Make sure the request URL starts with the exact **Match prefix**.
- Reload the target page after changing rules.
- Open Chrome DevTools and inspect the Network tab to confirm the actual request URL.

### My local API is not responding

- Make sure your local server is running.
- Verify the replacement URL is correct.
- If using `https://localhost`, confirm the certificate is valid/trusted.

## Files of interest

- `manifest.json` — extension manifest
- `options.html` / `options.js` — settings UI for managing rules
- `service_worker.js` — background logic and stored rules
- `content_script.js` — sends rules into the page context
- `page_interceptor.js` — intercepts matching requests in the page


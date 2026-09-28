# Product Ops integration — Client Automation

**Goal:** Surface the Client SDET **Client Automation** dashboard inside  
[Product Ops → Bugs / QA](https://productops.fox/?category=bugs-qa)  
so execs and QA open one Okta-gated portal instead of a separate GitHub Pages URL.

**Owner (content):** Client SDET  
**Owner (shell):** Product Ops / platform team for `productops.fox`

---

## What to add under Bugs / QA

| Field | Value |
|-------|--------|
| **Category** | Bugs / QA (`?category=bugs-qa`) |
| **Tile / nav label** | Client Automation |
| **Subtitle** | FOX One · FOX Sports · FOX Weather — automation pass rates & runners |
| **Audience** | QA leads, Client SDET, product ops, eng managers |

---

## Integration options (pick one)

### A — Preferred: host under FOX + deep-link or iframe

1. Deploy the static folder `public/automation-status/` to FOX static hosting behind the same Okta/Akamai gate as Product Ops (example path):  
   `https://productops.fox/tools/client-automation/`  
   or  
   `https://client-automation.fox.com/` (DNS + Okta).
2. In Bugs / QA, add a card that either:
   - **Opens in-app:** iframe  
     `…/tools/client-automation/?embed=1`  
     (or `?productops=1`)
   - **Navigates:** same-origin link to that path (full page inside Product Ops shell if your router supports it).

**Why preferred:** Same SSO as Product Ops; no public internet URL; framing works when same-site headers allow it.

### B — Embed public Pages (interim only)

- URL: `https://suneelgopisetty.github.io/client-automation/?embed=1`
- Risks: public on the internet; may be blocked by `X-Frame-Options` / CSP from GitHub Pages; not FOX-branded host.
- Use only until Option A is live.

### C — External link only

- Bugs / QA tile opens the hosted URL in a new tab.
- Zero iframe work; weakest “integrated” feel.

---

## Embed contract (already in this app)

| Query | Effect |
|-------|--------|
| `?embed=1` | Compact header; filled navy background for content pane |
| `?productops=1` | Same as `embed=1` |
| Nested iframe | Auto-detects and applies embed styles |

No backend, no build step. Relative assets (`css/`, `js/`, `data/`, `assets/`) must stay co-located.

**Framing requirement:** Parent host must allow framing this origin (do not send `X-Frame-Options: DENY` / `frame-ancestors 'none'` on the Client Automation host for Product Ops origin).

**Suggested iframe snippet for Product Ops:**

```html
<iframe
  title="Client Automation"
  src="/tools/client-automation/?embed=1"
  style="width:100%;min-height:80vh;border:0;background:#001a33;"
  allow="fullscreen"
></iframe>
```

If the app is on another FOX host:

```html
<iframe
  title="Client Automation"
  src="https://client-automation.fox.com/?embed=1"
  style="width:100%;min-height:80vh;border:0;background:#001a33;"
></iframe>
```

---

## Deploy package

Ship the entire directory:

```
public/automation-status/
  index.html
  css/portal.css
  js/portal.js
  data/runs.json
  assets/**
```

Local check:

```bash
cd public/automation-status
python3 -m http.server 8765
# open http://127.0.0.1:8765/?embed=1
```

Data updates: edit `data/runs.json`, redeploy the folder (or sync via CI).

---

## Slack message (paste to Product Ops)

```
Hi Product Ops —

We built a Client Automation status dashboard (FOX One / Sports / Weather — pass rates, release graphs, self-host runners). We’d like it under Product Ops → Bugs / QA.

Ask:
1) Add a “Client Automation” card in category=bugs-qa
2) Prefer hosting static files on FOX (productops.fox/tools/client-automation/ or client-automation.fox.com) behind Okta
3) Embed with iframe src …/?embed=1 (or deep-link same origin)

App is static HTML/CSS/JS — no backend. Happy to walk through with whoever owns productops.fox nav/categories.

Thanks — Client SDET
```

---

## Checklist for Product Ops owner

- [ ] Bugs / QA category entry labeled **Client Automation**
- [ ] Static host path decided (FOX preferred)
- [ ] Okta/Akamai same as Product Ops
- [ ] Iframe or in-shell route wired with `?embed=1`
- [ ] Confirm frame-ancestors / CSP allows Product Ops → app
- [ ] Smoke-test: product tiles, platform drill-down, runners panel, mobile layout

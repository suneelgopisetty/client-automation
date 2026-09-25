# Client Automation

**Live URL (public — no GitHub login):**  
https://suneelgopisetty.github.io/client-automation/

**Target corp URL (when DNS is ready):**  
https://client-automation.fox.com

Static dashboard from the Client SDET team for FOX One · FOX Sports · FOX Weather automation status.

## Hierarchy

1. **Product** → 2. **Platform group** (LR / TV Apps / Mobile) → 3. **Platform** → 4. **Run detail**

### Platforms

| Group | Platforms |
|-------|-----------|
| Living Room (LR) | Roku · FireTV · Apple TV |
| TV Apps | Samsung · LG · VIZIO |
| Mobile | iPhone · Android |
| Web | Web |

## Slack sources (always use these for data)

| Product / area | Slack channel |
|----------------|---------------|
| FOX One · LR (Roku / FireTV) | `#client-lr-automation-stats` |
| FOX One · Apple TV | `#client-tvos-automation-stats` |
| FOX One · TV Apps | `#client-tvapps-qaautomation-stats` |
| FOX One · Mobile | `#client-mobile-automation-stats` |
| FOX One · Web | `#foxone_web_alerts` |
| FOX Sports · Mobile | `#fsapp-automation-test` |
| FOX Sports · Web | `#fscom-automation-test` |
| FOX Weather · Mobile | `#fw-automation-test` |

## Open locally

```bash
cd public/automation-status
python3 -m http.server 8765
```

Open http://127.0.0.1:8765/

## Branding

- Background: FOX navy blue
- Product logos load from official CDNs used by:
  - [FOX One](https://www.fox.com/) → `auth.fox.com/.../desktop.*.svg`
  - [FOX Sports](https://www.foxcorporation.com/businesses/fox-sports/) / foxsports.com → `statics.foxsports.com/.../fox-logo-white.svg`
  - [FOX Weather](https://www.foxweather.com/) → `static.foxnews.com/.../fox-weather-logo-no-outline.svg`
- Platform logos load from Wikimedia Commons originals (Roku, Fire TV, Apple TV, Samsung, LG, VIZIO, Apple, Android), with Simple Icons CDN + local `assets/platform-*.svg` fallbacks

To cache logos offline (run in your Mac terminal):

```bash
bash tmp/fetch-fox-logos.sh
bash tmp/fetch-platform-logos.sh
```

## Update data

Append runs to `data/runs.json` with `product` + `platform`. Include report links from Slack:

```json
"reportUrl": "https://…/reports/<runId>/",
"reportLabel": "View Dashboard",
"links": [
  { "label": "View Dashboard", "url": "https://…", "kind": "dashboard" },
  { "label": "View HTML Report", "url": "https://…", "kind": "html" },
  { "label": "GitHub Actions", "url": "https://github.com/…/actions/runs/<id>", "kind": "actions" }
]
```

Set `updatedAt`. Redeploy the folder to the internal host.

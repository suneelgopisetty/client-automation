# Sync Client Automation data from Slack

The dashboard is static (`data/runs.json`). It does **not** call Slack in the browser.  
Every sync must include **all** required channels below (never drop the ones you listed).

## Required Slack channels (always)

| Key | Channel | Slack ID | Product / platforms |
|-----|---------|----------|---------------------|
| `foxone_lr` | `#client-lr-automation-stats` | `C0BL2TSJQJU` | FOX One · Roku / FireTV |
| `foxone_appletv` | `#client-tvos-automation-stats` | `C0C17FDE5C4` | FOX One · Apple TV |
| `foxone_tvapps` | `#client-tvapps-qaautomation-stats` | `C0A0GUX2KKJ` | FOX One · Samsung / LG / VIZIO |
| `foxone_mobile` | `#client-mobile-automation-stats` | `C0BD8H7AXV3` | FOX One · iPhone / Android |
| `foxone_web` | `#foxone_web_alerts` | `C0986VDQV4Z` | FOX One · Web *(often Conviva/ops alerts, not E2E)* |
| `foxsports_mobile` | `#fsapp-automation-test` | `C0BMMT4BPD1` | FOX Sports · Mobile |
| `foxsports_web` | `#fscom-automation-test` | `C0BGFTYG8QN` | FOX Sports · Web |
| `foxweather_mobile` | `#fw-automation-test` | `C0BK8QKSVSN` | FOX Weather · Mobile |

Optional: `#client-automation-experiment` (`C0BTQ25TJUW`).

Canonical list also lives in:

- `js/slack-sources.js`
- `js/portal.js` → `REQUIRED_SLACK_CHANNELS`
- `data/runs.json` → `slackChannels`

## Refresh steps

1. Read latest bot posts from **every** required channel above.
2. Append new runs to `data/runs.json` (unique `id`).
3. Set `updatedAt` (UTC now).
4. Redeploy GitHub Pages and/or rebuild Product Ops single-file bundle under `dist/`.

In Cursor: ask to **“sync automation status from Slack”** — that should cover all channels in this table.
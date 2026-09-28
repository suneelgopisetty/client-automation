# Why the dashboard can look “stale”

This portal is a **static site**. The browser only loads `data/runs.json`.  
It does **not** call Slack live when you open the page.

## Slack sources

| Area | Channel |
|------|---------|
| FOX One LR | `#client-lr-automation-stats` |
| FOX One Apple TV | `#client-tvos-automation-stats` |
| FOX One TV Apps | `#client-tvapps-qaautomation-stats` |
| FOX One Mobile | `#client-mobile-automation-stats` |
| FOX One Web | `#foxone_web_alerts` |
| FOX Sports Mobile | `#fsapp-automation-test` |
| FOX Sports Web | `#fscom-automation-test` |
| FOX Weather Mobile | `#fw-automation-test` |
| Cross-product experiment | `#client-automation-experiment` |

## How to refresh data

1. Pull latest bot posts from the channels above (Cursor Slack tools or Slack UI).
2. Append new runs into `data/runs.json` (unique `id` per report URL / run id).
3. Set `updatedAt` to now (UTC).
4. Redeploy:
   - GitHub Pages: push `public/automation-status/`
   - Product Ops: re-upload `dist/Client_SDET_Automation_Status.html` (rebuild after data change)

## Note on “no new data”

If Slack channels have had **no new automation posts** since the last sync  
(e.g. FOX One LR last bot post ~24 Sep), the dashboard correctly stays on that data  
until a new run is posted.
/**
 * Client Automation portal (https://client-automation.fox.com)
 * Client SDET · FOX One / Sports / Weather automation status
 */

(function () {
  const DEFAULT_PRODUCTS = [
    { id: "foxone", label: "FOX One" },
    { id: "foxsports", label: "FOX Sports" },
    { id: "foxweather", label: "FOX Weather" },
  ];

  const DEFAULT_GROUPS = [
    {
      id: "lr",
      label: "Living Room (LR)",
      platforms: [
        { id: "roku", label: "Roku" },
        { id: "firetv", label: "FireTV" },
        { id: "appletv", label: "Apple TV" },
      ],
    },
    {
      id: "tvapps",
      label: "TV Apps",
      platforms: [
        { id: "samsung", label: "Samsung" },
        { id: "lg", label: "LG" },
        { id: "vizio", label: "VIZIO" },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      platforms: [
        { id: "iphone", label: "iPhone" },
        { id: "android", label: "Android" },
      ],
    },
    {
      id: "web",
      label: "Web",
      platforms: [{ id: "web", label: "Web" }],
    },
  ];

  const DEFAULT_PRODUCT_GROUPS = {
    foxone: [
      DEFAULT_GROUPS[0],
      DEFAULT_GROUPS[1],
      {
        id: "mobile",
        label: "Mobile",
        platforms: [
          { id: "iphone", label: "iPhone" },
          { id: "android", label: "Android" },
          { id: "web", label: "Web" },
        ],
      },
    ],
    foxsports: [DEFAULT_GROUPS[2], DEFAULT_GROUPS[3]],
    foxweather: [DEFAULT_GROUPS[0], DEFAULT_GROUPS[2]],
  };

  const PRODUCT_LOGOS = {
    // User-provided brand marks (local)
    foxone: "assets/fox-one-logo-on-dark.png",
    foxsports: "assets/fox-sports-logo.png",
    foxweather: "assets/fox-weather-logo.png",
  };

  const PRODUCT_LOGO_FALLBACK = {
    foxone: "assets/fox-one-logo.svg",
    foxsports: "assets/fox-sports-logo.png",
    foxweather: "assets/fox-weather-logo.png",
  };

  // Platform logos — Wikimedia Commons (original brand marks) + Simple Icons CDN
  const PLATFORM_LOGOS = {
    roku: "https://commons.wikimedia.org/wiki/Special:FilePath/Roku_logo.svg",
    firetv: "https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_Fire_TV_Logo.png",
    appletv: "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_TV_logo.svg",
    samsung: "https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_logo_wordmark.svg",
    lg: "https://commons.wikimedia.org/wiki/Special:FilePath/LG_logo_(2023).svg",
    vizio: "https://commons.wikimedia.org/wiki/Special:FilePath/VIZIO_logo.svg",
    iphone: "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_logo_black.svg",
    android: "https://commons.wikimedia.org/wiki/Special:FilePath/Android_logo_2023.svg",
    web: "assets/platform-web.svg",
  };

  const PLATFORM_LOGO_FALLBACK = {
    roku: "assets/platform-roku.svg",
    firetv: "assets/platform-firetv.svg",
    appletv: "assets/platform-appletv.svg",
    samsung: "assets/platform-samsung.svg",
    lg: "assets/platform-lg.svg",
    vizio: "assets/platform-vizio.svg",
    iphone: "assets/platform-iphone.svg",
    android: "assets/platform-android.svg",
    web: "assets/platform-web.svg",
  };

  // Alternate CDN if Wikimedia is blocked (browser-side)
  const PLATFORM_LOGO_ALT = {
    roku: "https://cdn.simpleicons.org/roku/FFFFFF",
    firetv: "https://cdn.simpleicons.org/amazon/FF9900",
    appletv: "https://cdn.simpleicons.org/appletv/FFFFFF",
    samsung: "https://cdn.simpleicons.org/samsung/FFFFFF",
    lg: "https://cdn.simpleicons.org/lg/FFFFFF",
    vizio: "https://cdn.simpleicons.org/vizio/F5A623",
    iphone: "https://cdn.simpleicons.org/apple/FFFFFF",
    android: "https://cdn.simpleicons.org/android/3DDC84",
    web: "assets/platform-web.svg",
  };

  function logoAlt(id) {
    if (PRODUCT_LOGOS[id]) return productLabel(id);
    const meta = platformMeta(id);
    return (meta.platform && meta.platform.label) || id;
  }

  function logoHtml(id, extraClass) {
    const GROUP_TEXT = { lr: "LR", tvapps: "TV", mobile: "MB", web: "WEB" };
    const isProduct = !!PRODUCT_LOGOS[id];
    const src = PRODUCT_LOGOS[id] || PLATFORM_LOGOS[id];
    if (!src) {
      const text = GROUP_TEXT[id] || String(id).slice(0, 3).toUpperCase();
      return `<span class="logo logo-${escapeHtml(id)} ${extraClass || ""}" aria-hidden="true">${escapeHtml(text)}</span>`;
    }

    const localFb = PRODUCT_LOGO_FALLBACK[id] || PLATFORM_LOGO_FALLBACK[id] || "";
    const altCdn = PLATFORM_LOGO_ALT[id] || "";
    // Chain: primary CDN → alt CDN → local asset
    let onerr = "";
    if (altCdn && localFb) {
      onerr = ` onerror="this.onerror=function(){this.onerror=null;this.src='${localFb}'};this.src='${altCdn}'"`;
    } else if (localFb) {
      onerr = ` onerror="this.onerror=null;this.src='${localFb}'"`;
    }

    const cls = isProduct
      ? `product-logo ${extraClass || ""}`
      : `platform-logo ${extraClass || ""}`;
    return `<img class="${cls}" src="${src}" alt="${escapeHtml(logoAlt(id))}"${onerr} />`;
  }

  let data = null;
  let selectedProduct = null;
  let selectedPlatform = null;
  let selectedGroupId = null;

  const els = {
    updated: document.getElementById("data-updated"),
    productTiles: document.getElementById("product-tiles"),
    chartsByClient: document.getElementById("charts-by-client"),
    chartsByPlatform: document.getElementById("charts-by-platform"),
    runnersList: document.getElementById("runners-list"),
    groupSections: document.getElementById("group-sections"),
    productHeading: document.getElementById("product-heading"),
    platformHeading: document.getElementById("platform-heading"),
    runList: document.getElementById("run-list"),
    runDetail: document.getElementById("run-detail"),
    home: document.getElementById("view-home"),
    product: document.getElementById("view-product"),
    platform: document.getElementById("view-platform"),
    detail: document.getElementById("view-detail"),
    backHome: document.getElementById("back-home"),
    backProduct: document.getElementById("back-product"),
    backPlatform: document.getElementById("back-platform"),
    navHome: document.getElementById("nav-home"),
    brandHome: document.getElementById("brand-home"),
    error: document.getElementById("load-error"),
  };

  let currentView = "home";

  function goHome() {
    selectedProduct = null;
    selectedPlatform = null;
    selectedGroupId = null;
    renderProducts();
    showView("home");
  }

  function products() {
    return data.products || DEFAULT_PRODUCTS;
  }

  function groups() {
    return data.groups || DEFAULT_GROUPS;
  }

  function groupsForProduct(productId) {
    const map = data.productGroups || DEFAULT_PRODUCT_GROUPS;
    return map[productId] || groups();
  }

  function platformsForProduct(productId) {
    const plats = [];
    groupsForProduct(productId).forEach((g) => {
      (g.platforms || []).forEach((p) => plats.push(p));
    });
    return plats;
  }

  function productLabel(id) {
    const p = products().find((x) => x.id === id);
    return (p && p.label) || id;
  }

  function platformMeta(platformId) {
    const pools = [groups()];
    Object.values(data.productGroups || DEFAULT_PRODUCT_GROUPS).forEach((gs) => pools.push(gs));
    for (const list of pools) {
      for (const g of list || []) {
        const p = (g.platforms || []).find((x) => x.id === platformId);
        if (p) return { group: g, platform: p };
      }
    }
    return { group: null, platform: { id: platformId, label: platformId } };
  }

  function showView(name) {
    currentView = name;
    els.home.classList.toggle("hidden", name !== "home");
    els.product.classList.toggle("hidden", name !== "product");
    els.platform.classList.toggle("hidden", name !== "platform");
    els.detail.classList.toggle("hidden", name !== "detail");
    const onHome = name === "home";
    if (els.navHome) {
      els.navHome.classList.toggle("is-home", onHome);
      els.navHome.disabled = onHome;
      els.navHome.setAttribute("aria-current", onHome ? "page" : "false");
    }
  }

  function statusClass(run) {
    if (!run) return "status-none";
    if (run.conclusion === "cancelled") return "status-warn";
    if ((run.failed || 0) > 0 || run.conclusion === "failure") return "status-fail";
    if (run.conclusion === "success" || (run.passed > 0 && run.failed === 0)) return "status-pass";
    return "status-warn";
  }

  function toneFromStatus(status) {
    if (status === "status-pass") return "tone-pass";
    if (status === "status-fail") return "tone-fail";
    if (status === "status-warn") return "tone-warn";
    return "tone-none";
  }

  function barClass(status) {
    if (status === "status-fail") return "fail";
    if (status === "status-warn") return "warn";
    return "";
  }

  function formatWhen(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(sec) {
    if (sec == null || sec < 0) return "—";
    const s = Math.round(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) return `${h}h ${m}m ${r}s`;
    if (m > 0) return `${m}m ${r}s`;
    return `${r}s`;
  }

  function calcPct(run) {
    if (!run || !run.total) return 0;
    return Math.round((run.passed / run.total) * 1000) / 10;
  }

  function summaryClass(line) {
    if (/fail/i.test(line)) return "bad";
    if (/skip/i.test(line)) return "skip";
    return "ok";
  }

  function featureIcon(cls) {
    if (cls === "bad") return "✕";
    if (cls === "skip") return "⏭";
    return "✓";
  }

  function sourceLine(run) {
    const parts = [productLabel(run.product)];
    if (run.device) parts.push(run.device);
    if (run.sourceDetail) parts.push(`(${run.sourceDetail})`);
    let line = parts.filter(Boolean).join(" · ");
    if (run.env) line += ` · ${run.env}`;
    if (run.appVersion) line += ` · ${run.appVersion}`;
    return line;
  }

  function runLinks(run) {
    if (Array.isArray(run.links) && run.links.length) return run.links;
    if (run.reportUrl) {
      return [{ label: run.reportLabel || "View Report", url: run.reportUrl, kind: "dashboard" }];
    }
    return [];
  }

  function reportLinksHtml(run, { compact } = {}) {
    const links = runLinks(run);
    if (!links.length) return "";
    const cls = compact ? "report-links report-links-compact" : "report-links";
    return `<div class="${cls}">${links
      .map((L) => {
        const kind = L.kind || "dashboard";
        const label = L.label || "View Report";
        return `<a class="report-link report-${escapeHtml(kind)}" href="${escapeHtml(L.url)}" target="_blank" rel="noopener noreferrer" data-report-link="1">${escapeHtml(label)}</a>`;
      })
      .join("")}</div>`;
  }

  function chipsHtml(run) {
    if (!run) return "";
    const parts = [
      `<span class="chip chip-pass">✓ ${run.passed} Passed</span>`,
      `<span class="chip chip-fail">✕ ${run.failed} Failed</span>`,
    ];
    if (run.skipped != null && run.skipped > 0) {
      parts.push(`<span class="chip chip-skip">⏭ ${run.skipped} Skipped</span>`);
    }
    if (run.env) {
      parts.push(`<span class="chip chip-env">${escapeHtml(run.env)}</span>`);
    }
    return `<div class="chips">${parts.join("")}</div>`;
  }

  function progressBar(pct, status) {
    const width = Math.max(0, Math.min(100, Number(pct) || 0));
    // Start at width:0 (see .bar > span default in CSS); JS flips on .filled
    // one animation frame after insertion so the transition actually fires.
    return `<div class="bar ${barClass(status)}" aria-hidden="true"><span style="--target-width:${width}%"></span></div>`;
  }

  // Call once after any innerHTML write that included progressBar() output.
  function animateBars(container) {
    const bars = (container || document).querySelectorAll(".bar > span:not(.filled)");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bars.forEach((el) => el.classList.add("filled"));
      });
    });
  }

  // A run counts as "fresh" if completed within this window — drives the
  // one-shot pulse + live badge so exec eyes land on what just changed.
  const FRESH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  function isFresh(run) {
    if (!run || !run.completedAt) return false;
    const t = new Date(run.completedAt).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t < FRESH_WINDOW_MS;
  }

  function freshBadgeHtml(run) {
    return isFresh(run)
      ? `<span class="fresh-badge"><i class="dot-live"></i>Just updated</span>`
      : "";
  }

  function runsFor(productId, platformId) {
    return (data.runs || [])
      .filter((r) => r.product === productId && r.platform === platformId)
      .slice()
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  }

  function runsForProduct(productId) {
    return (data.runs || []).filter((r) => r.product === productId);
  }

  function latestRun(productId, platformId) {
    return runsFor(productId, platformId)[0] || null;
  }

  function productCoverage(productId) {
    let covered = 0;
    let total = 0;
    platformsForProduct(productId).forEach((p) => {
      total += 1;
      if (latestRun(productId, p.id)) covered += 1;
    });
    return { covered, total };
  }

  function releaseLabel(run, index) {
    if (!run) return `R${index + 1}`;
    let ver = (run.releaseVersion || "").trim();
    if (!ver || /^latest$/i.test(ver)) {
      ver = (run.appVersion || "").split("#")[0].trim().split(" ")[0] || "";
    }
    if (ver && !/^latest$/i.test(ver) && ver.length <= 12) return ver;
    return `R${index + 1}`;
  }

  function releaseColors() {
    // Professional slate / teal / bronze — not traffic-light fruit palette
    return ["#5B7C99", "#3A9B8F", "#C4A35A"];
  }

  function shortVer(run, index) {
    if (!run) return "";
    let ver = releaseLabel(run, index);
    if (/^R\d$/.test(ver)) return ver;
    ver = ver.replace(/^v/i, "");
    return ver.length > 9 ? ver.slice(0, 8) : ver;
  }

  /** One stacked bar per platform: R1 (bottom) → R3 (top), segment height = pass % */
  function clientPlatformReleaseGraphSvg(productId) {
    const plats = platformsForProduct(productId);
    const colors = releaseColors();
    const yMax = 300;
    const H = 280;
    const padT = 12;
    const padB = 4;
    const plotH = H - padT - padB;

    const legend = colors
      .map(
        (c, i) =>
          `<span class="stack-legend-item"><i style="background:${c}"></i>R${i + 1}</span>`
      )
      .join("");

    const cols = plats
      .map((plat) => {
        const runs = recentRuns(runsFor(productId, plat.id), 3).slice().reverse(); // R1→R3
        const segments = [];
        let yCursor = padT + plotH;
        let bars = "";
        let labels = "";

        for (let i = 0; i < 3; i++) {
          const run = runs[i];
          if (!run) continue;
          const pct = Math.max(0, Math.min(100, runPct(run)));
          if (pct <= 0) continue;
          const h = Math.max((pct / yMax) * plotH, 8);
          const y = yCursor - h;
          const ver = shortVer(run, i);
          const date = shortDate(run.completedAt);
          const title = `${plat.label} · R${i + 1} · ${ver || "—"} · ${Math.round(pct)}% · ${date}`;
          bars += `<rect x="8" y="${y}" width="36" height="${h}" rx="3" fill="${colors[i]}" opacity="0.96"><title>${escapeHtml(title)}</title></rect>`;

          // Always label: inside if tall enough, else to the right of the segment
          const pctText = `${Math.round(pct)}%`;
          const verText = ver || `R${i + 1}`;
          if (h >= 28) {
            labels += `<text x="26" y="${y + h / 2 - (ver ? 2 : 0)}" text-anchor="middle" fill="#f8fafc" font-size="11" font-weight="700" font-family="urw-din, Barlow Condensed, sans-serif">${pctText}</text>`;
            if (ver && h >= 40) {
              labels += `<text x="26" y="${y + h / 2 + 12}" text-anchor="middle" fill="rgba(248,250,252,0.9)" font-size="9" font-family="urw-din, Barlow Condensed, sans-serif">${escapeHtml(verText)}</text>`;
            }
          } else {
            labels += `<text x="48" y="${y + h / 2 + 3}" text-anchor="start" fill="#e2e8f0" font-size="10" font-weight="600" font-family="urw-din, Barlow Condensed, sans-serif">${pctText} ${escapeHtml(verText)}</text>`;
          }
          segments.push({ i, pct, ver: verText, date });
          yCursor = y;
        }

        const tip = segments
          .map((s) => `R${s.i + 1}: ${s.pct}% ${s.ver} (${s.date})`)
          .join(" · ");

        return `
          <div class="stack-col" title="${escapeHtml(tip || plat.label)}">
            <svg class="stack-col-svg" viewBox="0 0 52 ${H}" width="52" height="${H}" aria-hidden="true">
              <line x1="8" y1="${padT}" x2="8" y2="${padT + plotH}" stroke="rgba(158,182,209,0.2)" stroke-width="1"/>
              <line x1="8" y1="${padT + plotH}" x2="44" y2="${padT + plotH}" stroke="rgba(158,182,209,0.35)" stroke-width="1"/>
              ${bars}
              ${labels}
            </svg>
            <div class="stack-logo-cell">${logoHtml(plat.id)}</div>
          </div>
        `;
      })
      .join("");

    // Shared Y scale (left)
    const yTicks = [0, 100, 200, 300]
      .map((y) => {
        const gy = padT + plotH - (y / yMax) * plotH;
        return `<text x="34" y="${gy + 4}" text-anchor="end" fill="#9eb6d1" font-size="11" font-family="urw-din, Barlow Condensed, sans-serif">${y}</text>
          <line x1="38" y1="${gy}" x2="48" y2="${gy}" stroke="rgba(158,182,209,0.35)" stroke-width="1"/>`;
      })
      .join("");

    return `
      <div class="stack-chart">
        <div class="stack-legend">${legend}<span class="stack-legend-note">R1 bottom → R3 top · pass %</span></div>
        <div class="stack-plot">
          <svg class="stack-yaxis" viewBox="0 0 48 ${H}" width="48" height="${H}" aria-hidden="true">${yTicks}</svg>
          <div class="stack-cols">${cols}</div>
        </div>
      </div>
    `;
  }

  function recentRuns(list, n) {
    return (list || [])
      .slice()
      .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))
      .slice(0, n);
  }

  function runPct(run) {
    if (!run) return 0;
    if (run.passRatePct != null) return Number(run.passRatePct);
    return calcPct(run);
  }

  function shortDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function barColor(run) {
    const status = statusClass(run);
    if (status === "status-fail") return "#ef4444";
    if (status === "status-warn") return "#f59e0b";
    if (status === "status-pass") return "#22c55e";
    return "#94a3b8";
  }

  /** Single-platform graph: last 3 releases (oldest → newest = R1→R3) */
  function releaseGraphSvg(runs) {
    const W = 320;
    const H = 168;
    const padL = 36;
    const padR = 12;
    const padT = 22;
    const padB = 40;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = 3;
    const gap = 14;
    const barW = Math.min(52, (plotW - gap * (n - 1)) / n);
    const colors = releaseColors();
    const ordered = runs.slice().reverse();

    const grid = [0, 25, 50, 75, 100]
      .map((y) => {
        const gy = padT + plotH - (y / 100) * plotH;
        return `
          <line x1="${padL}" y1="${gy}" x2="${W - padR}" y2="${gy}" stroke="rgba(158,182,209,0.18)" stroke-width="1"/>
          <text x="${padL - 6}" y="${gy + 3}" text-anchor="end" fill="#9eb6d1" font-size="9" font-family="urw-din, Barlow Condensed, sans-serif">${y}</text>
        `;
      })
      .join("");

    let bars = "";
    for (let i = 0; i < n; i++) {
      const run = ordered[i];
      const x = padL + i * (barW + gap) + (plotW - (barW * n + gap * (n - 1))) / 2;
      if (!run) {
        bars += `<rect x="${x}" y="${padT + plotH - 2}" width="${barW}" height="2" rx="4" fill="rgba(148,163,184,0.25)"/>
          <text x="${x + barW / 2}" y="${H - 10}" text-anchor="middle" fill="#9eb6d1" font-size="10" font-family="urw-din, Barlow Condensed, sans-serif">R${i + 1}</text>`;
        continue;
      }
      const pct = Math.max(0, Math.min(100, runPct(run)));
      const h = Math.max((pct / 100) * plotH, 2);
      const y = padT + plotH - h;
      const ver = releaseLabel(run, i);
      bars += `
        <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="5" fill="${colors[i]}" opacity="0.95">
          <title>${escapeHtml(ver)} · ${pct}% · ${escapeHtml(formatWhen(run.completedAt))}</title>
        </rect>
        <text x="${x + barW / 2}" y="${Math.max(padT + 10, y - 4)}" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="600" font-family="urw-din, Barlow Condensed, sans-serif">${Math.round(pct)}%</text>
        <text x="${x + barW / 2}" y="${H - 22}" text-anchor="middle" fill="#f0f0f0" font-size="10" font-weight="600" font-family="urw-din, Barlow Condensed, sans-serif">R${i + 1}</text>
        <text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle" fill="#9eb6d1" font-size="9" font-family="urw-din, Barlow Condensed, sans-serif">${escapeHtml(ver.length > 12 ? shortDate(run.completedAt) : ver)}</text>
      `;
    }

    return `
      <svg class="release-graph" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="Pass rate for last 3 releases">
        ${grid}
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="rgba(158,182,209,0.35)" stroke-width="1.5"/>
        <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="rgba(158,182,209,0.35)" stroke-width="1.5"/>
        ${bars}
      </svg>
    `;
  }

  function renderHomeCharts() {
    if (!els.chartsByClient || !els.chartsByPlatform) return;

    els.chartsByClient.innerHTML = products()
      .map((prod) => {
        return `
          <div class="chart-card chart-card-wide">
            <div class="chart-card-head">
              ${logoHtml(prod.id, "product-logo-sm")}
              <span class="chart-card-title">${escapeHtml(prod.label)}</span>
            </div>
            ${clientPlatformReleaseGraphSvg(prod.id)}
          </div>
        `;
      })
      .join("");

    const cards = [];
    products().forEach((prod) => {
      platformsForProduct(prod.id).forEach((plat) => {
        const runs = recentRuns(runsFor(prod.id, plat.id), 3);
        const ordered = runs.slice().reverse();
        const legend = [0, 1, 2]
          .map((i) => {
            const run = ordered[i];
            if (!run) {
              return `<div class="graph-legend-item"><span class="graph-legend-idx">R${i + 1}</span><span class="vbar-date">—</span></div>`;
            }
            return `<div class="graph-legend-item"><span class="graph-legend-idx">R${i + 1}</span><span class="vbar-date">${escapeHtml(releaseLabel(run, i))} · ${escapeHtml(shortDate(run.completedAt))}</span></div>`;
          })
          .join("");
        cards.push(`
          <div class="chart-card">
            <div class="chart-card-head">
              ${logoHtml(prod.id, "product-logo-sm")}
              ${logoHtml(plat.id)}
              <span class="chart-card-title">${escapeHtml(plat.label)}</span>
            </div>
            ${releaseGraphSvg(runs)}
            <div class="graph-legend">${legend}</div>
          </div>
        `);
      });
    });
    els.chartsByPlatform.innerHTML = cards.join("");
  }

    function runners() {
    return data.runners || [];
  }

  function runnerStatusLabel(status) {
    if (status === "busy") return "Busy";
    if (status === "online") return "Online";
    return "Offline";
  }

  function renderRunners() {
    if (!els.runnersList) return;
    const list = runners();
    const selfHost = list.filter((r) => r.type !== "cloud");
    const cloud = list.filter((r) => r.type === "cloud");

    function card(runner) {
      const st = runner.status || "offline";
      const pct =
        runner.lastPassRatePct != null ? `${runner.lastPassRatePct}%` : "—";
      return `
        <article class="runner-card status-${escapeHtml(st)}" title="${escapeHtml(runner.name)}">
          <div class="runner-card-top">
            ${logoHtml(runner.platform)}
            <span class="runner-status"><i></i>${escapeHtml(runnerStatusLabel(st))}</span>
          </div>
          <p class="runner-name">${escapeHtml(runner.name)}</p>
          <p class="runner-meta">${logoHtml(runner.product, "product-logo-sm")}</p>
          <div class="runner-stats">
            <span>${escapeHtml(runner.os || "—")}</span>
            <span>Last ${escapeHtml(pct)}</span>
          </div>
          <p class="runner-seen">Last run ${escapeHtml(formatWhen(runner.lastSeenAt))}</p>
        </article>
      `;
    }

    const selfHtml = selfHost.length
      ? selfHost.map(card).join("")
      : `<p class="chart-empty">No self-host devices recorded.</p>`;
    const cloudHtml = cloud.length
      ? `<p class="runners-group-label">Cloud / remote</p>${cloud.map(card).join("")}`
      : "";

    els.runnersList.innerHTML = selfHtml + cloudHtml;
  }

  function renderProducts() {
    els.productTiles.innerHTML = "";
    products().forEach((prod, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `tile tile-product tile-logo-only product-${prod.id} anim-in`;
      btn.style.setProperty("--delay", `${idx * 120}ms`);
      btn.setAttribute("aria-label", prod.label);
      btn.innerHTML = `
        <div class="tile-brand tile-brand-solo">${logoHtml(prod.id, "product-logo-lg")}</div>
      `;
      btn.addEventListener("click", () => openProduct(prod.id));
      els.productTiles.appendChild(btn);
    });
    renderHomeCharts();
    renderRunners();
  }

  function openProduct(productId) {
    selectedProduct = productId;
    selectedPlatform = null;
    selectedGroupId = null;
    const groupLabels = groupsForProduct(productId)
      .map((g) => g.label.replace(/\s*\(LR\)\s*/i, "").trim())
      .join(" · ");
    els.productHeading.innerHTML = `
      <div class="page-brand">${logoHtml(productId, "product-logo-lg")}</div>
      <div>
        <p class="sub">${escapeHtml(groupLabels || "Platforms")}</p>
      </div>
    `;
    renderGroups();
    showView("product");
  }

  function renderGroups() {
    els.groupSections.innerHTML = "";
    groupsForProduct(selectedProduct).forEach((group) => {
      const block = document.createElement("div");
      block.className = "group-block";
      block.innerHTML = `<p class="group-label">${logoHtml(group.id)} ${escapeHtml(group.label)}</p>`;
      const grid = document.createElement("div");
      grid.className = "tiles";

      (group.platforms || []).forEach((plat) => {
        const run = latestRun(selectedProduct, plat.id);
        const status = statusClass(run);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `tile ${status}${isFresh(run) ? " is-fresh" : ""}`;

        if (!run) {
          btn.innerHTML = `
            <div class="tile-top">${logoHtml(plat.id)}</div>
            <div class="rate-row"><p class="tile-rate tone-none">—</p></div>
            ${progressBar(0, "status-none")}
            <div class="chips"><span class="chip chip-neutral">No runs yet</span></div>
          `;
        } else {
          const pct = run.passRatePct != null ? run.passRatePct : calcPct(run);
          btn.innerHTML = `
            <div class="tile-top">${logoHtml(plat.id)}${freshBadgeHtml(run)}</div>
            <div class="rate-row">
              <p class="tile-rate ${toneFromStatus(status)}">${escapeHtml(String(pct))}%</p>
              <span class="rate-frac">${escapeHtml(String(run.passed))}/${escapeHtml(String(run.total))}</span>
            </div>
            ${progressBar(pct, status)}
            ${chipsHtml(run)}
            ${reportLinksHtml(run, { compact: true })}
            <p class="tile-when">Last run ${escapeHtml(formatWhen(run.completedAt))} · ${escapeHtml(formatDuration(run.durationSec))}</p>
          `;
        }

        btn.setAttribute("aria-label", plat.label);
        btn.title = plat.label;

        btn.addEventListener("click", (e) => {
          if (e.target.closest("[data-report-link]")) return;
          openPlatform(group.id, plat.id);
        });
        grid.appendChild(btn);
      });

      block.appendChild(grid);
      els.groupSections.appendChild(block);
    });
    animateBars(els.groupSections);
  }

  function openPlatform(groupId, platformId) {
    selectedGroupId = groupId;
    selectedPlatform = platformId;
    const meta = platformMeta(platformId);
    els.platformHeading.innerHTML = `
      ${logoHtml(platformId)}
      <div>
        <h2>${escapeHtml(productLabel(selectedProduct))}</h2>
        <p class="sub">${escapeHtml(meta.group ? meta.group.label : "")}</p>
      </div>
    `;
    els.platformHeading.setAttribute("aria-label", `${productLabel(selectedProduct)} · ${meta.platform.label}`);
    renderRunList();
    showView("platform");
  }

  function renderRunList() {
    const runs = runsFor(selectedProduct, selectedPlatform);
    els.runList.innerHTML = "";

    if (!runs.length) {
      els.runList.innerHTML = `<p class="empty">No automation runs recorded for this product + platform yet. Add entries to data/runs.json.</p>`;
      return;
    }

    runs.forEach((run) => {
      const pct = run.passRatePct != null ? run.passRatePct : calcPct(run);
      const status = statusClass(run);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `run-row ${status}`;
      btn.innerHTML = `
        ${logoHtml(run.platform)}
        <div class="run-row-main">
          <strong>${escapeHtml(formatWhen(run.completedAt))}</strong>
          <div class="source">${escapeHtml(sourceLine(run))}</div>
          <div style="margin-top:0.45rem">${chipsHtml(run)}</div>
          ${reportLinksHtml(run, { compact: true })}
        </div>
        <div class="run-row-stats">
          <span class="rate ${toneFromStatus(status)}">${escapeHtml(String(pct))}%</span>
          ${progressBar(pct, status)}
          <span class="chip chip-neutral">${escapeHtml(formatDuration(run.durationSec))}</span>
        </div>
      `;
      btn.addEventListener("click", (e) => {
        if (e.target.closest("[data-report-link]")) return;
        openDetail(run.id);
      });
      els.runList.appendChild(btn);
    });
    animateBars(els.runList);
  }

  function openDetail(runId) {
    const run = (data.runs || []).find((r) => String(r.id) === String(runId));
    if (!run) return;

    const pct = run.passRatePct != null ? run.passRatePct : calcPct(run);
    const status = statusClass(run);
    const summary = run.executionSummary || [];
    const failures = run.failures || [];
    const meta = platformMeta(run.platform);
    const isTvApps = meta.group && meta.group.id === "tvapps";
    const skipped = run.skipped != null ? run.skipped : Math.max(0, run.total - run.passed - run.failed);

    const featuresHtml = summary.length
      ? `<div class="feature-grid">${summary
          .map((line) => {
            const cls = summaryClass(line);
            return `<div class="feature-row ${cls}"><span class="feature-icon">${featureIcon(cls)}</span><span class="feature-text">${escapeHtml(line)}</span></div>`;
          })
          .join("")}</div>`
      : `<p class="empty">No execution summary recorded.</p>`;

    const failHtml = failures.length
      ? `<ul class="failure-list">${failures.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
      : `<p class="empty">No failures.</p>`;

    els.runDetail.className = `run-detail ${status}`;
    els.runDetail.innerHTML = `
      <div class="detail-hero">
        <div style="display:flex;gap:0.85rem;align-items:center">
          ${logoHtml(run.product, "product-logo-sm")}
          ${logoHtml(run.platform)}
          <div>
            <h2>E2E Automation Sanity Completed</h2>
            <p class="hero-meta">${escapeHtml(productLabel(run.product))}${meta.group ? ` · ${escapeHtml(meta.group.label)}` : ""}</p>
          </div>
        </div>
        <div class="chips">${run.env ? `<span class="chip chip-env">${escapeHtml(run.env)}</span>` : ""}${run.conclusion ? `<span class="chip chip-neutral">${escapeHtml(run.conclusion)}</span>` : ""}</div>
      </div>

      ${reportLinksHtml(run)}

      <div class="stat-cards">
        <div class="stat-card"><label>Pass Rate</label><div class="val ${toneFromStatus(status).replace("tone-", "")}">${escapeHtml(String(pct))}%</div></div>
        <div class="stat-card"><label>Passed</label><div class="val pass">${escapeHtml(String(run.passed))}</div></div>
        <div class="stat-card"><label>Failed</label><div class="val fail">${escapeHtml(String(run.failed))}</div></div>
        <div class="stat-card"><label>Skipped</label><div class="val skip">${escapeHtml(String(skipped))}</div></div>
      </div>
      ${progressBar(pct, status)}

      <div class="detail-grid">
        <div class="detail-field"><label>Source</label><p><code>${escapeHtml(sourceLine(run))}</code></p></div>
        <div class="detail-field"><label>Duration</label><p>${escapeHtml(formatDuration(run.durationSec))}</p></div>
        <div class="detail-field"><label>Total cases</label><p>${escapeHtml(String(run.total))} (${escapeHtml(String(run.passed))}/${escapeHtml(String(run.total))})</p></div>
        <div class="detail-field"><label>Completed</label><p>${escapeHtml(formatWhen(run.completedAt))}</p></div>
        <div class="detail-field"><label>Build</label><p>${escapeHtml(run.appVersion || "—")}</p></div>
        <div class="detail-field"><label>Device</label><p>${escapeHtml(run.device || "—")}</p></div>
      </div>

      <p class="section-label">${isTvApps ? "Feature Results" : "Execution Summary"}</p>
      ${featuresHtml}
      <p class="section-label">Failures (${failures.length})</p>
      ${failHtml}
    `;
    showView("detail");
    animateBars(els.runDetail);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  els.backHome.addEventListener("click", goHome);

  els.backProduct.addEventListener("click", () => {
    selectedPlatform = null;
    if (selectedProduct) {
      openProduct(selectedProduct);
    } else {
      goHome();
    }
  });

  els.backPlatform.addEventListener("click", () => {
    if (selectedProduct && selectedPlatform) {
      renderRunList();
      showView("platform");
    } else if (selectedProduct) {
      openProduct(selectedProduct);
    } else {
      goHome();
    }
  });

  if (els.navHome) els.navHome.addEventListener("click", goHome);
  if (els.brandHome) els.brandHome.addEventListener("click", goHome);
  document.querySelectorAll("[data-go-home]").forEach((btn) => {
    btn.addEventListener("click", goHome);
  });

  async function init() {
    try {
      const res = await fetch("data/runs.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`Could not load data/runs.json (${res.status})`);
      data = await res.json();
      els.updated.textContent = data.updatedAt
        ? `Data updated ${formatWhen(data.updatedAt)}`
        : "";
      renderProducts();
      showView("home");
    } catch (err) {
      els.error.textContent =
        err.message +
        ". Serve this folder over HTTP (not file://) so runs.json can load.";
      els.error.classList.remove("hidden");
      els.updated.textContent = "";
    }
  }

  init();
})();

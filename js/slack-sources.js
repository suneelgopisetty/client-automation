/**
 * Canonical Slack sources for Client Automation status.
 * Always keep these channels in sync code + docs — do not drop silently.
 */
(function (root) {
  const SLACK_SOURCES = [
    {
      key: "foxone_lr",
      channel: "#client-lr-automation-stats",
      channelId: "C0BL2TSJQJU",
      product: "foxone",
      platforms: ["roku", "firetv"],
    },
    {
      key: "foxone_appletv",
      channel: "#client-tvos-automation-stats",
      channelId: "C0C17FDE5C4",
      product: "foxone",
      platforms: ["appletv"],
    },
    {
      key: "foxone_tvapps",
      channel: "#client-tvapps-qaautomation-stats",
      channelId: "C0A0GUX2KKJ",
      product: "foxone",
      platforms: ["samsung", "lg", "vizio"],
    },
    {
      key: "foxone_mobile",
      channel: "#client-mobile-automation-stats",
      channelId: "C0BD8H7AXV3",
      product: "foxone",
      platforms: ["iphone", "android"],
    },
    {
      key: "foxone_web",
      channel: "#foxone_web_alerts",
      channelId: "C0986VDQV4Z",
      product: "foxone",
      platforms: ["web"],
    },
    {
      key: "foxsports_mobile",
      channel: "#fsapp-automation-test",
      channelId: "C0BMMT4BPD1",
      product: "foxsports",
      platforms: ["iphone", "android"],
    },
    {
      key: "foxsports_web",
      channel: "#fscom-automation-test",
      channelId: "C0BGFTYG8QN",
      product: "foxsports",
      platforms: ["web"],
    },
    {
      key: "foxweather_mobile",
      channel: "#fw-automation-test",
      channelId: "C0BK8QKSVSN",
      product: "foxweather",
      platforms: ["iphone", "android"],
    },
    {
      key: "client_automation_experiment",
      channel: "#client-automation-experiment",
      channelId: "C0BTQ25TJUW",
      product: null,
      platforms: [],
      optional: true,
    },
  ];

  root.CLIENT_AUTOMATION_SLACK_SOURCES = SLACK_SOURCES;
})(typeof window !== "undefined" ? window : globalThis);

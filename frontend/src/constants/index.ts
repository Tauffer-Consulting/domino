export const taskStatesColorMap = {
  success: "#02b120",
  failed: "#ff0000",
  upstream_failed: "#ff6600",
  running: "#00bfff",
  skipped: "#ffcc00",
  up_for_retry: "#ffcc00",
  up_for_reschedule: "#7b00b4",
  queued: "#aaaaaa",
  scheduled: "#00ffaa",
  none: "#ffffff",
  deferred: "#00ffaa",
  removed: "#000000",
  restarting: "#8ee7fd",
  default: "#ffffff",
};

export const storageOptions = [
  {
    name: "None",
    fields: [],
  },
  {
    name: "AWS s3",
    fields: ["AWS Access Key ID"],
  },
];

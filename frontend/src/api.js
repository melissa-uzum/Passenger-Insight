export const api = {
  health: async () => ({ status: "ok", demo: true }),

  flowsLatest: async () => ({
    data: [
      { name: "Arlanda Terminal 1", in_total: 120, out_total: 95 },
      { name: "Arlanda Terminal 5", in_total: 380, out_total: 260 },
      { name: "Stockholm C", in_total: 240, out_total: 220 },
      { name: "Kungsholmen Security Transit", in_total: 48, out_total: 22 },
    ],
    demo: true,
  }),

  flowsHistory: async () => {
    const now = Date.now();
    const hours = Array.from({ length: 12 }, (_, i) => new Date(now - i * 3600e3));
    const data = hours.map((h) => ({
      station_id: 1,
      name: "Arlanda Terminal 1",
      bucket: h.toISOString(),
      in_sum: Math.floor(Math.random() * 100),
      out_sum: Math.floor(Math.random() * 80),
    }));
    return { data, demo: true };
  },

  incidents: async () => ({
    data: [
      { station_id: 1, name: "Arlanda Terminal 1", status: "ok", reasons: [], latest_timestamp: new Date() },
      { station_id: 2, name: "Arlanda Terminal 5", status: "warning", reasons: ["spike"], latest_timestamp: new Date() },
      { station_id: 3, name: "Kungsholmen Security Transit", status: "critical", reasons: ["stale"], latest_timestamp: null },
    ],
    demo: true,
  }),

  login: async () => ({ token: "demo" }),
  postFlow: async () => ({ status: "ok" }),
};

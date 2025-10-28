export const api = {
  health: async () => ({ status: "ok", demo: true }),

  flowsLatest: async () => ({
    data: [
      { name: "Arlanda Terminal 1", in_total: 62, out_total: 41 },
      { name: "Arlanda Terminal 5", in_total: 380, out_total: 260 },
      { name: "Stockholm C", in_total: 18, out_total: 25 },
      { name: "Kungsholmen Security Transit", in_total: 48, out_total: 22 },
    ],
    demo: true,
  }),

  flowsHistory: async () => {
    const now = Date.now();
    const hours = Array.from({ length: 12 }, (_, i) => new Date(now - i * 3600e3));
    const stations = [
      "Arlanda Terminal 1",
      "Arlanda Terminal 5",
      "Stockholm C",
      "Kungsholmen Security Transit",
    ];
    const data = [];
    for (const s of stations) {
      for (const h of hours) {
        data.push({
          station_id: stations.indexOf(s) + 1,
          name: s,
          bucket: h.toISOString(),
          in_sum: Math.floor(Math.random() * 100),
          out_sum: Math.floor(Math.random() * 80),
        });
      }
    }
    return { data, demo: true };
  },

  incidents: async () => ({
    data: [
      {
        station_id: 1,
        name: "Arlanda Terminal 1",
        status: "ok",
        reasons: [],
        latest_timestamp: new Date(),
      },
      {
        station_id: 2,
        name: "Arlanda Terminal 5",
        status: "warning",
        reasons: ["spike", "crowded"],
        latest_timestamp: new Date(),
      },
      {
        station_id: 3,
        name: "Stockholm C",
        status: "critical",
        reasons: ["stale", "sensor error"],
        latest_timestamp: null,
      },
      {
        station_id: 4,
        name: "Kungsholmen Security Transit",
        status: "warning",
        reasons: ["drop"],
        latest_timestamp: new Date(),
      },
      {
        station_id: 2,
        name: "Arlanda Terminal 5",
        status: "critical",
        reasons: ["overload", "maintenance"],
        latest_timestamp: new Date(),
      },
      {
        station_id: 3,
        name: "Stockholm C",
        status: "ok",
        reasons: [],
        latest_timestamp: new Date(),
      },
    ],
    demo: true,
  }),

  login: async () => ({ token: "demo" }),
  postFlow: async () => ({ status: "ok" }),
};

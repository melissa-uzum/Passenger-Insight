import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function IncidentCards() {
  const [items, setItems] = useState([]);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let alive = true;
    api.incidents()
      .then((r) => {
        if (!alive) return;
        setItems(r?.data ?? []);
        setDemo(Boolean(r?.demo));
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
        setDemo(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const badge = (status) => {
    const label =
      status === "critical"
        ? "Kritisk"
        : status === "warning"
        ? "Varning"
        : "OK";
    const tone =
      status === "critical" ? "crit" : status === "warning" ? "warn" : "ok";
    return <span className={`pi-chip ${tone}`}>{label}</span>;
  };

  const reasonText = (reasons) => {
    if (!reasons || reasons.length === 0) return "Normal";
    return reasons
      .map((r) =>
        r === "stale"
          ? "Inget data (30 min)"
          : r === "spike"
          ? "Spik"
          : r === "drop"
          ? "Låg nivå"
          : r === "overload"
          ? "Överbelastning"
          : r === "sensor error"
          ? "Sensorfel"
          : r === "maintenance"
          ? "Underhåll"
          : r
      )
      .join(" · ");
  };

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {demo && <span className="pi-chip demo">Demo</span>}
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {items.map((it) => (
          <div key={`${it.station_id}-${it.name}`} className="pi-card">
            <div
              className="pi-card__title"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{it.name}</span>
              {badge(it.status)}
            </div>
            <div className="pi-card__sub">{reasonText(it.reasons)}</div>
            <div className="pi-card__sub" style={{ marginTop: 4 }}>
              Senaste:{" "}
              {it.latest_timestamp
                ? new Date(it.latest_timestamp).toLocaleString()
                : "—"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

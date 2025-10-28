import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function Charts({ data = [], history = [] }) {
  const barRef = useRef(null);
  const lineRef = useRef(null);
  const barInstance = useRef(null);
  const lineInstance = useRef(null);

  const destroyIfAny = (ref) => {
    if (ref.current) {
      ref.current.destroy();
      ref.current = null;
    }
  };

  useEffect(() => {
    if (!barRef.current) return;
    destroyIfAny(barInstance);

    const labels = data.map((d) => d.name);
    const inData = data.map((d) => Number(d.in_total || 0));
    const outData = data.map((d) => Number(d.out_total || 0));

    barInstance.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "In", data: inData },
          { label: "Out", data: outData },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => destroyIfAny(barInstance);
  }, [data]);

  useEffect(() => {
    if (!lineRef.current || history.length === 0) return;
    destroyIfAny(lineInstance);

    const buckets = [...new Set(history.map((r) => r.bucket))];
    const stations = [...new Set(history.map((r) => r.name))];

    const datasets = stations.map((name) => {
      const series = buckets.map(
        (b) =>
          Number(history.find((r) => r.name === name && r.bucket === b)?.in_sum) || 0
      );
      return { label: `${name} (in)`, data: series, tension: 0.2 };
    });

    lineInstance.current = new Chart(lineRef.current, {
      type: "line",
      data: { labels: buckets, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true } },
      },
    });

    return () => destroyIfAny(lineInstance);
  }, [history]);

  return (
    <div>
      <div style={{ width: "100%", height: 340 }}>
        <canvas ref={barRef} />
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 32, width: "100%", height: 340 }}>
          <canvas ref={lineRef} />
        </div>
      )}
    </div>
  );
}

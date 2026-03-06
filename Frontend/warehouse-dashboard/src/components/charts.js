import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Charts({ metrics }) {
  if (!metrics) return null;

  const data = {
    labels: ["Occupied", "Empty", "Reserved", "Blocked"],
    datasets: [
      {
        label: "Warehouse Slots",
        data: [
          metrics.occupied,
          metrics.empty,
          metrics.reserved,
          metrics.blocked
        ],
        backgroundColor: [
          "#58a6ff", // Accent blue
          "#238636", // Success green
          "#d29922", // Warning yellow
          "#da3633"  // Danger red
        ],
        borderColor: [
          "#161b22", "#161b22", "#161b22", "#161b22"
        ],
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: "#c9d1d9",
          font: {
            family: "'Inter', sans-serif",
            size: 13
          }
        }
      },
      tooltip: {
        backgroundColor: "rgba(22, 27, 34, 0.9)",
        titleColor: "#fff",
        bodyColor: "#c9d1d9",
        borderColor: "#30363d",
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div style={{ width: "100%", height: "260px" }}>
      <Pie data={data} options={options} />
    </div>
  );
}

export default Charts;
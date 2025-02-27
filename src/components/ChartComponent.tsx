import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register required components from Chart.js
Chart.register(...registerables);

interface ChartProps {
  chartType: "bar" | "line" | "pie";
  data: number[];
  labels: string[];
}

const ChartComponent: React.FC<ChartProps> = ({ chartType, data, labels }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Spreadsheet Data",
        data,
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
        borderColor: "#333",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "400px", height: "300px" }}>
      {chartType === "bar" && <Bar data={chartData} />}
      {chartType === "line" && <Line data={chartData} />}
      {chartType === "pie" && <Pie data={chartData} />}
    </div>
  );
};

export default ChartComponent;

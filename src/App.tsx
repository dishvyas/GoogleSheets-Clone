import React, { useRef, useState } from "react";
import Spreadsheet from "./components/Spreadsheet";
import SpreadsheetToolbar from "./components/Toolbar";
import { HotTable } from "@handsontable/react";
import ChartComponent from "./components/ChartComponent";
import  Bar  from "./components/Bar"
const App: React.FC = () => {

  const hotRef = useRef<HotTable>(null!);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | null>(null);

  const createChart = (type: "bar" | "line" | "pie") => {
    if (!hotRef.current?.hotInstance) return;

    const hot = hotRef.current.hotInstance;
    const tableData = hot.getData(); // Get the whole table data

    if (tableData.length < 2) {
      alert("Not enough data to create a chart!");
      return;
    }

    // ✅ Extract labels (first column) and numerical values (second column)
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 1; i < tableData.length; i++) { // Skip header row
      const label = tableData[i][0]; // First column (e.g., Name, Total, Avg Age)
      const value = Number(tableData[i][1]); // Second column (Age, sum, avg)

      if (!isNaN(value)) {
        labels.push(label);
        data.push(value);
      }
    }

    if (data.length === 0) {
      alert("No numerical data found in the table!");
      return;
    }

    setChartData(data);
    setChartLabels(labels);
    setChartType(type);
  };

 
  return (
    <div>
      <SpreadsheetToolbar hotRef={hotRef} onCreateChart={createChart} />
      <Spreadsheet hotRef={hotRef} />
      {chartType && <ChartComponent chartType={chartType} data={chartData} labels={chartLabels} />}
    </div>
  );
};

export default App;

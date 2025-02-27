import React, { useEffect, useRef, useState } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.min.css";
import { HyperFormula } from "hyperformula";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import type { CellProperties } from "handsontable/settings"; 
import ChartComponent from "./ChartComponent";
import Toolbar from "./Toolbar";
import SpreadsheetToolbar from "./Toolbar";

registerAllModules();

const LOCAL_STORAGE_KEY = "spreadsheetData";



const Spreadsheet: React.FC<{ hotRef: React.RefObject<HotTable> }> = ({ hotRef }) => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | null>(null);
  useEffect(() => {
    if (hotRef.current?.hotInstance) {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        hotRef.current.hotInstance.loadData(JSON.parse(savedData));
      }
    }
  }, []);


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


  const customCellRenderer = (
    instance: Handsontable.Core,  // ✅ Correct Core usage
    td: HTMLTableCellElement,
    row: number,
    col: number,
    prop: string | number,
    value: any,
    cellProperties: CellProperties
  ) => {
    // ✅ Use the default text renderer first
    Handsontable.renderers.TextRenderer(instance, td, row, col, prop, value, cellProperties);
  
    // ✅ Retrieve and apply custom styles
    const styles = instance.getCellMeta(row, col).style || {};
    if (styles.fontWeight) td.style.fontWeight = styles.fontWeight;
    if (styles.fontStyle) td.style.fontStyle = styles.fontStyle;
    if (styles.fontSize) td.style.fontSize = styles.fontSize;
    if (styles.color) td.style.color = styles.color;

    if (typeof value === "string" && value.startsWith("=")) {
      try {
        const hfInstance = HyperFormula.buildEmpty();
        const sheetName = "Sheet1";
        hfInstance.addSheet(sheetName); // Adds a new sheet
        const sheetId = hfInstance.getSheetId(sheetName) as number; // Get numerical sheet ID
    
        if (sheetId !== undefined) {
          hfInstance.calculateFormula(value.slice(1), sheetId);
          td.style.color = "black";
        } else {
          throw new Error("Invalid sheet ID");
        }
      } catch (error) {
        console.log("ERROR CAUGHT?");
        alert("Incorrect Formula!!!");
        // td.style.color = "red"; // Highlight incorrect formulas
      }
    }
      
  };
  
  // ✅ Register the renderer
  Handsontable.renderers.registerRenderer("customRenderer", customCellRenderer);
  const saveData = () => {
    if (hotRef.current?.hotInstance) {
      const data = hotRef.current.hotInstance.getData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      alert("Spreadsheet saved!");
    }
  };

  return (
    <div>
      {/* <SpreadsheetToolbar hotRef={hotRef} onCreateChart={createChart} /> */}
      <HotTable
        ref={hotRef}
        data={[
          ["Name", "Age", "Salary"],
          ["Alice", 25, 5000],
          ["Bob", 30, 7000],
          ["Total", "=SUM(B2:B3)", "=SUM(C2:C3)"],
          ["Avg Age", "=AVERAGE(B2:B3)", ""],
          ["Max Salary", "", "=MAX(C2:C3)"],
          ["Min Age", "=MIN(B2:B3)", ""],
          ["Count Employees", "=COUNT(B2:B3)", ""],
          ["Eligible for Bonus", '=IF(C2>6000, "Yes", "No")', '=IF(C3>6000, "Yes", "No")'],
          ["Highest Salary", '=VLOOKUP(MAX(C2:C3), C2:C3, 1, FALSE)', ""],
        ]}
        formulas={{ engine: HyperFormula }}
        colHeaders={true}
        rowHeaders={true}
        manualRowResize={true}
        manualColumnResize={true}
        undo={true}
        width="100%"
        height="500px"
        licenseKey="non-commercial-and-evaluation"
        
        // Enable formula dragging
        fillHandle={true} 
        
        // Enable drag-and-drop cell movement
        allowInsertRow={true}
        allowInsertColumn={true}
        manualRowMove={true}
        manualColumnMove={true}

        // Data validation example (restrict Age column to numbers only)
        cells={(row, col) => {
          if (col === 1 || col === 2) { // Apply validation to "Age" (col 1) & "Salary" (col 2)
            return { type: "numeric", allowInvalid: false, renderer: "customRenderer" };
          }
          return {};
        }}
      />
      {/* {chartType && <ChartComponent chartType={chartType} data={chartData} labels={chartLabels} />} */}
    </div>
  );
};

export default Spreadsheet;




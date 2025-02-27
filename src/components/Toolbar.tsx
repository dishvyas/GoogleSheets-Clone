import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Button, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { HotTable } from "@handsontable/react";
import { createTheme, ThemeProvider, styled } from "@mui/material/styles";
import { green } from "@mui/material/colors";
import Bar from "./Bar"; 

interface Props {
  hotRef: React.RefObject<HotTable>;
  onCreateChart: (chartType: "bar" | "line" | "pie") => void;
}

const theme = createTheme({
  palette: {
    primary: {
      main: green[200],
    },
    secondary: {
      main: green[500],
    },
  },
});


const LOCAL_STORAGE_KEY = "spreadsheetData";

const SpreadsheetToolbar: React.FC<Props> = ({ hotRef, onCreateChart }) => {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [selectedValue, setSelectedValue] = useState<any>(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState("#000000");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (hotRef.current?.hotInstance) {
      const hot = hotRef.current.hotInstance;
  
      hot.addHook("afterSelection", (startRow, startCol, endRow, endCol) => {
        if (startCol === endCol) {
          console.log(`✅ Column Selected: ${startCol}`);
          setSelectedColumn(startCol); // Store column index
        } else {
          setSelectedColumn(null); // Reset if multi-column or row selection
        }
      });
    }
  }, [hotRef]);

  useEffect(() => {
    if (hotRef.current?.hotInstance) {
      const hot = hotRef.current.hotInstance;
  
      hot.addHook("afterSelection", (row, col) => {
        console.log(`✅ Cell Selected: (${row}, ${col})`);
        setSelectedCell([row, col]); // Store selected cell coordinates
        setSelectedValue(hot.getDataAtCell(row, col)); // Store selected cell value
      });
    }
  }, [hotRef]);
  
  useEffect(() => {
    // console.log("📌 Current Selected Cell:", selectedCell);
    // console.log("📌 Current Selected Value:", selectedValue);
  }, [selectedCell, selectedValue]);
    

  useEffect(() => {
    if (hotRef.current?.hotInstance) {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        hotRef.current.hotInstance.loadData(JSON.parse(savedData));
      }
    }
  }, []);

  /** ✅ Apply Formatting to Cells (Bold, Italic, Font Size, Color) */
  const applyFormat = (formatType: "bold" | "italic" | "fontSize" | "color", value?: any) => {
    if (!hotRef.current?.hotInstance || !selectedCell) return;

    const hot = hotRef.current.hotInstance;
    const [row, col] = selectedCell;

    // 🔥 Get existing styles or create a new object
    const currentMeta = hot.getCellMeta(row, col);
    const currentStyle = currentMeta.style || {};
    // console.log("CURRENT STYLE : ", currentStyle);
    console.log("SELECTED CELL inside bold : ", selectedCell);

    switch (formatType) {
      case "bold":
        // console.log("Format Type : ",formatType);
        currentStyle.fontWeight = currentStyle.fontWeight === "bold" ? "normal" : "bold";
        break;
      case "italic":
        currentStyle.fontStyle = currentStyle.fontStyle === "italic" ? "normal" : "italic";
        break;
      case "fontSize":
        currentStyle.fontSize = `${value}px`;
        setFontSize(value);
        break;
      case "color":
        currentStyle.color = value;
        setTextColor(value);
        break;
    }

    hot.setCellMeta(row, col, "style", currentStyle);
    hot.render(); // 🔄 Re-render Handsontable to reflect changes
  };

  const saveData = () => {
    if (hotRef.current?.hotInstance) {
      const data = hotRef.current.hotInstance.getData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      alert("Spreadsheet saved!");
    }
  };

  const handleFindReplace = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;

    const data: (string | number | null)[][] = hot.getData();
    const foundCells: [number, number][] = [];

    data.forEach((row, rowIndex) => {
      row.forEach((cell: any, colIndex) => {
        if (cell === findText) {
          foundCells.push([rowIndex, colIndex]);
        }
      });
    });

    if (foundCells.length === 0) {
      alert(`No matches found for "${findText}"`);
      return;
    }

    // Highlight if no replace text is given
    if (replaceText.trim() === "") {
      foundCells.forEach(([row, col]) => {
        hot.getCellMeta(row, col).className = "highlight";
      });
      hot.render();
    } else {
      // Replace text
      const updatedData = data.map((row) =>
        row.map((cell: any) => (cell === findText ? replaceText : cell))
      );

      hot.loadData(updatedData);
      alert(`Replaced ${foundCells.length} occurrences of "${findText}" with "${replaceText}".`);
    }
  };

  const applyFunction = (fn: string) => {
    const hot = hotRef.current?.hotInstance;
    if (!hot || !selectedCell) {
      console.error("❌ HotTable instance is null or no cell selected");
      return;
    }

    const [row, col] = selectedCell;
    const value = hot.getDataAtCell(row, col);

    if (typeof value === "string") {
      let newValue = value;
      switch (fn) {
        case "TRIM":
          newValue = value.trim();
          break;
        case "UPPER":
          newValue = value.toUpperCase();
          break;
        case "LOWER":
          newValue = value.toLowerCase();
          break;
      }

      hot.setDataAtCell(row, col, newValue);
      hot.render();
    }
  };

  const removeDuplicates = () => {
    if (!hotRef.current?.hotInstance) return;
  
    const hot = hotRef.current.hotInstance;
  
    if (selectedColumn === null) {
      console.log("❌ No column selected! Please select a column first.");
      alert("Please select a column before removing duplicates.");
      return;
    }
  
    console.log(`✅ Removing duplicate values from Column: ${selectedColumn}`);
  
    let data = hot.getData();
    const seen = new Set<string | number | null>();
  
    // ✅ Iterate over rows and replace duplicates with an empty value instead of removing the row
    data = data.map((row) => {
      if (seen.has(row[selectedColumn])) {
        row[selectedColumn] = null; // Replace duplicate value with null (or empty string if preferred: "")
      } else {
        seen.add(row[selectedColumn]);
      }
      return row;
    });
  
    hot.loadData([...data]); // Update Handsontable
    console.log("✅ Duplicate values removed from column:", selectedColumn);
  };

  const handleImport = (type: "csv" | "excel") => {
    alert(`Importing ${type} file (Implementation needed)`);
  };

  const handleExport = (type: "csv" | "excel") => {
    alert(`Exporting ${type} file (Implementation needed)`);
  };

  const handleUndo = () => {
    const hot = hotRef.current?.hotInstance;
    if (hot) hot.undo();
  };

  const handleRedo = () => {
    const hot = hotRef.current?.hotInstance;
    if (hot) hot.redo();
  };

    const handleAddRow = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot) return;
        // console.log("Current Row : ", selectedCell);
        const currentRow = selectedCell ? selectedCell[0] : null;
        const currentCol = selectedCell ? selectedCell[1] : null;
        hot.alter("insert_row_below", (currentRow ?? hot.countRows() - 1) + 1); // Inserts a row below the last row
    };
  
    const handleDeleteRow = () => {
        const hot = hotRef.current?.hotInstance;
        if (!hot || !selectedCell) {
        alert("Please select a row to delete.");
        return;
    }
  
    const [rowIndex] = selectedCell;
    if (rowIndex < 0 || rowIndex >= hot.countRows()) {
      alert("Invalid row selection.");
      return;
    }
  
    hot.alter("remove_row", rowIndex);
  };
  
  const handleAddCol = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
  
    // If a column is selected, insert next to it; otherwise, insert at the end
    const colIndex = selectedColumn !== null ? selectedColumn + 1 : hot.countCols();
    console.log(`✅ Adding column at index: ${colIndex}`);
    const currentRow = selectedCell ? selectedCell[0] : null;
    const currentCol = selectedCell ? selectedCell[1] : null;
    hot.alter("insert_col_end", (currentRow ?? hot.countRows() - 1) + 1);
  };
  
  const handleDeleteCol = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
  
    if (selectedColumn === null) {
      console.log("❌ No column selected for deletion.");
      alert("Please select a column to delete.");
      return;
    }
  
    console.log(`🗑️ Deleting column: ${selectedColumn}`);
    hot.alter("remove_col", selectedColumn);
    setSelectedColumn(null); // Reset selection after deletion
  };
  

  return (
    <ThemeProvider theme={theme}>
    <AppBar position="static">
      <Toolbar>
        {/* ✅ Integrated Bar Component */}
        <Bar
          onSave={saveData}
          onImport={handleImport}
          onExport={handleExport}
          onUndo={handleUndo}
          onRedo={handleRedo}
          // onDeleteRow={handleDeleteRow}
          // onDeleteCol={handleDeleteCol}
        />
        {/* ✅ Bold Button */} 
        <IconButton color="inherit" onClick={() => applyFormat("bold")}>
          <FormatBoldIcon />
        </IconButton>

        {/* ✅ Italic Button */}
        <IconButton color="inherit" onClick={() => applyFormat("italic")}>
          <FormatItalicIcon />
        </IconButton>

        {/* ✅ Font Size Input */}
        {/* <IconButton color="inherit">
          <FormatSizeIcon />
        </IconButton> */}

        {/* <TextField
          type="number"
          value={fontSize}
          onChange={(e) => applyFormat("fontSize", parseInt(e.target.value, 10))}
          style={{ width: 50, marginLeft: 8 }}
        /> */}

        {/* ✅ Text Color Picker */}
        {/* <IconButton color="inherit">
          <ColorLensIcon />
        </IconButton> */}

        {/* <input
          type="color"
          value={textColor}
          onChange={(e) => applyFormat("color", e.target.value)}
          style={{ width: 40, height: 30, border: "none", marginLeft: 8 }}
        /> */}

        <Button color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>Charts</Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { onCreateChart("bar"); setAnchorEl(null); }}>Bar Chart</MenuItem>
          <MenuItem onClick={() => { onCreateChart("line"); setAnchorEl(null); }}>Line Chart</MenuItem>
          <MenuItem onClick={() => { onCreateChart("pie"); setAnchorEl(null); }}>Pie Chart</MenuItem>
        </Menu>
        <Button color="inherit" onClick={() => applyFunction("TRIM")}>Trim</Button>
        <Button color="inherit" onClick={() => applyFunction("UPPER")}>Uppercase</Button>
        <Button color="inherit" onClick={() => applyFunction("LOWER")}>Lowercase</Button>
        <Button color="secondary" onClick={removeDuplicates}>Remove Duplicates</Button>
        <Button color="inherit" onClick={handleAddRow}>Add Row</Button>
        <Button color="inherit" onClick={handleAddCol}>Add Col</Button>
        <Button color="secondary" onClick={handleDeleteRow}>Del Row</Button>
        <Button color="secondary" onClick={handleDeleteCol}>Del Col</Button>
        <Button color="inherit" onClick={() => setShowFindReplace(!showFindReplace)}>
          {showFindReplace ? "Hide Find & Replace" : "Find & Replace"}
        </Button>

        {showFindReplace && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px" }}>
            <input
              type="text"
              placeholder="Find"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Replace"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              style={{ padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <button
              onClick={handleFindReplace}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "6px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        )}
      </Toolbar>
    </AppBar>
    </ThemeProvider>
  );
};

export default SpreadsheetToolbar;


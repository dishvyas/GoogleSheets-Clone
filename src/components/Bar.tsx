import React, { useEffect, useState } from "react";
import { Button, Menu, MenuItem, Tooltip } from "@mui/material";
import { Save, Undo, Redo, Trash2, XCircle } from "lucide-react"; // Import distinct delete icons

// Define types for props
interface BarProps {
  onSave: () => void;
  onImport: (type: "csv" | "excel") => void;
  onExport: (type: "csv" | "excel") => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteRow?: () => void;
  onDeleteCol?: () => void;
}

const Bar: React.FC<BarProps> = ({ onSave, onImport, onExport, onUndo, onRedo, onDeleteRow, onDeleteCol }) => {
  const [importAnchor, setImportAnchor] = useState<null | HTMLElement>(null);
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);

//   useEffect(() => {
//     console.log("Bar component mounted");
//   }, []);



  return (
    <div className="flex items-center gap-2 border-b p-2 max-w-screen-lg mx-auto">
      {/* Save Button with Tooltip */}
      <Tooltip title="Save">
        <Button color="inherit" onClick={onSave}>
          <Save className="w-5 h-5" />
        </Button>
      </Tooltip>

      {/* Import Dropdown */}
      <Tooltip title="Import Data">
        <Button color="inherit" onClick={(e) => setImportAnchor(e.currentTarget)}>Import</Button>
      </Tooltip>
      <Menu anchorEl={importAnchor} open={Boolean(importAnchor)} onClose={() => setImportAnchor(null)}>
        <MenuItem onClick={() => { onImport("csv"); setImportAnchor(null); }}>CSV</MenuItem>
        <MenuItem onClick={() => { onImport("excel"); setImportAnchor(null); }}>Excel</MenuItem>
      </Menu>

      {/* Export Dropdown */}
      <Tooltip title="Export Data">
        <Button color="inherit" onClick={(e) => setExportAnchor(e.currentTarget)}>Export</Button>
      </Tooltip>
      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MenuItem onClick={() => { onExport("csv"); setExportAnchor(null); }}>CSV</MenuItem>
        <MenuItem onClick={() => { onExport("excel"); setExportAnchor(null); }}>Excel</MenuItem>
      </Menu>

      {/* Undo & Redo with Tooltips */}
      <Tooltip title="Undo">
        <Button color="inherit" onClick={onUndo}>
          <Undo className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip title="Redo">
        <Button color="inherit" onClick={onRedo}>
          <Redo className="w-5 h-5" />
        </Button>
      </Tooltip>

      {/* Delete Row & Column with Unique Icons & Tooltips */}
      {/* <Tooltip title="Delete Row">
        <Button color="inherit" onClick={onDeleteRow} disabled={!onDeleteRow}>
          <Trash2 className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip title="Delete Column">
        <Button color="inherit" onClick={onDeleteCol} disabled={!onDeleteCol}>
          <XCircle className="w-5 h-5" />
        </Button>
      </Tooltip> */}
    </div>
  );
};

export default Bar;

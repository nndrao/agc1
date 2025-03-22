import "ag-grid-enterprise";
import React, { useState, useMemo } from "react";
import {
  ModuleRegistry,
  themeQuartz,
  ClientSideRowModelModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  SetFilterModule,
  NumberFilterModule,
  ValidationModule,
  AllEnterpriseModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useTheme } from '../context/ThemeContext';

// Register AG Grid modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  SetFilterModule,
  NumberFilterModule,
  ValidationModule,
  AllEnterpriseModule
]);

const theme = themeQuartz
  .withParams(
    
    "light",
  )
  .withParams(
    
    "dark",
  );

export function DataTable() {
  const { theme: appTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(appTheme === 'dark');
  
  const containerStyle = useMemo(() => ({ 
    height: "calc(100vh - 7rem)",
    display: "flex",
    flexDirection: "column"
  }), []);

  const gridStyle = useMemo(() => ({ 
    flex: 1,
    width: "100%"
  }), []);

  // Example 1 data
  const rowData = useMemo(() => {
    const data: any[] = [];
    for (let i = 0; i < 10; i++) {
      data.push({ make: "Toyota", model: "Celica", price: 35000 + i * 1000 });
      data.push({ make: "Ford", model: "Mondeo", price: 32000 + i * 1000 });
      data.push({
        make: "Porsche",
        model: "Boxster",
        price: 72000 + i * 1000,
      });
    }
    return data;
  }, []);

  const columnDefs = [
    { field: "make" }, 
    { field: "model" }, 
    { field: "price" }
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    document.body.dataset.agThemeMode = enabled ? "dark" : "light";
  };

  // Keep theme in sync with app theme
  React.useEffect(() => {
    setDarkMode(appTheme === 'dark');
  }, [appTheme]);

  return (
    <div style={containerStyle}>
      
      <div style={gridStyle}>
        <AgGridReact
          theme={theme}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          sideBar={true}
        />
      </div>
    </div>
  );
}
import React, { useMemo, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';

import { DataTableToolbar } from './DataTableToolbar';
import { DataTableSettings } from './DataTableSettings';
import { useDataTableState } from './hooks/useDataTableState';
import { THEME_OPTIONS, ACCENT_COLOR_PRESETS } from './hooks/useDataTableTheme';
import type { DataTableProps } from './types';

export const DataTableMain: React.FC<DataTableProps> = ({
  data,
  columns,
  onRowClick,
  title = 'Data Table',
  height = 500,
  gridOptions = {},
  className = '',
  initialTheme,
  initialAccentColor,
  enableThemeSettings = true,
  enableExport = true,
}) => {
  const {
    // State
    gridApi,
    columnApi,
    currentTheme,
    accentColor,
    density,
    settingsOpen,
    searchText,
    defaultGridOptions,
    
    // Handlers
    handleGridReady,
    handleExportCSV,
    handleSearch,
    toggleSettings,
    closeSettings,
    setCurrentTheme,
    setAccentColor,
    setDensity,
  } = useDataTableState(data, columns, initialTheme, initialAccentColor);

  const mergedGridOptions = useMemo(() => ({ 
    ...defaultGridOptions, 
    ...gridOptions 
  }), [defaultGridOptions, gridOptions]);

  useEffect(() => {
    // Register 'ag-grid-enterprise' module for advanced features
    // The import is already at the top of the file
  }, []);

  return (
    <div className={`data-table-container ${className}`}>
      {/* Toolbar with search, export and settings */}
      <DataTableToolbar 
        title={title}
        searchText={searchText}
        onSearchChange={handleSearch}
        onExport={handleExportCSV}
        onSettingsToggle={toggleSettings}
        gridApi={gridApi}
        enableExport={enableExport}
        enableThemeSettings={enableThemeSettings}
      />
      
      {/* Settings panel */}
      {enableThemeSettings && (
        <DataTableSettings 
          currentTheme={currentTheme}
          accentColor={accentColor}
          density={density}
          themeOptions={THEME_OPTIONS}
          accentColorPresets={ACCENT_COLOR_PRESETS}
          onThemeChange={setCurrentTheme}
          onAccentColorChange={setAccentColor}
          onDensityChange={setDensity}
          onClose={closeSettings}
          isOpen={settingsOpen}
        />
      )}
      
      {/* Main grid component */}
      <div 
        className="ag-theme-alpine rounded border dark:border-gray-700 overflow-hidden" 
        style={{ height: height, width: '100%' }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columns}
          onGridReady={handleGridReady}
          onRowClicked={onRowClick}
          {...mergedGridOptions}
        />
      </div>
    </div>
  );
};
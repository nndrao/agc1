import "ag-grid-enterprise";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  ModuleRegistry,
  themeQuartz,
  themeBalham,
  themeMaterial,
  themeAlpine,
  AllCommunityModule,
  GridReadyEvent,
  SideBarDef,
  IToolPanelParams,
  GridApi
} from "ag-grid-community";
import {
  AllEnterpriseModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { useTheme } from '../context/ThemeContext';

// Define GridTheme type since it's not exported
type GridTheme = Record<string, unknown>;

// Register AG Grid modules
ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule
]);

// Olympic data interface
interface IOlympicData {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  medalist: boolean;
}

// Theme configuration
interface ThemeOption {
  id: string;
  name: string;
  theme: GridTheme;
}

// Preset accent colors
const accentColorPresets = [
  { color: "#4F46E5", name: "Indigo" },
  { color: "#2563EB", name: "Blue" },
  { color: "#0891B2", name: "Cyan" },
  { color: "#059669", name: "Emerald" },
  { color: "#65A30D", name: "Lime" },
  { color: "#CA8A04", name: "Yellow" },
  { color: "#EA580C", name: "Orange" },
  { color: "#DC2626", name: "Red" },
  { color: "#DB2777", name: "Pink" },
  { color: "#9333EA", name: "Purple" },
];

const themeOptions: ThemeOption[] = [
  { 
    id: "themeQuartz", 
    name: "Quartz",
    theme: themeQuartz
      .withParams(
        {
          backgroundColor: "#FFFFFF",
          foregroundColor: "#000000CC",
          browserColorScheme: "light",
        },
    "light",
  )
  .withParams(
        {
          backgroundColor: "#1E2024",
          foregroundColor: "#FFFFFFCC",
          browserColorScheme: "dark",
        },
    "dark",
      )
  },
  { 
    id: "themeBalham", 
    name: "Balham",
    theme: themeBalham 
  },
  { 
    id: "themeMaterial", 
    name: "Material",
    theme: themeMaterial 
  },
  { 
    id: "themeAlpine", 
    name: "Alpine",
    theme: themeAlpine 
  },
];

// Function to generate dynamic slider styles with the current accent color
const generateSliderStyles = (accentColor: string) => `
  .modern-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    background: #d7dcdf;
    border-radius: 5px;
    outline: none;
    transition: all 0.2s;
  }
  
  .modern-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${accentColor};
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }
  
  .modern-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${accentColor};
    cursor: pointer;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: all 0.2s;
  }
  
  .modern-slider::-webkit-slider-thumb:hover,
  .modern-slider::-moz-range-thumb:hover {
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    transform: scale(1.1);
  }
  
  .modern-slider:active::-webkit-slider-thumb {
    background: ${adjustColor(accentColor, -20)};
  }
  
  .modern-slider:active::-moz-range-thumb {
    background: ${adjustColor(accentColor, -20)};
  }
  
  .modern-slider:focus {
    box-shadow: 0 0 0 2px ${accentColor}33;
  }
  
  .dark .modern-slider {
    background: #3F3F46;
  }
  
  .dark .modern-slider::-webkit-slider-thumb {
    background: ${adjustColor(accentColor, 20)};
  }
  
  .dark .modern-slider::-moz-range-thumb {
    background: ${adjustColor(accentColor, 20)};
  }
  
  .dark .modern-slider:active::-webkit-slider-thumb {
    background: ${accentColor};
  }
  
  .dark .modern-slider:active::-moz-range-thumb {
    background: ${accentColor};
  }
  
  .color-preset {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .color-preset:hover {
    transform: scale(1.1);
  }
  
  .color-preset.active {
    border-color: #FFFFFF;
    box-shadow: 0 0 0 1px #000000;
  }
  
  .color-picker-container {
    position: relative;
  }
  
  .color-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    width: 170px;
  }
`;

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substr(0, 2), 16),
    g: parseInt(cleanHex.substr(2, 2), 16),
    b: parseInt(cleanHex.substr(4, 2), 16)
  };
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Helper function to get complementary color
function getComplementaryColor(hexColor: string): string {
  try {
    const rgb = hexToRgb(hexColor);
    // Complementary color is (255 - r, 255 - g, 255 - b)
    return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  } catch (e) {
    console.warn("Error calculating complementary color:", e);
    return '#FFFFFF';
  }
}

// Helper function to adjust a color's brightness
function adjustColor(color: string, amount: number): string {
  try {
    const rgb = hexToRgb(color);
    return rgbToHex(
      rgb.r + amount,
      rgb.g + amount,
      rgb.b + amount
    );
  } catch (e) {
    return color;
  }
}

// Helper function to generate color with opacity
function colorWithOpacity(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

// Helper function to determine if a color is dark (for contrast)
function isColorDark(hexColor: string): boolean {
  try {
    const rgb = hexToRgb(hexColor);
    
    // Calculate luminance using the relative luminance formula
    // (0.2126*R + 0.7152*G + 0.0722*B)
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    
    // Return true if the color is dark (luminance < 0.5)
    return luminance < 0.5;
  } catch (e) {
    // If parsing fails, default to considering it dark
    console.warn("Invalid color format:", hexColor);
    return true;
  }
}

// Function to ensure contrast by using complementary colors
function getContrastColor(backgroundColor: string): string {
  try {
    // Instead of using complementary colors which change based on the background,
    // we'll use a fixed high-contrast color for all checkmarks to ensure consistency
    return '#FFFFFF'; // Use white for all checkmarks regardless of background
  } catch (e) {
    console.warn("Error in getContrastColor:", e);
    return '#FFFFFF';
  }
}

// Function to generate checkbox styles with custom colors
const generateCheckboxStyles = (accentColor: string) => {
  // Get appropriate checkmark color for optimal contrast
  const checkmarkColor = getContrastColor(accentColor);
  
  return `
  /* Base checkbox background and border radius settings */
  .ag-checkbox-input-wrapper.ag-checked,
  .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-checkbox-input-wrapper.ag-indeterminate::after,
  .ag-checkbox.ag-checked,
  .ag-checkbox-input-wrapper {
    border-radius: 2px !important;
  }
  
  /* Global checkbox checked state */
  .ag-checkbox-input-wrapper.ag-checked,
  .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Cell checkbox styling - applies to all renderer-created checkboxes */
  .ag-checkbox-cell-renderer .ag-checkbox-input-wrapper.ag-checked,
  .ag-checkbox-cell-renderer .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Checkmark color - ensure visible against custom background */
  .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
    font-weight: bold !important;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3) !important;
  }
  
  /* Specific theme overrides - consistent checkmark color across all themes and modes */
  /* Quartz Theme */
  .ag-theme-quartz .ag-checkbox-input-wrapper.ag-checked,
  .ag-theme-quartz .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* For Quartz theme - internal structure is different */
  .ag-theme-quartz .ag-checkbox-input-wrapper::after {
    border-radius: 2px !important;
  }
  
  .ag-theme-quartz .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-theme-quartz .ag-checkbox-input-wrapper.ag-indeterminate::after {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
    color: ${checkmarkColor} !important;
  }
  
  /* Override all ag-theme-dark styles to use the same checkmark color */
  [data-ag-theme-mode="dark"] .ag-checkbox-input-wrapper.ag-checked::after,
  [data-ag-theme-mode="dark"] .ag-checkbox-input-wrapper.ag-indeterminate::after,
  body.dark .ag-checkbox-input-wrapper.ag-checked::after,
  body.dark .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
  }
  
  /* Alpine/Balham/Material Themes - consistent styling across all modes */
  .ag-theme-alpine .ag-checkbox-input-wrapper.ag-checked,
  .ag-theme-alpine .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-theme-balham .ag-checkbox-input-wrapper.ag-checked,
  .ag-theme-balham .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-theme-material .ag-checkbox-input-wrapper.ag-checked,
  .ag-theme-material .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .ag-theme-alpine .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-theme-alpine .ag-checkbox-input-wrapper.ag-indeterminate::after,
  .ag-theme-balham .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-theme-balham .ag-checkbox-input-wrapper.ag-indeterminate::after,
  .ag-theme-material .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-theme-material .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
    font-weight: bold !important;
  }
  
  /* Rest of the styling remains the same, but ensure consistent checkmark color */

  /* Specific selectors for sidebar column panel checkboxes */
  .ag-column-select-panel .ag-checkbox-input-wrapper.ag-checked,
  .ag-column-select-panel .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-column-select-column .ag-checkbox-input-wrapper.ag-checked,
  .ag-column-select-column .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-column-select-column-group .ag-checkbox-input-wrapper.ag-checked,
  .ag-column-select-column-group .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .ag-column-select-panel .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-column-select-panel .ag-checkbox-input-wrapper.ag-indeterminate::after,
  .ag-column-select-column .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-column-select-column .ag-checkbox-input-wrapper.ag-indeterminate::after,
  .ag-column-select-column-group .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-column-select-column-group .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
  }
  
  /* Filter panel checkboxes */
  .ag-filter-toolpanel-instance .ag-checkbox-input-wrapper.ag-checked,
  .ag-filter-toolpanel-instance .ag-checkbox-input-wrapper.ag-indeterminate,
  .ag-set-filter-item .ag-checkbox-input-wrapper.ag-checked,
  .ag-set-filter-item .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Hover states for checkboxes */
  .ag-checkbox-input-wrapper:hover {
    border-color: ${accentColor} !important;
  }
  
  /* Cell checkboxes from our custom renderer */
  .custom-checkbox-cell .ag-checkbox-input-wrapper.ag-checked,
  .custom-checkbox-cell .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .custom-checkbox-cell .ag-checkbox-input-wrapper.ag-checked::after,
  .custom-checkbox-cell .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
  }
  
  /* Header checkboxes (select all) */
  .ag-header-select-all .ag-checkbox-input-wrapper.ag-checked,
  .ag-header-select-all .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .ag-header-select-all .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-header-select-all .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
  }
  
  /* Row selection checkboxes */
  .ag-selection-checkbox .ag-checkbox-input-wrapper.ag-checked,
  .ag-selection-checkbox .ag-checkbox-input-wrapper.ag-indeterminate {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .ag-selection-checkbox .ag-checkbox-input-wrapper.ag-checked::after,
  .ag-selection-checkbox .ag-checkbox-input-wrapper.ag-indeterminate::after {
    color: ${checkmarkColor} !important;
  }
  
  /* For quartz theme internal checkbox structure */
  .ag-theme-quartz .ag-checkbox::after {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Native checkbox fallback */
  input[type="checkbox"]:checked {
    accent-color: ${accentColor} !important;
  }
  
  /* Focus state */
  .ag-checkbox-input-wrapper:focus-within {
    box-shadow: 0 0 0 2px ${colorWithOpacity(accentColor, 0.3)} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Inline checkbox selector styles for cells and header */
  .ag-cell .ag-selection-checkbox .ag-checkbox-input-wrapper.ag-checked,
  .ag-header-cell .ag-header-select-all .ag-checkbox-input-wrapper.ag-checked {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  /* Custom class for medalist column */
  .ag-center-cols-container .ag-cell .ag-checkbox-input-wrapper.ag-checked {
    background-color: ${accentColor} !important;
    border-color: ${accentColor} !important;
  }
  
  .ag-center-cols-container .ag-cell .ag-checkbox-input-wrapper.ag-checked::after {
    color: ${checkmarkColor} !important;
  }
  `;
};

// Define an interface for the grid settings
interface GridSettings {
  id: string; // Add a unique ID for each setting
  theme: string;
  accentColor: string;
  spacing: number;
  fontSize: number;
  isDarkMode: boolean;
  gridOptions: any;
  name: string;
  isDefault?: boolean; // Flag to mark the default profile
  columnState?: any; // Add column state for grouping
  columnGroupState?: any; // Add column group state
}

// Create the General Settings Dialog component
function GeneralSettingsDialog({ 
  isOpen, 
  onClose, 
  gridApi,
  currentProfileId,
  showToastMessage
}: { 
  isOpen: boolean; 
  onClose: () => void;
  gridApi: GridApi | null;
  currentProfileId: string;
  showToastMessage?: (message: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const isDarkMode = document.body.classList.contains('dark');
  
  // Grid options state
  const [gridOptions, setGridOptions] = useState({
    // Core Grid Options
    rowData: true,
    enableCellTextSelection: true,
    
    // Row Selection - Fix type issues
    rowSelection: 'multiple', // Use string value instead of object
    suppressMenuHide: false,
    
    // Styling
    headerHeight: 32,
    rowHeight: 25,
    
    // Row Grouping & Pivoting - Fix type issues
    groupDefaultExpanded: 0,
    rowGroupPanelShow: 'onlyWhenGrouping' as 'onlyWhenGrouping' | 'always' | 'never',
    groupDisplayType: 'singleColumn' as 'singleColumn' | 'multipleColumns' | 'groupRows' | 'custom',
    groupIncludeFooter: false, // Use the old property names that are safer
    groupIncludeTotalFooter: false, // Use the old property names that are safer
    pivotMode: false,
    pivotColumnGroupTotals: 'before' as 'before' | 'after',
    pivotRowTotals: 'before' as 'before' | 'after',
    
    // Sorting
    suppressMultiSort: false,
    
    // Filtering
    enableAdvancedFilter: false,
    cacheQuickFilter: true,
    
    // Pagination
    pagination: false,
    paginationPageSize: 100,
    suppressPaginationPanel: false,
    
    // Editing
    editType: 'fullRow' as 'fullRow',
    singleClickEdit: false,
    stopEditingWhenCellsLoseFocus: true,
    enterMovesDown: true, // Use the old property names that are safer
    enterMovesDownAfterEdit: true, // Use the old property names that are safer
    readOnlyEdit: false,
    
    // Column Options
    suppressMovableColumns: false,
    suppressFieldDotNotation: false,
    suppressAutoSize: false,
    suppressColumnVirtualisation: false,
    suppressColumnMoveAnimation: false,
    
    // Export
    suppressCsvExport: false,
    suppressExcelExport: false,
    
    // Cell Selection & Range Selection - use the safer properties
    enableRangeSelection: true, // Use the old property names that are safer
    enableRangeHandle: true, // Use the old property names that are safer
    enableFillHandle: true, // Use the old property names that are safer
    
    // Other Functionality
    suppressDragLeaveHidesColumns: false,
    animateRows: true,
    undoRedoCellEditing: false,
    undoRedoCellEditingLimit: 10
  });
  
  // Reference to savedSettings and a function to find the current profile
  const savedSettingsRef = useRef<GridSettings[]>([]);
  
  // Initialize gridOptions from current profile when dialog opens
  useEffect(() => {
    if (isOpen && gridApi) {
      try {
        // Get the latest savedSettings from localStorage
        const storedSettings = localStorage.getItem('agGridSettings');
        if (storedSettings) {
          savedSettingsRef.current = JSON.parse(storedSettings);
          
          // Find the current profile
          const currentProfile = savedSettingsRef.current.find(s => s.id === currentProfileId);
          if (currentProfile && currentProfile.gridOptions) {
            // Initialize state with values from profile
            setGridOptions(prev => ({
              ...prev,
              ...currentProfile.gridOptions
            }));
          }
        }
      } catch (error) {
        console.warn('Error initializing dialog from profile:', error);
      }
    }
  }, [isOpen, gridApi, currentProfileId]);
  
  // Apply grid options to the grid - safer implementation
  const applyGridOptions = () => {
    if (!gridApi) return;
    
    try {
      console.log('Applying grid options to AG-Grid:', gridOptions);
      
      // Loop through all options and apply them more systematically
      const optionsToApply = [
        // Core Grid Options
        { key: 'enableCellTextSelection', value: gridOptions.enableCellTextSelection },
        { key: 'rowSelection', value: gridOptions.rowSelection },
        { key: 'suppressMenuHide', value: gridOptions.suppressMenuHide },
        
        // Styling
        { key: 'headerHeight', value: gridOptions.headerHeight },
        { key: 'rowHeight', value: gridOptions.rowHeight },
        
        // Row Grouping & Pivoting - use the safer properties
        { key: 'groupDefaultExpanded', value: gridOptions.groupDefaultExpanded },
        { key: 'rowGroupPanelShow', value: gridOptions.rowGroupPanelShow },
        { key: 'groupDisplayType', value: gridOptions.groupDisplayType },
        
        // Use the property names that work reliably
        { key: 'groupIncludeFooter', value: gridOptions.groupIncludeFooter },
        { key: 'groupIncludeTotalFooter', value: gridOptions.groupIncludeTotalFooter },
        { key: 'pivotMode', value: gridOptions.pivotMode },
        { key: 'pivotColumnGroupTotals', value: gridOptions.pivotColumnGroupTotals },
        { key: 'pivotRowTotals', value: gridOptions.pivotRowTotals },
        
        // Sorting & Filtering
        { key: 'suppressMultiSort', value: gridOptions.suppressMultiSort },
        { key: 'enableAdvancedFilter', value: gridOptions.enableAdvancedFilter },
        
        // Pagination
        { key: 'pagination', value: gridOptions.pagination },
        { key: 'paginationPageSize', value: gridOptions.paginationPageSize },
        { key: 'suppressPaginationPanel', value: gridOptions.suppressPaginationPanel },
        
        // Editing
        { key: 'editType', value: gridOptions.editType },
        { key: 'singleClickEdit', value: gridOptions.singleClickEdit },
        { key: 'enterMovesDown', value: gridOptions.enterMovesDown },
        { key: 'enterMovesDownAfterEdit', value: gridOptions.enterMovesDownAfterEdit },
        { key: 'readOnlyEdit', value: gridOptions.readOnlyEdit },
        
        // Column Options
        { key: 'suppressMovableColumns', value: gridOptions.suppressMovableColumns },
        { key: 'suppressFieldDotNotation', value: gridOptions.suppressFieldDotNotation },
        { key: 'suppressColumnMoveAnimation', value: gridOptions.suppressColumnMoveAnimation },
        
        // Export
        { key: 'suppressCsvExport', value: gridOptions.suppressCsvExport },
        { key: 'suppressExcelExport', value: gridOptions.suppressExcelExport },
        
        // Cell Selection & Range Selection
        { key: 'enableRangeSelection', value: gridOptions.enableRangeSelection },
        { key: 'enableRangeHandle', value: gridOptions.enableRangeHandle },
        { key: 'enableFillHandle', value: gridOptions.enableFillHandle },
        
        // Other Functionality
        { key: 'suppressDragLeaveHidesColumns', value: gridOptions.suppressDragLeaveHidesColumns },
        { key: 'animateRows', value: gridOptions.animateRows }
      ];
      
      // Apply options safely, with error handling for each one
      for (const option of optionsToApply) {
        try {
          if (option.value !== undefined) {
            gridApi.setGridOption(option.key as any, option.value);
            console.log(`Successfully applied ${option.key}:`, option.value);
          }
        } catch (e) {
          console.warn(`Could not set grid option ${option.key}:`, e);
        }
      }
      
      // Get current column state before applying changes
      let columnState = null;
      let columnGroupState = null;
      
      try {
        columnState = gridApi.getColumnState();
        columnGroupState = gridApi.getColumnGroupState();
      } catch (e) {
        console.warn('Error getting column state before refresh:', e);
      }
      
      // Apply changes with caution
      setTimeout(() => {
        if (gridApi) {
          try {
            // Refresh grid components
            gridApi.refreshHeader();
            gridApi.refreshCells({ force: false });
            
            try {
              gridApi.sizeColumnsToFit();
            } catch (err) {
              console.warn('Error sizing columns to fit:', err);
            }
            
            // Save the grid options to the current profile in localStorage
            try {
              // Get current settings from localStorage
              const storedSettings = localStorage.getItem('agGridSettings');
              if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings) as GridSettings[];
                
                // Find the current profile
                const profileIndex = parsedSettings.findIndex(s => s.id === currentProfileId);
                
                if (profileIndex !== -1) {
                  // Get updated column state after changes
                  let updatedColumnState = columnState;
                  let updatedColumnGroupState = columnGroupState;
                  
                  try {
                    if (gridApi) {
                      updatedColumnState = gridApi.getColumnState();
                      updatedColumnGroupState = gridApi.getColumnGroupState();
                    }
                  } catch (e) {
                    console.warn('Error getting updated column state:', e);
                    // Fall back to the state we captured earlier
                  }
                  
                  // Create a complete settings object with all properties
                  const updatedSettings = {
                    ...parsedSettings[profileIndex],
                    gridOptions: {
                      ...gridOptions,
                      // Make sure we explicitly include key settings
                      rowGroupPanelShow: gridOptions.rowGroupPanelShow
                    },
                    columnState: updatedColumnState,
                    columnGroupState: updatedColumnGroupState
                  };
                  
                  // Update the profile in the array
                  parsedSettings[profileIndex] = updatedSettings;
                  
                  // Save back to localStorage
                  localStorage.setItem('agGridSettings', JSON.stringify(parsedSettings));
                  console.log('Successfully saved grid options and column state to profile:', currentProfileId);
                  
                  // Display success toast if function is provided
                  if (showToastMessage) {
                    showToastMessage(`Grid settings saved to "${parsedSettings[profileIndex].name}" profile`);
                  }
                } else {
                  console.warn('Could not find profile to update:', currentProfileId);
                }
              }
            } catch (error) {
              console.error('Error saving grid options to localStorage:', error);
              if (showToastMessage) {
                showToastMessage('Failed to save grid settings', 'error');
              }
            }
          } catch (err) {
            console.warn('Error refreshing grid:', err);
            if (showToastMessage) {
              showToastMessage('Error refreshing grid', 'error');
            }
          }
        }
      }, 50);
      
      console.log('AG-Grid settings application initiated - refresh will complete shortly');
    } catch (error) {
      console.error('Error applying AG-Grid settings:', error);
      if (showToastMessage) {
        showToastMessage('Error applying grid settings', 'error');
      }
    }
  };
  
  // Initialize dialog position
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      const x = Math.max(0, (window.innerWidth - rect.width) / 2);
      const y = Math.max(0, (window.innerHeight - rect.height) / 2);
      setPosition({ x, y });
    }
  }, [isOpen]);
  
  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest('.dialog-header')) {
      setIsDragging(true);
      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && dialogRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep dialog within viewport bounds
      const maxX = window.innerWidth - dialogRef.current.offsetWidth;
      const maxY = window.innerHeight - dialogRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Group styles
  const groupStyle = {
    marginBottom: '16px',
    border: `1px solid ${isDarkMode ? '#2D3748' : '#E2E8F0'}`,
    borderRadius: '6px',
    overflow: 'hidden'
  };
  
  const groupHeaderStyle = {
    padding: '8px 12px',
    backgroundColor: isDarkMode ? '#2D3748' : '#EDF2F7',
    color: isDarkMode ? '#E2E8F0' : '#4A5568',
    fontWeight: 600,
    fontSize: '13px'
  };
  
  const groupContentStyle = {
    padding: '8px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '8px'
  };
  
  const optionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#1A202C' : '#F7FAFC',
    fontSize: '12px'
  };
  
  const labelStyle = {
    flex: 1,
    fontSize: '12px',
    color: isDarkMode ? '#E2E8F0' : '#4A5568'
  };
  
  const controlStyle = {
    marginLeft: '8px'
  };
  
  const selectStyle = {
    padding: '2px 6px',
    borderRadius: '4px',
    border: `1px solid ${isDarkMode ? '#4A5568' : '#CBD5E0'}`,
    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
    color: isDarkMode ? '#E2E8F0' : '#4A5568',
    fontSize: '12px',
    height: '22px'
  };
  
  const checkboxStyle = {
    accentColor: document.documentElement.style.getPropertyValue("--ag-checkbox-checked-color") || '#4F46E5',
    transform: 'scale(1.1)'
  };
  
  const numberInputStyle = {
    width: '60px',
    padding: '2px 6px',
    borderRadius: '4px',
    border: `1px solid ${isDarkMode ? '#4A5568' : '#CBD5E0'}`,
    backgroundColor: isDarkMode ? '#2D3748' : '#FFFFFF',
    color: isDarkMode ? '#E2E8F0' : '#4A5568',
    fontSize: '12px',
    height: '22px'
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }} 
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '800px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          backgroundColor: isDarkMode ? '#1A1C23' : '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
      >
        <div
          className="dialog-header"
          style={{
            padding: '16px',
            backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC',
            borderBottom: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'grab'
          }}
        >
          <h3 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: 600, 
            color: isDarkMode ? '#E2E8F0' : '#2D3748' 
          }}>
            AG-Grid General Settings
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: isDarkMode ? '#A0AEC0' : '#718096',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 120px)'
          }}
        >
          {/* Core Grid Options */}
          <div style={groupStyle}>
            <div style={groupHeaderStyle}>Core Grid Options</div>
            <div style={groupContentStyle}>
              <div style={optionItemStyle}>
                <span style={labelStyle}>Data to be displayed</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.rowData}
                    onChange={(e) => setGridOptions({...gridOptions, rowData: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Allow text selection in cells</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.enableCellTextSelection}
                    onChange={(e) => setGridOptions({...gridOptions, enableCellTextSelection: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Type of row selection</span>
                <div style={controlStyle}>
                  <select 
                    value={gridOptions.rowSelection}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: e.target.value as 'multiple' | 'singleRow' | 'multiRow'
                    })}
                    style={selectStyle}
                  >
                    <option value="multiple">Multiple</option>
                    <option value="singleRow">Single</option>
                    <option value="multiRow">Multiple</option>
                  </select>
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Allow multi-select with single click</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.rowSelection === 'multiple'}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: e.target.checked ? 'multiple' : 'singleRow'
                    })}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Allow row selection on click</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.rowSelection === 'multiple'}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: e.target.checked ? 'multiple' : 'singleRow'
                    })}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Always show column menu</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.suppressMenuHide}
                    onChange={(e) => setGridOptions({...gridOptions, suppressMenuHide: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Styling */}
          <div style={groupStyle}>
            <div style={groupHeaderStyle}>Styling</div>
            <div style={groupContentStyle}>
              <div style={optionItemStyle}>
                <span style={labelStyle}>Height of header row</span>
                <div style={controlStyle}>
                  <input 
                    type="number" 
                    value={gridOptions.headerHeight}
                    onChange={(e) => setGridOptions({...gridOptions, headerHeight: parseInt(e.target.value)})}
                    style={numberInputStyle}
                    min="20"
                    max="100"
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Height of rows</span>
                <div style={controlStyle}>
                  <input 
                    type="number" 
                    value={gridOptions.rowHeight}
                    onChange={(e) => setGridOptions({...gridOptions, rowHeight: parseInt(e.target.value)})}
                    style={numberInputStyle}
                    min="20"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Row Grouping & Pivoting */}
          <div style={groupStyle}>
            <div style={groupHeaderStyle}>Row Grouping & Pivoting</div>
            <div style={groupContentStyle}>
              <div style={optionItemStyle}>
                <span style={labelStyle}>Default expansion for groups</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.groupDefaultExpanded === -1}
                    onChange={(e) => setGridOptions({...gridOptions, groupDefaultExpanded: e.target.checked ? -1 : 0})}
                    style={checkboxStyle}
                  />
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    color: isDarkMode ? '#A0AEC0' : '#718096'
                  }}>
                    {gridOptions.groupDefaultExpanded === -1 ? 'All expanded' : 'All collapsed'}
                  </span>
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Show/hide row grouping UI</span>
                <div style={controlStyle}>
                  <select 
                    value={gridOptions.rowGroupPanelShow}
                    onChange={(e) => setGridOptions({...gridOptions, rowGroupPanelShow: e.target.value as any})}
                    style={selectStyle}
                  >
                    <option value="always">Always</option>
                    <option value="onlyWhenGrouping">Only When Grouping</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Include footers in groups</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.groupIncludeFooter}
                    onChange={(e) => setGridOptions({...gridOptions, groupIncludeFooter: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Include grand total footer</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.groupIncludeTotalFooter}
                    onChange={(e) => setGridOptions({...gridOptions, groupIncludeTotalFooter: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Enable pivot mode</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.pivotMode}
                    onChange={(e) => setGridOptions({...gridOptions, pivotMode: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Totals for pivot column groups</span>
                <div style={controlStyle}>
                  <select 
                    value={gridOptions.pivotColumnGroupTotals}
                    onChange={(e) => setGridOptions({...gridOptions, pivotColumnGroupTotals: e.target.value as any})}
                    style={selectStyle}
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Totals for pivot rows</span>
                <div style={controlStyle}>
                  <select 
                    value={gridOptions.pivotRowTotals}
                    onChange={(e) => setGridOptions({...gridOptions, pivotRowTotals: e.target.value as any})}
                    style={selectStyle}
                  >
                    <option value="before">Before</option>
                    <option value="after">After</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Editing */}
          <div style={groupStyle}>
            <div style={groupHeaderStyle}>Editing</div>
            <div style={groupContentStyle}>
              <div style={optionItemStyle}>
                <span style={labelStyle}>Type of editing</span>
                <div style={controlStyle}>
                  <select 
                    value={gridOptions.editType}
                    onChange={(e) => setGridOptions({...gridOptions, editType: e.target.value as any})}
                    style={selectStyle}
                  >
                    <option value="fullRow">Full Row</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Start editing on single click</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.singleClickEdit}
                    onChange={(e) => setGridOptions({...gridOptions, singleClickEdit: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Stop editing on focus loss</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.stopEditingWhenCellsLoseFocus}
                    onChange={(e) => setGridOptions({...gridOptions, stopEditingWhenCellsLoseFocus: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Allow editing but keep original value</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.readOnlyEdit}
                    onChange={(e) => setGridOptions({...gridOptions, readOnlyEdit: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Move down on Enter key</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.enterMovesDown}
                    onChange={(e) => setGridOptions({...gridOptions, enterMovesDown: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Move down after edit on Enter</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.enterMovesDownAfterEdit}
                    onChange={(e) => setGridOptions({...gridOptions, enterMovesDownAfterEdit: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Warning message for options that require restart */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: isDarkMode ? 'rgba(237, 137, 54, 0.2)' : 'rgba(237, 137, 54, 0.1)',
            border: '1px solid rgba(237, 137, 54, 0.3)',
            borderRadius: '4px',
            fontSize: '12px',
            color: isDarkMode ? '#FBD38D' : '#C05621'
          }}>
            <strong>Note:</strong> Some settings may require reloading the grid to take effect.
          </div>
        </div>
        
        <div
          style={{
            padding: '12px 16px',
            borderTop: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`,
            backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: `1px solid ${isDarkMode ? '#4A5568' : '#CBD5E0'}`,
              backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF',
              color: isDarkMode ? '#E2E8F0' : '#4A5568',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              applyGridOptions();
              onClose();
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#4F46E5',
              color: '#FFFFFF',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Update the SettingsToolPanel to include the General Settings button
function SettingsToolPanel(props: IToolPanelParams & { 
  currentProfileId?: string;
  showToastMessage?: (message: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const { api, currentProfileId, showToastMessage } = props;
  const [showToolbar, setShowToolbar] = useState(true);
  const [showGeneralSettings, setShowGeneralSettings] = useState(false);
  
  // Get the isDarkMode state from the parent component context
  const isDarkMode = document.body.classList.contains('dark');
  
  const containerStyle = {
    padding: '16px',
    fontSize: '13px',
    color: isDarkMode ? '#E2E8F0' : '#4A5568'
  };
  
  const sectionStyle = {
    marginBottom: '16px'
  };
  
  const headingStyle = {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '12px',
    color: isDarkMode ? '#E2E8F0' : '#2D3748'
  };
  
  const optionContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC',
    cursor: 'pointer'
  };
  
  const labelStyle = {
    flex: 1,
    userSelect: 'none' as const,
    color: isDarkMode ? '#E2E8F0' : '#4A5568',
    fontSize: '13px',
    fontWeight: 500
  };
  
  const checkboxStyle = {
    marginLeft: '16px',
    transform: 'scale(1.2)',
    cursor: 'pointer',
    accentColor: document.documentElement.style.getPropertyValue("--ag-checkbox-checked-color") || '#4F46E5'
  };
  
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    marginTop: '8px'
  };
  
  // Toggle toolbar visibility
  const toggleToolbar = useCallback(() => {
    // Use the DOM to find the toolbar and toggle it
    const toolbar = document.querySelector('.ag-grid-toolbar');
    if (toolbar) {
      const newValue = !showToolbar;
      // Fix: Add type assertion for the style property
      (toolbar as HTMLElement).style.display = newValue ? 'flex' : 'none';
      setShowToolbar(newValue);
    }
  }, [showToolbar]);
  
  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <div style={headingStyle}>Display Settings</div>
        <div 
          style={optionContainerStyle}
          onClick={toggleToolbar}
        >
          <span style={labelStyle}>Show Toolbar</span>
          <input 
            type="checkbox"
            checked={showToolbar}
            onChange={toggleToolbar}
            style={checkboxStyle}
          />
        </div>
        <button 
          style={buttonStyle}
          onClick={() => setShowGeneralSettings(true)}
        >
          General Settings
        </button>
      </div>
      
      {showGeneralSettings && (
        <GeneralSettingsDialog 
          isOpen={showGeneralSettings}
          onClose={() => setShowGeneralSettings(false)}
          gridApi={api}
          currentProfileId={currentProfileId || "default"}
          showToastMessage={showToastMessage}
        />
      )}
    </div>
  );
}

// Class-based error boundary to prevent crashes
class GridErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("Grid Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
  }

  // Reset error state when component receives new children props
  componentDidUpdate(prevProps: { children: React.ReactNode }) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #F87171',
          borderRadius: '6px',
          color: '#B91C1C',
          margin: '10px 0'
        }}>
          <h4 style={{ margin: '0 0 10px' }}>Something went wrong with the grid</h4>
          <p>There was an error initializing the grid component. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '6px 12px',
              backgroundColor: '#B91C1C',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper function to safely apply CSS variable to document
const applyCssVariable = (name: string, value: string) => {
  try {
    document.documentElement.style.setProperty(name, value);
  } catch (e) {
    console.warn(`Failed to set CSS variable ${name}:`, e);
  }
};

// Separate functions to generate styles - move outside component
function generateAndApplySliderStyles(color: string) {
  const styleId = 'modern-slider-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  styleElement.innerHTML = generateSliderStyles(color);
}

function generateAndApplyCheckboxStyles(color: string) {
  const styleId = 'ag-grid-checkbox-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }
  
  styleElement.innerHTML = generateCheckboxStyles(color);
}

// Apply grid accent color without dependency on component state
function applyGridAccentColor(color: string) {
  // Common variables for all themes
  applyCssVariable("--ag-alpine-active-color", color);
  applyCssVariable("--ag-selected-row-background-color", colorWithOpacity(color, 0.1));
  applyCssVariable("--ag-row-hover-color", colorWithOpacity(color, 0.05));
  applyCssVariable("--ag-column-hover-color", colorWithOpacity(color, 0.05));
  applyCssVariable("--ag-range-selection-background-color", colorWithOpacity(color, 0.2));
  applyCssVariable("--ag-range-selection-border-color", color);
  applyCssVariable("--ag-range-selection-highlight-color", colorWithOpacity(color, 0.3));
  
  // Theme-specific variables
  applyCssVariable("--ag-quartz-primary-color", color);
  applyCssVariable("--ag-material-primary-color", color);
  applyCssVariable("--ag-material-accent-color", color);
  applyCssVariable("--ag-alpine-active-color", color);
  applyCssVariable("--ag-balham-active-color", color);
  
  // Checkbox colors
  applyCssVariable("--ag-checkbox-background-color", color);
  applyCssVariable("--ag-checkbox-checked-color", color);
  applyCssVariable("--ag-checkbox-indeterminate-color", color);
  applyCssVariable("--ag-toggle-button-on-background-color", color);
  applyCssVariable("--ag-input-focus-border-color", color);
  
  // Apply the generated styles
  generateAndApplySliderStyles(color);
  generateAndApplyCheckboxStyles(color);
}

// Apply grid spacing safely
function applyGridSpacing(value: number, gridApi: GridApi | null) {
  try {
    // Update only essential spacing CSS variables
    applyCssVariable("--ag-grid-size", `${value}px`);
    
    // If we have the grid API, update relevant size properties
    if (gridApi) {
      try {
        // Apply row height and header height via API which is safer
        gridApi.setGridOption('rowHeight', Math.max(25, 25 + value));
        gridApi.setGridOption('headerHeight', Math.max(25, 25 + value));
        
        // Refresh the grid safely without complete redraw
        setTimeout(() => {
          if (gridApi) {
            try {
              gridApi.refreshHeader();
              gridApi.refreshCells({ force: false });
            } catch (e) {
              console.warn("Could not refresh grid after spacing change:", e);
            }
          }
        }, 50);
      } catch (e) {
        console.warn("Error updating grid spacing with API:", e);
      }
    }
  } catch (e) {
    console.error("Error applying grid spacing:", e);
  }
}

// Apply font size safely
function applyGridFontSize(value: number) {
  applyCssVariable("--ag-font-size", `${value}px`);
}

// Simple Toast component for notifications
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void 
}) {
  const [visible, setVisible] = useState(true);
  
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow for fade-out animation
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  // Determine styles based on type
  const backgroundColor = type === 'success' 
    ? '#10B981' 
    : type === 'error' 
      ? '#EF4444' 
      : '#3B82F6';
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor,
        color: 'white',
        padding: '10px 16px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? '0' : '10px'})`,
        transition: 'opacity 0.3s, transform 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '300px'
      }}
    >
      <div>
        {type === 'success' && '✓'}
        {type === 'error' && '✗'}
        {type === 'info' && 'ℹ'}
      </div>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: 0.7,
          padding: '0 4px'
        }}
      >
        ×
      </button>
    </div>
  );
}

export function DataTable() {
  const { theme: appTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(appTheme === 'dark');
  const [spacing, setSpacing] = useState(4.8);
  const [fontSize, setFontSize] = useState(14);
  const [accentColor, setAccentColor] = useState(accentColorPresets[0].color);
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(themeOptions[0]);
  const [rowData, setRowData] = useState<IOlympicData[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [savedSettings, setSavedSettings] = useState<GridSettings[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string>("default");
  const [showSavedSettingsDropdown, setShowSavedSettingsDropdown] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  // Add toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  
  // Add a ref to track theme synchronization and prevent loops
  const syncingTheme = useRef(false);
  
  const gridRef = useRef<AgGridReact>(null);
  
  // Add a showToast helper function
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  }, []);
  
  const containerStyle = useMemo(() => ({ 
    height: "calc(100vh - 7rem)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem"
  }), []);

  const gridStyle = useMemo(() => ({ 
    flex: 1,
    width: "100%"
  }), []);

  const toolbarStyle = useMemo(() => ({
    flex: "none",
    display: "flex",
    gap: "20px",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: isDarkMode ? "#1A1C23" : "#f8fafc",
    borderRadius: "8px",
    flexWrap: "wrap" as const,
    fontSize: "12px",
    boxShadow: isDarkMode ? "0 2px 6px rgba(0,0,0,0.3)" : "0 2px 6px rgba(0,0,0,0.05)"
  }), [isDarkMode]);

  // Add button styles for save/load functionality
  const buttonStyle = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "4px",
    backgroundColor: accentColor,
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
  }), [accentColor]);

  const secondaryButtonStyle = useMemo(() => ({
    ...buttonStyle,
    backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
    color: isDarkMode ? "#E5E7EB" : "#374151"
  }), [buttonStyle, isDarkMode]);

  const savedSettingsMenuStyle = useMemo(() => ({
    position: "absolute" as const,
    top: "100%",
    right: "0",
    marginTop: "4px",
    minWidth: "200px",
    backgroundColor: isDarkMode ? "#1A202C" : "#FFFFFF",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    display: showSavedSettingsDropdown ? "block" : "none",
    padding: "8px 0"
  }), [isDarkMode, showSavedSettingsDropdown]);
  
  const settingItemStyle = useMemo(() => ({
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    cursor: "pointer",
    transition: "background-color 0.2s"
  }), []);

  const sliderContainerStyle = useMemo(() => ({
    display: "flex",
    gap: "10px",
    alignItems: "center",
    backgroundColor: isDarkMode ? "#2D3748" : "#EDF2F7",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
  }), [isDarkMode]);

  const themeSelectStyle = useMemo(() => ({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    backgroundColor: isDarkMode ? "#2D3748" : "#EDF2F7",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
  }), [isDarkMode]);

  const colorPickerStyle = useMemo(() => ({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    backgroundColor: isDarkMode ? "#2D3748" : "#EDF2F7",
    padding: "6px 12px",
    borderRadius: "6px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
    position: "relative" as const
  }), [isDarkMode]);

  const colorBoxStyle = useMemo(() => ({
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    backgroundColor: accentColor,
    cursor: "pointer",
    border: `1px solid ${isDarkMode ? '#4A5568' : '#CBD5E0'}`,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    transition: "all 0.2s"
  }), [accentColor, isDarkMode]);

  const colorPresetsContainerStyle = useMemo(() => ({
    position: "absolute" as const,
    top: "100%",
    left: "0",
    marginTop: "4px",
    padding: "8px",
    backgroundColor: isDarkMode ? "#1A202C" : "#FFFFFF",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    display: showColorPicker ? "block" : "none"
  }), [isDarkMode, showColorPicker]);

  const selectStyle = useMemo(() => ({
    padding: "4px 8px",
    borderRadius: "4px",
    border: "1px solid " + (isDarkMode ? "#4A5568" : "#CBD5E0"),
    backgroundColor: isDarkMode ? "#1A202C" : "#FFFFFF",
    color: isDarkMode ? "#FFFFFF" : "#2D3748",
    fontSize: "12px",
    height: "24px",
    cursor: "pointer",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "all 0.2s"
  }), [isDarkMode]);

  const labelStyle = useMemo(() => ({
    color: isDarkMode ? "#CBD5E0" : "#4A5568",
    fontWeight: 600,
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px"
  }), [isDarkMode]);

  const sliderValueStyle = useMemo(() => ({
    minWidth: "38px", 
    color: isDarkMode ? "#A0AEC0" : "#718096",
    fontSize: "12px",
    fontFamily: "monospace",
    fontWeight: 600,
    textAlign: "center" as const,
    backgroundColor: isDarkMode ? "#1A202C" : "#FFFFFF",
    padding: "2px 6px",
    borderRadius: "4px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
  }), [isDarkMode]);

  const sliderStyle = useMemo(() => ({
    width: "150px",
    height: "4px",
    margin: "0 4px"
  }), []);

  const customColorInputStyle = useMemo(() => ({
    width: "100%",
    padding: "4px 8px",
    marginTop: "8px",
    borderRadius: "4px",
    border: `1px solid ${isDarkMode ? '#4A5568' : '#CBD5E0'}`,
    backgroundColor: isDarkMode ? "#2D3748" : "#F7FAFC",
    color: isDarkMode ? "#FFFFFF" : "#2D3748",
    fontSize: "12px",
    outline: "none"
  }), [isDarkMode]);

  // Configure sidebar with both columns and filters tabs
  const sideBar = useMemo<SideBarDef>(() => ({
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
      {
        id: 'settings',
        labelDefault: 'Settings',
        labelKey: 'settings',
        iconKey: 'menu',
        toolPanel: 'settingsToolPanel',
      }
    ],
    defaultToolPanel: 'columns'
  }), []);

  const columnDefs = useMemo(() => [
    { field: "athlete", minWidth: 170 },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" },
    { 
      field: "medalist", 
      headerName: "Medalist",
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: {
        checkbox: true,
        className: 'custom-checkbox-cell'
      },
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      width: 100,
      suppressSizeToFit: true
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    filter: true,
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    editable: true,
    // Explicitly type the sortingOrder array to match AG-Grid's expectations
    sortingOrder: ['asc', 'desc', null] as ('asc' | 'desc' | null)[]
  }), []);

  // Modified onGridReady handler
  const onGridReady = useCallback((params: GridReadyEvent) => {
    try {
      console.log('Grid ready');
      setGridReady(true);
      
      // Apply existing settings to the newly ready grid
      applyGridSpacing(spacing, params.api);
      
      // Fetch data with error handling
      fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
        .then((resp) => resp.json())
        .then((data: any[]) => {
          try {
            const transformedData = data.map(row => ({
              ...row,
              medalist: (row.gold + row.silver + row.bronze) > 0
            }));
            setRowData(transformedData);
          } catch (err) {
            console.error("Error transforming grid data:", err);
            setRowData([]); // Set empty array in case of error
          }
        })
        .catch(error => {
          console.error("Error fetching data:", error);
          setRowData([]);
        });
    } catch (error) {
      console.error("Error in grid initialization:", error);
      setRowData([]); // Ensure we at least have valid data
    }
  }, [spacing]);

  const changeSpacing = useCallback((value: number) => {
    setSpacing(value);
    const gridApi = gridRef.current?.api || null;
    applyGridSpacing(value, gridApi);
  }, []);

  const changeFontSize = useCallback((value: number) => {
    setFontSize(value);
    applyGridFontSize(value);
  }, []);

  const changeAccentColor = useCallback((color: string) => {
    setAccentColor(color);
    applyGridAccentColor(color);
  }, []);

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value;
    const newTheme = themeOptions.find(t => t.id === themeId) || themeOptions[0];
    setSelectedTheme(newTheme);

    // Apply accent color to the new theme after a brief delay
    setTimeout(() => {
      applyGridAccentColor(accentColor);
    }, 50);
  }, [accentColor]);

  // IMPORTANT: Define setDarkMode before it's used in any useEffect hooks
  // Improved setDarkMode function to prevent recursive updates
  const setDarkMode = useCallback((enabled: boolean) => {
    // Skip if we're already syncing to prevent loops
    if (syncingTheme.current) {
      console.log('Skipping setDarkMode during sync:', enabled);
      return;
    }
    
    console.log('Setting dark mode to:', enabled);
    syncingTheme.current = true;
    
    // Update state
    setIsDarkMode(enabled);
    
    // Update DOM properties
    document.body.dataset.agThemeMode = enabled ? "dark" : "light";
    
    if (enabled) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // When dark mode changes, we need to reapply styles for proper contrast
    setTimeout(() => {
      try {
        applyGridAccentColor(accentColor);
      } finally {
        // Reset the syncing flag after a short delay
        setTimeout(() => {
          syncingTheme.current = false;
        }, 100);
      }
    }, 50);
  }, [accentColor]);

  // Keep theme in sync with app theme
  useEffect(() => {
    console.log('App theme changed to:', appTheme, 'Current isDarkMode:', isDarkMode);
    
    // Only update if not already syncing and there's a difference
    if (!syncingTheme.current && (appTheme === 'dark') !== isDarkMode) {
      console.log('→ Updating dark mode to match app theme:', appTheme === 'dark');
      setDarkMode(appTheme === 'dark');
    }
  }, [appTheme, setDarkMode, isDarkMode]);

  // Initialize visual settings on component mount - once only
  useEffect(() => {
    // Initial application of styles
    applyGridSpacing(spacing, null);
    applyGridFontSize(fontSize);
    applyGridAccentColor(accentColor);
    
    // Initial theme setup - set immediately and only once at component mount
    if (appTheme === 'dark' && !isDarkMode) {
      console.log('Setting initial dark mode state from app theme');
      document.body.dataset.agThemeMode = "dark";
      document.body.classList.add('dark');
      setIsDarkMode(true);
    }
    
    // Add click outside listener for color picker
    const handleClickOutside = (event: MouseEvent) => {
      const colorPickerContainer = document.querySelector('.color-picker-container');
      if (colorPickerContainer && !colorPickerContainer.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Clean up styles on unmount
      const styleElements = [
        document.getElementById('modern-slider-styles'),
        document.getElementById('ag-grid-checkbox-styles')
      ];
      
      styleElements.forEach(element => {
        if (element) {
          document.head.removeChild(element);
        }
      });
      
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [appTheme, isDarkMode, spacing, fontSize, accentColor]);

  // Function to create a default profile
  const createDefaultProfile = useCallback((): GridSettings => {
    return {
      id: "default",
      theme: "themeQuartz",
      accentColor: accentColorPresets[0].color,
      spacing: 4.8,
      fontSize: 14,
      isDarkMode: appTheme === 'dark',
      gridOptions: {},
      name: "Default",
      isDefault: true
    };
  }, [appTheme]);

  // Function to collect current settings
  const collectCurrentSettings = useCallback((): GridSettings => {
    // Find current profile by ID
    const currentProfileData = savedSettings.find(s => s.id === currentProfile) || createDefaultProfile();
    
    // Get gridOptions from the API if available
    let gridOptionsFromAPI = {};
    let columnState = null;
    let columnGroupState = null;
    
    if (gridRef.current && gridRef.current.api) {
      // Only include options that are actually used in our UI
      const api = gridRef.current.api;
      
      try {
        // Get column states which contains grouping information
        columnState = api.getColumnState();
        columnGroupState = api.getColumnGroupState();
        
        // Get the current rowSelection value
        const rowSelectionOption = api.getGridOption('rowSelection');
        let rowSelectionValue = 'multiple'; // Safe default
        
        // Handle different types of rowSelection values
        if (typeof rowSelectionOption === 'string') {
          rowSelectionValue = rowSelectionOption;
        } else if (rowSelectionOption && typeof rowSelectionOption === 'object') {
          const mode = rowSelectionOption.mode;
          if (mode === 'singleRow') {
            rowSelectionValue = 'single';
          } else {
            rowSelectionValue = 'multiple';
          }
        }
        
        // Get the row grouping panel setting
        const rowGroupPanelShow = api.getGridOption('rowGroupPanelShow');
        
        gridOptionsFromAPI = {
          // Core options
          enableCellTextSelection: api.getGridOption('enableCellTextSelection'),
          rowSelection: rowSelectionValue,
          suppressMenuHide: api.getGridOption('suppressMenuHide'),
          
          // Styling
          headerHeight: api.getGridOption('headerHeight'),
          rowHeight: api.getGridOption('rowHeight'),
          
          // Row Grouping & Pivoting - capture all correctly
          groupDefaultExpanded: api.getGridOption('groupDefaultExpanded'),
          rowGroupPanelShow: rowGroupPanelShow, // Explicitly capture this value
          groupDisplayType: api.getGridOption('groupDisplayType'),
          groupIncludeFooter: api.getGridOption('groupIncludeFooter'),
          groupIncludeTotalFooter: api.getGridOption('groupIncludeTotalFooter'),
          pivotMode: api.getGridOption('pivotMode'),
          pivotColumnGroupTotals: api.getGridOption('pivotColumnGroupTotals'),
          pivotRowTotals: api.getGridOption('pivotRowTotals'),
          
          // Editing
          editType: api.getGridOption('editType'),
          singleClickEdit: api.getGridOption('singleClickEdit'),
          stopEditingWhenCellsLoseFocus: api.getGridOption('stopEditingWhenCellsLoseFocus'),
          enterMovesDown: api.getGridOption('enterMovesDown'),
          enterMovesDownAfterEdit: api.getGridOption('enterMovesDownAfterEdit'),
          readOnlyEdit: api.getGridOption('readOnlyEdit'),
          
          // Column Options
          suppressMovableColumns: api.getGridOption('suppressMovableColumns'),
          suppressFieldDotNotation: api.getGridOption('suppressFieldDotNotation'),
          suppressColumnMoveAnimation: api.getGridOption('suppressColumnMoveAnimation'),
          
          // Additional options
          suppressMultiSort: api.getGridOption('suppressMultiSort'),
          enableAdvancedFilter: api.getGridOption('enableAdvancedFilter'),
          pagination: api.getGridOption('pagination'),
          paginationPageSize: api.getGridOption('paginationPageSize'),
          suppressPaginationPanel: api.getGridOption('suppressPaginationPanel'),
          enableRangeSelection: api.getGridOption('enableRangeSelection'),
          enableRangeHandle: api.getGridOption('enableRangeHandle'),
          enableFillHandle: api.getGridOption('enableFillHandle'),
          suppressDragLeaveHidesColumns: api.getGridOption('suppressDragLeaveHidesColumns'),
          animateRows: api.getGridOption('animateRows'),
        };
        
        // Add any missing properties from the current profileData's gridOptions
        if (currentProfileData.gridOptions) {
          gridOptionsFromAPI = { ...currentProfileData.gridOptions, ...gridOptionsFromAPI };
        }
      } catch (error) {
        console.warn('Error collecting grid options:', error);
        // Fall back to current profile's grid options if available
        if (currentProfileData.gridOptions) {
          gridOptionsFromAPI = { ...currentProfileData.gridOptions };
        }
      }
    } else if (currentProfileData.gridOptions) {
      // No grid API, use current profile grid options
      gridOptionsFromAPI = { ...currentProfileData.gridOptions };
      // Preserve column state from profile if available
      columnState = currentProfileData.columnState || null;
      columnGroupState = currentProfileData.columnGroupState || null;
    }

    return {
      id: currentProfileData.id,
      theme: selectedTheme.id,
      accentColor: accentColor,
      spacing: spacing,
      fontSize: fontSize,
      isDarkMode: isDarkMode,
      gridOptions: gridOptionsFromAPI,
      columnState: columnState,
      columnGroupState: columnGroupState,
      name: currentProfileData.name,
      isDefault: currentProfileData.isDefault
    };
  }, [selectedTheme, accentColor, spacing, fontSize, isDarkMode, currentProfile, savedSettings, createDefaultProfile]);

  // Function to save current settings to the current profile
  const saveSettings = useCallback(() => {
    if (!gridRef.current || !gridRef.current.api) {
      console.warn('Cannot save settings - grid not initialized');
      return;
    }
    
    // Get the current comprehensive settings
    const currentSettings = collectCurrentSettings();
    console.log('Saving current settings to profile:', currentProfile);
    
    // Ensure we're capturing column state and grouping information
    try {
      const api = gridRef.current.api;
      currentSettings.columnState = api.getColumnState();
      currentSettings.columnGroupState = api.getColumnGroupState();
      
      // Explicitly capture important settings that might be missed
      if (currentSettings.gridOptions) {
        // Ensure rowGroupPanelShow is captured properly
        const rowGroupPanelShow = api.getGridOption('rowGroupPanelShow');
        if (rowGroupPanelShow) {
          currentSettings.gridOptions.rowGroupPanelShow = rowGroupPanelShow;
        }
      }
    } catch (e) {
      console.warn('Error capturing column state during save:', e);
    }
    
    // Find if this profile already exists
    const existingIndex = savedSettings.findIndex(s => s.id === currentProfile);
    
    if (existingIndex >= 0) {
      // Update existing profile
      const updatedSettings = [...savedSettings];
      updatedSettings[existingIndex] = currentSettings;
      setSavedSettings(updatedSettings);
      localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));
      
      // Show success toast
      showToast(`Settings saved to "${currentSettings.name}" profile`);
      console.log(`Settings saved to "${currentSettings.name}" profile`);
    } else {
      // This shouldn't happen normally since we're only updating current profile
      const updatedSettings = [...savedSettings, currentSettings];
      setSavedSettings(updatedSettings);
      localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));
      
      // Show success toast
      showToast(`Settings saved as "${currentSettings.name}"`);
      console.log(`Settings saved as "${currentSettings.name}"`);
    }
  }, [collectCurrentSettings, savedSettings, currentProfile, showToast]);

  // Function to save settings as a new profile
  const saveSettingsAs = useCallback(() => {
    if (!gridRef.current || !gridRef.current.api) {
      console.warn('Cannot save settings - grid not initialized');
      return;
    }
    
    const name = prompt('Enter a name for these settings:', `AG-Grid Settings ${new Date().toLocaleString()}`);
    if (!name) return; // User cancelled

    // Get the current comprehensive settings
    const currentSettings = collectCurrentSettings();
    
    // Ensure we're capturing column state and grouping information
    try {
      const api = gridRef.current.api;
      currentSettings.columnState = api.getColumnState();
      currentSettings.columnGroupState = api.getColumnGroupState();
      
      // Explicitly capture important settings that might be missed
      if (currentSettings.gridOptions) {
        // Ensure rowGroupPanelShow is captured properly
        const rowGroupPanelShow = api.getGridOption('rowGroupPanelShow');
        if (rowGroupPanelShow) {
          currentSettings.gridOptions.rowGroupPanelShow = rowGroupPanelShow;
        }
      }
    } catch (e) {
      console.warn('Error capturing column state during save-as:', e);
    }
    
    // Create a new profile with a unique ID
    const newProfile = {
      ...currentSettings,
      id: `profile_${Date.now()}`,
      name: name,
      isDefault: false
    };

    const updatedSettings = [...savedSettings, newProfile];
    setSavedSettings(updatedSettings);
    setCurrentProfile(newProfile.id); // Set this as the current profile
    localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));

    // Show success toast
    showToast(`Settings saved as "${name}" profile and set as current`);
    console.log(`Settings saved as "${name}" profile and set as current`);
  }, [collectCurrentSettings, savedSettings, showToast]);

  // Function to load settings from a profile
  const loadSettings = useCallback((settings: GridSettings) => {
    console.log('Loading settings with isDarkMode:', settings.isDarkMode);
    
    // Apply theme
    const newTheme = themeOptions.find(t => t.id === settings.theme) || themeOptions[0];
    setSelectedTheme(newTheme);

    // Apply visual settings in sequence with a small delay
    // This helps prevent theme flickering
    const applyVisualSettings = () => {
      // Apply dark mode first, as it affects other style applications
      if (settings.isDarkMode !== isDarkMode) {
        setDarkMode(settings.isDarkMode);
        
        // Allow dark mode to apply before other styles
        setTimeout(() => {
          setSpacing(settings.spacing);
          changeFontSize(settings.fontSize);
          changeAccentColor(settings.accentColor);
        }, 50);
      } else {
        // If dark mode isn't changing, apply other styles immediately
        setSpacing(settings.spacing);
        changeFontSize(settings.fontSize);
        changeAccentColor(settings.accentColor);
      }
    };
    
    // Delay applying settings to ensure DOM is ready
    setTimeout(applyVisualSettings, 10);

    // Set as current profile immediately
    setCurrentProfile(settings.id);
    setShowSavedSettingsDropdown(false);

    // Only apply grid options if grid is ready
    if (gridReady && gridRef.current && gridRef.current.api) {
      // Use a safer approach with explicit timeouts
      setTimeout(() => {
        if (!gridRef.current || !gridRef.current.api) return;
        
        try {
          const api = gridRef.current.api;
          const options = settings.gridOptions;
          
          console.log('Loading profile settings:', settings.name);
          console.log('Row group panel setting:', options.rowGroupPanelShow);
          
          // First apply the row grouping panel setting specifically
          if (options.rowGroupPanelShow) {
            try {
              // Ensure we're passing a valid value
              const validValue = ['always', 'onlyWhenGrouping', 'never'].includes(options.rowGroupPanelShow as string) 
                ? options.rowGroupPanelShow 
                : 'onlyWhenGrouping';
                
              api.setGridOption('rowGroupPanelShow', validValue);
              console.log('Applied rowGroupPanelShow:', validValue);
            } catch (e) {
              console.warn('Could not set rowGroupPanelShow:', e);
            }
          }
          
          // Apply column state which includes grouping information
          if (settings.columnState) {
            try {
              api.applyColumnState({
                state: settings.columnState,
                applyOrder: true
              });
              console.log('Applied column state with grouping info');
            } catch (e) {
              console.warn('Could not apply column state:', e);
            }
          }
          
          // Apply column group state
          if (settings.columnGroupState) {
            try {
              api.setColumnGroupState(settings.columnGroupState);
              console.log('Applied column group state');
            } catch (e) {
              console.warn('Could not apply column group state:', e);
            }
          }
          
          // Apply safer options first (size-related ones)
          if (options.headerHeight) {
            api.setGridOption('headerHeight', options.headerHeight);
          }
          
          if (options.rowHeight) {
            api.setGridOption('rowHeight', options.rowHeight);
          }
          
          // Apply other basic options that are unlikely to crash
          const safeOptions = [
            'enableCellTextSelection',
            'suppressMenuHide',
            'suppressMultiSort',
            'pagination',
            'paginationPageSize',
            'suppressPaginationPanel',
            'singleClickEdit',
            'suppressMovableColumns',
            'suppressFieldDotNotation',
            'suppressColumnMoveAnimation',
            'groupDisplayType',
            'groupDefaultExpanded',
            'pivotMode'
          ];
          
          safeOptions.forEach(option => {
            if (options[option] !== undefined) {
              try {
                api.setGridOption(option as any, options[option]);
              } catch (e) {
                console.warn(`Could not set grid option ${option}:`, e);
              }
            }
          });
          
          // Handle row selection carefully
          if (options.rowSelection) {
            try {
              api.setGridOption('rowSelection', options.rowSelection);
            } catch (e) {
              console.warn('Could not set rowSelection:', e);
            }
          }
          
          // Apply changes carefully
          try {
            api.refreshHeader();
            api.refreshCells({ force: false });
          } catch (e) {
            console.error("Error refreshing grid after applying settings:", e);
          }
        } catch (e) {
          console.error("Error applying grid settings:", e);
        }
      }, 300); // Longer timeout for safety
    }
  }, [setDarkMode, changeAccentColor, changeFontSize, gridReady]);

  // Function to delete a saved setting
  const deleteSavedSetting = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the load action
    
    const profileToDelete = savedSettings[index];
    
    // Don't allow deleting the default profile
    if (profileToDelete.isDefault) {
      alert('The Default profile cannot be deleted.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${profileToDelete.name}" profile?`)) {
      const updatedSettings = savedSettings.filter((_, i) => i !== index);
      
      // If we're deleting the current profile, switch to default
      if (profileToDelete.id === currentProfile) {
        const defaultProfile = updatedSettings.find(s => s.isDefault) || createDefaultProfile();
        setCurrentProfile(defaultProfile.id);
        loadSettings(defaultProfile);
      }
      
      setSavedSettings(updatedSettings);
      localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));
    }
  }, [savedSettings, currentProfile, loadSettings, createDefaultProfile]);

  // Modified useEffect for settings initialization
  useEffect(() => {
    const storedSettings = localStorage.getItem('agGridSettings');
    
    if (storedSettings) {
      try {
        let parsedSettings = JSON.parse(storedSettings) as GridSettings[];
        
        // Make sure each setting has an ID
        parsedSettings = parsedSettings.map(setting => ({
          ...setting,
          id: setting.id || `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        }));
        
        // Check if default profile exists
        let defaultProfile = parsedSettings.find(s => s.isDefault);
        
        if (!defaultProfile) {
          // Add default profile if it doesn't exist
          defaultProfile = createDefaultProfile();
          parsedSettings = [defaultProfile, ...parsedSettings];
        }
        
        setSavedSettings(parsedSettings);
        
        // We'll set the current profile ID, but wait to apply settings until grid is ready
        setCurrentProfile(defaultProfile.id);
      } catch (e) {
        console.error('Error loading saved settings:', e);
        // Create and use default profile on error
        const defaultProfile = createDefaultProfile();
        setSavedSettings([defaultProfile]);
        setCurrentProfile(defaultProfile.id);
      }
    } else {
      // No stored settings, create default
      const defaultProfile = createDefaultProfile();
      setSavedSettings([defaultProfile]);
      setCurrentProfile(defaultProfile.id);
    }
  }, [createDefaultProfile]);
  
  // Add new useEffect to handle profile loading after grid is ready
  useEffect(() => {
    if (gridReady && savedSettings.length > 0) {
      const profileToLoad = savedSettings.find(s => s.id === currentProfile);
      if (profileToLoad) {
        // Add a delay to ensure grid is fully initialized
        setTimeout(() => {
          loadSettings(profileToLoad);
        }, 300);
      }
    }
  }, [gridReady, savedSettings, currentProfile, loadSettings]);

  return (
    <div style={containerStyle}>
      <div style={toolbarStyle} className="ag-grid-toolbar">
        <div style={themeSelectStyle}>
          <span style={labelStyle}>
            Theme
          </span>
          <select 
            value={selectedTheme.id} 
            onChange={handleThemeChange}
            style={selectStyle}
          >
            {themeOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div style={colorPickerStyle} className="color-picker-container">
          <span style={labelStyle}>
            Accent
          </span>
          <div 
            style={colorBoxStyle} 
            onClick={() => setShowColorPicker(!showColorPicker)}
          />
          <div style={colorPresetsContainerStyle}>
            <div className="color-presets">
              {accentColorPresets.map((preset, index) => (
                <div
                  key={index}
                  className={`color-preset ${preset.color === accentColor ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: preset.color,
                    borderColor: preset.color === accentColor ? '#FFFFFF' : 'transparent'
                  }}
                  onClick={() => {
                    changeAccentColor(preset.color);
                    setShowColorPicker(false);
                  }}
                  title={preset.name}
                />
              ))}
            </div>
            
            <div style={{
              marginTop: '12px',
              borderTop: `1px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`,
              paddingTop: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: isDarkMode ? '#A0AEC0' : '#718096'
                }}>
                  Custom Color
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => changeAccentColor(e.target.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    padding: '0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent'
                  }}
                />
                
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => changeAccentColor(e.target.value)}
                  placeholder="Hex color code"
                  style={{
                    ...customColorInputStyle,
                    flex: 1,
                    marginTop: 0
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div style={sliderContainerStyle}>
          <span style={labelStyle}>
            Spacing
          </span>
          <input
            type="range"
            onChange={(e) => changeSpacing(parseFloat(e.target.value))}
            value={spacing}
            min="0"
            max="20"
            step="0.1"
            style={sliderStyle}
            className="modern-slider"
          />
          <span style={sliderValueStyle}>
            {spacing.toFixed(1)}
          </span>
        </div>
        <div style={sliderContainerStyle}>
          <span style={labelStyle}>
            Font Size
          </span>
          <input
            type="range"
            onChange={(e) => changeFontSize(parseFloat(e.target.value))}
            value={fontSize}
            min="10"
            max="20"
            step="0.5"
            style={sliderStyle}
            className="modern-slider"
          />
          <span style={sliderValueStyle}>
            {fontSize.toFixed(1)}
          </span>
        </div>
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginLeft: "auto",
          position: "relative" as const
        }} className="settings-dropdown-container">
          <button 
            style={secondaryButtonStyle} 
            onClick={() => setShowSavedSettingsDropdown(!showSavedSettingsDropdown)}
          >
            Profiles ({savedSettings.find(s => s.id === currentProfile)?.name || 'Default'})
          </button>
          
          <div style={savedSettingsMenuStyle}>
            {savedSettings.length === 0 ? (
              <div style={{ 
                padding: "12px", 
                color: isDarkMode ? "#A0AEC0" : "#718096",
                textAlign: "center" as const,
                fontSize: "13px"
              }}>
                No saved profiles
              </div>
            ) : (
              savedSettings.map((setting, index) => (
                <div 
                  key={index}
                  style={{
                    ...settingItemStyle,
                    backgroundColor: setting.id === currentProfile ? 
                      (isDarkMode ? '#2D3748' : '#EDF2F7') : 'transparent',
                    fontWeight: setting.id === currentProfile ? 600 : 400
                  }}
                  onClick={() => loadSettings(setting)}
                >
                  <span style={{ flex: 1 }}>{setting.name}</span>
                  {!setting.isDefault && (
                    <button
                      onClick={(e) => deleteSavedSetting(index, e)}
                      style={{
                        border: "none",
                        background: "none",
                        color: isDarkMode ? "#FC8181" : "#E53E3E",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "2px 6px",
                        marginLeft: "8px",
                        borderRadius: "3px"
                      }}
                      title="Delete profile"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <button style={secondaryButtonStyle} onClick={saveSettingsAs}>
            Save As...
          </button>
          
          <button style={buttonStyle} onClick={saveSettings}>
            Save
          </button>
        </div>
      </div>
      <div style={gridStyle}>
        <GridErrorBoundary>
          {/* Force re-render when theme changes with key */}
          <AgGridReact
            key={`grid-${selectedTheme.id}-${isDarkMode ? 'dark' : 'light'}`}
            ref={gridRef}
            theme={selectedTheme.theme as any}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
            sideBar={sideBar}
            suppressPropertyNamesCheck={true}
            statusBar={{
              statusPanels: [
                { statusPanel: 'agTotalRowCountComponent', align: 'left' },
                { statusPanel: 'agFilteredRowCountComponent' },
                { statusPanel: 'agSelectedRowCountComponent' },
                { statusPanel: 'agAggregationComponent' }
              ]
            }}
            onGridReady={onGridReady}
            components={{
              settingsToolPanel: (props: IToolPanelParams) => (
                <SettingsToolPanel 
                  {...props} 
                  currentProfileId={currentProfile} 
                  showToastMessage={showToast}
                />
              )
            }}
            enableCellTextSelection={true} 
            rowSelection="multiple"
            suppressMenuHide={false}
            enableRangeSelection={gridReady}
          />
        </GridErrorBoundary>
      </div>
      
      {/* Render toast notification when it exists */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
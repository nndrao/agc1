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
type GridTheme = any;

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
}

// Create the General Settings Dialog component
function GeneralSettingsDialog({ 
  isOpen, 
  onClose, 
  gridApi,
  currentProfileId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  gridApi: GridApi | null;
  currentProfileId: string;
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
    
    // Row Selection
    rowSelection: {
      mode: 'multiRow', // Changed from 'type: multiple' to 'mode: multiRow'
      enableSelectionWithoutKeys: true,
      enableClickSelection: true,
    },
    suppressMenuHide: false, // Always show column menu
    
    // Styling
    headerHeight: 32,
    rowHeight: 25,
    
    // Row Grouping & Pivoting
    groupDefaultExpanded: 0,
    rowGroupPanelShow: 'onlyWhenGrouping', // Show/hide row grouping UI
    groupDisplayType: 'singleColumn',
    groupTotalRow: false, // Replaces groupIncludeFooter
    grandTotalRow: false, // Replaces groupIncludeTotalFooter
    pivotMode: false,
    pivotColumnGroupTotals: 'before',
    pivotRowTotals: 'before',
    
    // Sorting
    suppressMultiSort: false,
    
    // Filtering
    enableAdvancedFilter: false,
    cacheQuickFilter: true, // Initial property, can't be updated
    
    // Pagination
    pagination: false,
    paginationPageSize: 100,
    suppressPaginationPanel: false,
    
    // Editing
    editType: 'fullRow',
    singleClickEdit: false, // Start editing on single click
    stopEditingWhenCellsLoseFocus: true, // Initial property, can't be updated
    enterNavigatesVertically: true, // Replaces enterMovesDown
    enterNavigatesVerticallyAfterEdit: true, // Replaces enterMovesDownAfterEdit
    readOnlyEdit: false, // Allow editing but keep original value
    
    // Column Options
    suppressMovableColumns: false,
    suppressFieldDotNotation: false,
    suppressAutoSize: false, // Initial property, can't be updated
    suppressColumnVirtualisation: false, // Initial property, can't be updated
    suppressColumnMoveAnimation: false,
    
    // Export
    suppressCsvExport: false, // Replaces enableCsvExport
    suppressExcelExport: false, // Replaces enableExcelExport
    
    // Cell Selection & Range Selection
    cellSelection: true, // Replaces enableRangeSelection
    cellSelectionHandle: true, // Replaces enableRangeHandle
    cellSelectionFillHandle: true, // Replaces enableFillHandle
    
    // Other Functionality
    suppressDragLeaveHidesColumns: false,
    animateRows: true,
    undoRedoCellEditing: false, // Initial property, can't be updated
    undoRedoCellEditingLimit: 10 // Initial property, can't be updated
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
  
  // Apply grid options to the grid
  const applyGridOptions = () => {
    if (!gridApi) return;
    
    try {
      // Core Grid Options
      gridApi.setGridOption('enableCellTextSelection', gridOptions.enableCellTextSelection);
      
      // Row Selection
      gridApi.setGridOption('rowSelection', gridOptions.rowSelection);
      gridApi.setGridOption('suppressMenuHide', gridOptions.suppressMenuHide);
      
      // Styling
      gridApi.setGridOption('headerHeight', gridOptions.headerHeight);
      gridApi.setGridOption('rowHeight', gridOptions.rowHeight);
      
      // Row Grouping & Pivoting
      gridApi.setGridOption('groupDefaultExpanded', gridOptions.groupDefaultExpanded);
      gridApi.setGridOption('rowGroupPanelShow', gridOptions.rowGroupPanelShow);
      gridApi.setGridOption('groupDisplayType', gridOptions.groupDisplayType);
      gridApi.setGridOption('groupTotalRow', gridOptions.groupTotalRow);
      gridApi.setGridOption('grandTotalRow', gridOptions.grandTotalRow);
      gridApi.setGridOption('pivotMode', gridOptions.pivotMode);
      gridApi.setGridOption('pivotColumnGroupTotals', gridOptions.pivotColumnGroupTotals);
      gridApi.setGridOption('pivotRowTotals', gridOptions.pivotRowTotals);
      
      // Sorting
      gridApi.setGridOption('suppressMultiSort', gridOptions.suppressMultiSort);
      
      // Filtering
      gridApi.setGridOption('enableAdvancedFilter', gridOptions.enableAdvancedFilter);
      
      // Pagination
      gridApi.setGridOption('pagination', gridOptions.pagination);
      gridApi.setGridOption('paginationPageSize', gridOptions.paginationPageSize);
      gridApi.setGridOption('suppressPaginationPanel', gridOptions.suppressPaginationPanel);
      
      // Editing
      gridApi.setGridOption('editType', gridOptions.editType);
      gridApi.setGridOption('singleClickEdit', gridOptions.singleClickEdit);
      gridApi.setGridOption('enterNavigatesVertically', gridOptions.enterNavigatesVertically);
      gridApi.setGridOption('enterNavigatesVerticallyAfterEdit', gridOptions.enterNavigatesVerticallyAfterEdit);
      gridApi.setGridOption('readOnlyEdit', gridOptions.readOnlyEdit);
      
      // Column Options
      gridApi.setGridOption('suppressMovableColumns', gridOptions.suppressMovableColumns);
      gridApi.setGridOption('suppressFieldDotNotation', gridOptions.suppressFieldDotNotation);
      gridApi.setGridOption('suppressColumnMoveAnimation', gridOptions.suppressColumnMoveAnimation);
      
      // Export
      gridApi.setGridOption('suppressCsvExport', gridOptions.suppressCsvExport);
      gridApi.setGridOption('suppressExcelExport', gridOptions.suppressExcelExport);
      
      // Cell Selection & Range Selection
      gridApi.setGridOption('cellSelection', gridOptions.cellSelection);
      
      // Other Functionality
      gridApi.setGridOption('suppressDragLeaveHidesColumns', gridOptions.suppressDragLeaveHidesColumns);
      gridApi.setGridOption('animateRows', gridOptions.animateRows);
      
      // Apply changes
      gridApi.refreshHeader();
      gridApi.refreshCells({ force: true });
      gridApi.sizeColumnsToFit();
      
      console.log('AG-Grid settings applied successfully');
    } catch (error) {
      console.error('Error applying AG-Grid settings:', error);
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
                    value={gridOptions.rowSelection.mode}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: {...gridOptions.rowSelection, mode: e.target.value as 'multiRow' | 'singleRow'}
                    })}
                    style={selectStyle}
                  >
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
                    checked={gridOptions.rowSelection.enableSelectionWithoutKeys}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: {...gridOptions.rowSelection, enableSelectionWithoutKeys: e.target.checked}
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
                    checked={gridOptions.rowSelection.enableClickSelection}
                    onChange={(e) => setGridOptions({
                      ...gridOptions, 
                      rowSelection: {...gridOptions.rowSelection, enableClickSelection: e.target.checked}
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
                    checked={gridOptions.groupTotalRow}
                    onChange={(e) => setGridOptions({...gridOptions, groupTotalRow: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Include grand total footer</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.grandTotalRow}
                    onChange={(e) => setGridOptions({...gridOptions, grandTotalRow: e.target.checked})}
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
                    value={gridOptions.pivotColumnGroupTotals as string}
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
                    value={gridOptions.pivotRowTotals as string}
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
                    value={gridOptions.editType as string}
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
                    checked={gridOptions.enterNavigatesVertically}
                    onChange={(e) => setGridOptions({...gridOptions, enterNavigatesVertically: e.target.checked})}
                    style={checkboxStyle}
                  />
                </div>
              </div>
              
              <div style={optionItemStyle}>
                <span style={labelStyle}>Move down after edit on Enter</span>
                <div style={controlStyle}>
                  <input 
                    type="checkbox" 
                    checked={gridOptions.enterNavigatesVerticallyAfterEdit}
                    onChange={(e) => setGridOptions({...gridOptions, enterNavigatesVerticallyAfterEdit: e.target.checked})}
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
function SettingsToolPanel(props: IToolPanelParams & { currentProfileId?: string }) {
  const { api, currentProfileId } = props;
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
        />
      )}
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
  const [rowData, setRowData] = useState<IOlympicData[]>([]);  // Initialize with empty array
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [savedSettings, setSavedSettings] = useState<GridSettings[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string>("default");
  const [showSavedSettingsDropdown, setShowSavedSettingsDropdown] = useState(false);
  const [gridReady, setGridReady] = useState(false);  // Track grid initialization
  const gridRef = useRef<AgGridReact>(null);
  
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
    setGridReady(true);  // Mark grid as ready
    
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((resp) => resp.json())
      .then((data: any[]) => {
        // Transform the data to add the medalist boolean field
        const transformedData = data.map(row => ({
          ...row,
          // An athlete is a medalist if they have at least one medal
          medalist: (row.gold + row.silver + row.bronze) > 0
        }));
        setRowData(transformedData);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        // Set empty array if fetch fails
        setRowData([]);
      });
  }, []);

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    document.body.dataset.agThemeMode = enabled ? "dark" : "light";
    document.body.classList.toggle('dark', enabled);
  };

  const changeSpacing = useCallback((value: number) => {
    setSpacing(value);
    
    try {
      // Update only essential spacing CSS variables
      document.documentElement.style.setProperty("--ag-grid-size", `${value}px`);
      
      // For other variables, apply changes that won't trigger grid restructuring
      if (gridRef.current && gridRef.current.api) {
        // Apply row height and header height via API which is safer
        gridRef.current.api.setGridOption('rowHeight', Math.max(25, 25 + value));
        gridRef.current.api.setGridOption('headerHeight', Math.max(25, 25 + value));
        
        // Refresh the grid safely without complete redraw
        requestAnimationFrame(() => {
          if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.refreshHeader();
            gridRef.current.api.refreshCells({ force: false });
            
            // Only resize columns if not causing errors
            try {
              gridRef.current.api.sizeColumnsToFit();
            } catch (e) {
              console.warn("Could not resize columns:", e);
            }
          }
        });
      }
    } catch (e) {
      console.error("Error updating grid spacing:", e);
    }
  }, []);

  const changeFontSize = useCallback((value: number) => {
    setFontSize(value);
    document.documentElement.style.setProperty("--ag-font-size", `${value}px`);
  }, []);

  // Move updateSliderStyles before changeAccentColor to resolve the circular dependency
  const updateSliderStyles = useCallback((color: string) => {
    const styleElement = document.getElementById('modern-slider-styles');
    if (styleElement) {
      styleElement.innerHTML = generateSliderStyles(color);
    }
  }, []);

  const updateCheckboxStyles = useCallback((color: string) => {
    const styleId = 'ag-grid-checkbox-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.innerHTML = generateCheckboxStyles(color);
  }, []);
  
  const changeAccentColor = useCallback((color: string) => {
    setAccentColor(color);
    
    // Common variables for all themes
    document.documentElement.style.setProperty("--ag-alpine-active-color", color);
    document.documentElement.style.setProperty("--ag-selected-row-background-color", colorWithOpacity(color, 0.1));
    document.documentElement.style.setProperty("--ag-row-hover-color", colorWithOpacity(color, 0.05));
    document.documentElement.style.setProperty("--ag-column-hover-color", colorWithOpacity(color, 0.05));
    document.documentElement.style.setProperty("--ag-range-selection-background-color", colorWithOpacity(color, 0.2));
    document.documentElement.style.setProperty("--ag-range-selection-border-color", color);
    document.documentElement.style.setProperty("--ag-range-selection-highlight-color", colorWithOpacity(color, 0.3));
    
    // Quartz theme specific
    document.documentElement.style.setProperty("--ag-quartz-primary-color", color);
    
    // Material theme specific
    document.documentElement.style.setProperty("--ag-material-primary-color", color);
    document.documentElement.style.setProperty("--ag-material-accent-color", color);
    
    // Alpine theme specific
    document.documentElement.style.setProperty("--ag-alpine-active-color", color);
    
    // Balham theme specific
    document.documentElement.style.setProperty("--ag-balham-active-color", color);
    
    // Checkbox colors - Note: These aren't directly supported by AG-Grid CSS vars,
    // but we'll set them in case they add support in the future
    document.documentElement.style.setProperty("--ag-checkbox-background-color", color);
    document.documentElement.style.setProperty("--ag-checkbox-checked-color", color);
    document.documentElement.style.setProperty("--ag-checkbox-indeterminate-color", color);
    document.documentElement.style.setProperty("--ag-toggle-button-on-background-color", color);
    document.documentElement.style.setProperty("--ag-input-focus-border-color", color);
    
    // Update slider styles with new color
    updateSliderStyles(color);
    
    // Update checkbox styles with new color using CSS overrides
    updateCheckboxStyles(color);
  }, [updateSliderStyles, updateCheckboxStyles]);

  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = e.target.value;
    const newTheme = themeOptions.find(t => t.id === themeId) || themeOptions[0];
    setSelectedTheme(newTheme);

    // Apply accent color to the new theme
    setTimeout(() => changeAccentColor(accentColor), 0);
  }, [accentColor, changeAccentColor]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const colorPickerContainer = document.querySelector('.color-picker-container');
    if (colorPickerContainer && !colorPickerContainer.contains(event.target as Node)) {
      setShowColorPicker(false);
    }
  }, []);

  // Keep theme in sync with app theme
  useEffect(() => {
    setDarkMode(appTheme === 'dark');
  }, [appTheme]);

  // Initialize spacing, font size, and accent color on component mount
  useEffect(() => {
    changeSpacing(spacing);
    changeFontSize(fontSize);
    changeAccentColor(accentColor);
    
    // Add slider styles to document
    const styleElem = document.createElement('style');
    styleElem.id = 'modern-slider-styles';
    styleElem.innerHTML = generateSliderStyles(accentColor);
    document.head.appendChild(styleElem);
    
    // Add click outside listener for color picker
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
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
  }, [changeSpacing, spacing, changeFontSize, fontSize, changeAccentColor, accentColor, handleClickOutside]);

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
    if (gridRef.current && gridRef.current.api) {
      // Only include options that are actually used in our UI
      const api = gridRef.current.api;
      
      try {
        const rowSelectionOption = api.getGridOption('rowSelection');
        let rowSelectionValue: any = { mode: 'multiRow' };
        
        // Safely extract rowSelection properties
        if (rowSelectionOption && typeof rowSelectionOption === 'object') {
          rowSelectionValue = {
            mode: rowSelectionOption.mode || 'multiRow',
            enableSelectionWithoutKeys: !!rowSelectionOption.enableSelectionWithoutKeys,
            enableClickSelection: !!rowSelectionOption.enableClickSelection
          };
        }
        
        gridOptionsFromAPI = {
          enableCellTextSelection: api.getGridOption('enableCellTextSelection'),
          rowSelection: rowSelectionValue,
          suppressMenuHide: api.getGridOption('suppressMenuHide'),
          headerHeight: api.getGridOption('headerHeight'),
          rowHeight: api.getGridOption('rowHeight'),
          groupDefaultExpanded: api.getGridOption('groupDefaultExpanded'),
          rowGroupPanelShow: api.getGridOption('rowGroupPanelShow'),
          groupDisplayType: api.getGridOption('groupDisplayType'),
          groupTotalRow: api.getGridOption('groupTotalRow'),
          grandTotalRow: api.getGridOption('grandTotalRow'),
          // ... include all other options from GeneralSettingsDialog
        };
      } catch (error) {
        console.warn('Error collecting grid options:', error);
      }
    }

    return {
      id: currentProfileData.id,
      theme: selectedTheme.id,
      accentColor: accentColor,
      spacing: spacing,
      fontSize: fontSize,
      isDarkMode: isDarkMode,
      gridOptions: gridOptionsFromAPI,
      name: currentProfileData.name,
      isDefault: currentProfileData.isDefault
    };
  }, [selectedTheme, accentColor, spacing, fontSize, isDarkMode, currentProfile, savedSettings, createDefaultProfile]);

  // Function to save current settings to the current profile
  const saveSettings = useCallback(() => {
    const currentSettings = collectCurrentSettings();
    
    // Find if this profile already exists
    const existingIndex = savedSettings.findIndex(s => s.id === currentProfile);
    
    if (existingIndex >= 0) {
      // Update existing profile
      const updatedSettings = [...savedSettings];
      updatedSettings[existingIndex] = currentSettings;
      setSavedSettings(updatedSettings);
      localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));
      alert(`Settings saved to "${currentSettings.name}" profile`);
    } else {
      // This shouldn't happen normally since we're only updating current profile
      const updatedSettings = [...savedSettings, currentSettings];
      setSavedSettings(updatedSettings);
      localStorage.setItem('agGridSettings', JSON.stringify(updatedSettings));
      alert(`Settings saved as "${currentSettings.name}"`);
    }
  }, [collectCurrentSettings, savedSettings, currentProfile]);

  // Function to save settings as a new profile
  const saveSettingsAs = useCallback(() => {
    const name = prompt('Enter a name for these settings:', `AG-Grid Settings ${new Date().toLocaleString()}`);
    if (!name) return; // User cancelled

    const currentSettings = collectCurrentSettings();
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

    alert(`Settings saved as "${name}" profile and set as current`);
  }, [collectCurrentSettings, savedSettings]);

  // Function to load settings from a profile
  const loadSettings = useCallback((settings: GridSettings) => {
    // Apply theme
    const newTheme = themeOptions.find(t => t.id === settings.theme) || themeOptions[0];
    setSelectedTheme(newTheme);

    // Apply visual settings that don't require the grid
    setDarkMode(settings.isDarkMode);
    setSpacing(settings.spacing);
    changeFontSize(settings.fontSize);
    changeAccentColor(settings.accentColor);

    // Apply grid options if we have a grid API and it's ready
    if (gridRef.current && gridRef.current.api && settings.gridOptions && gridReady) {
      try {
        const api = gridRef.current.api;
        
        // Apply settings with a delay to ensure grid is properly initialized
        setTimeout(() => {
          try {
            if (gridRef.current && gridRef.current.api) {
              // Apply only essential options first
              if (settings.gridOptions.headerHeight) {
                api.setGridOption('headerHeight', settings.gridOptions.headerHeight);
              }
              
              if (settings.gridOptions.rowHeight) {
                api.setGridOption('rowHeight', settings.gridOptions.rowHeight);
              }
              
              // Apply remaining options with a further delay
              setTimeout(() => {
                try {
                  if (gridRef.current && gridRef.current.api) {
                    // Apply other options
                    Object.entries(settings.gridOptions)
                      .filter(([key]) => key !== 'headerHeight' && key !== 'rowHeight')
                      .forEach(([key, value]) => {
                        try {
                          gridRef.current!.api!.setGridOption(key as any, value as any);
                        } catch (e) {
                          console.warn(`Could not set grid option ${key}:`, e);
                        }
                      });
                    
                    // Refresh the grid safely
                    gridRef.current.api.refreshHeader();
                    gridRef.current.api.refreshCells({ force: false });
                  }
                } catch (e) {
                  console.error("Error applying delayed grid settings:", e);
                }
              }, 100);
            }
          } catch (e) {
            console.error("Error in first stage of applying grid settings:", e);
          }
        }, 100);
      } catch (e) {
        console.error("Error setting up grid settings application:", e);
      }
    }

    // Set as current profile
    setCurrentProfile(settings.id);
    setShowSavedSettingsDropdown(false);
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
        <AgGridReact
          ref={gridRef}
          theme={selectedTheme.theme}
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
            settingsToolPanel: (props: IToolPanelParams) => <SettingsToolPanel {...props} currentProfileId={currentProfile} />
          }}
        />
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { THEME_OPTIONS, ACCENT_COLOR_PRESETS, DENSITY_OPTIONS } from './hooks/useDataTableTheme';
import { DataTableSettingsProps } from './types';

/**
 * Enhanced settings dialog for the DataTable component
 */
export const DataTableSettings: React.FC<DataTableSettingsProps> = ({
  currentTheme,
  accentColor,
  density,
  themeOptions = THEME_OPTIONS,
  accentColorPresets = ACCENT_COLOR_PRESETS,
  onThemeChange,
  onAccentColorChange,
  onDensityChange,
  onClose,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'display' | 'behavior'>('appearance');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Table Settings</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'appearance' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'display' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => setActiveTab('display')}
          >
            Display
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'behavior' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => setActiveTab('behavior')}
          >
            Behavior
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Theme</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onThemeChange(option.id)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        currentTheme === option.id 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-400 dark:text-blue-200' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 dark:text-gray-200'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Accent Color */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Accent Color</h4>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {accentColorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => onAccentColorChange(preset.color)}
                        className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                          accentColor === preset.color ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-gray-800 dark:ring-white' : ''
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                        aria-label={`Set accent color to ${preset.name}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden relative">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => onAccentColorChange(e.target.value)}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                        aria-label="Custom color picker"
                      />
                      <div className="absolute inset-0 rounded-full" style={{ backgroundColor: accentColor }}></div>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                        Custom Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => onAccentColorChange(e.target.value)}
                          className="border text-sm py-1 px-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 w-24"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Hex value
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Row Density */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Row Density</h4>
                <div className="space-y-3">
                  {DENSITY_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={option.id}
                        name="density"
                        checked={density === option.id}
                        onChange={() => onDensityChange(option.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor={option.id} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        {option.name}
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {option.id === 'compact' 
                          ? 'More rows visible' 
                          : option.id === 'comfortable' 
                            ? 'Better readability' 
                            : 'Balanced'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Column visibility (sample) */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Visible Columns</h4>
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Column visibility settings will be implemented in future updates.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'behavior' && (
            <div className="space-y-6">
              {/* Pagination */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Pagination</h4>
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pagination and page size settings will be implemented in future updates.
                  </p>
                </div>
              </div>
              
              {/* Sorting */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">Default Sorting</h4>
                <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Default sorting settings will be implemented in future updates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
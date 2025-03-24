import React from 'react';
import { DataTableToolbarProps } from './types';

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  title,
  searchText,
  onSearchChange,
  onExport,
  onSettingsToggle,
  gridApi,
  enableExport = true,
  enableThemeSettings = true,
}) => {
  return (
    <div className="data-table-toolbar flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
      <h2 className="text-xl font-semibold flex-shrink-0">{title}</h2>
      
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
        {/* Search */}
        <div className="search-filter relative flex-grow sm:flex-grow-0 sm:min-w-48">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="p-2 pl-10 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Actions */}
        <div className="data-table-actions flex gap-2 flex-shrink-0">
          {enableExport && (
            <button 
              onClick={onExport}
              disabled={!gridApi}
              className="px-3 py-2 flex items-center gap-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              title="Export to CSV"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          
          {enableThemeSettings && (
            <button 
              onClick={onSettingsToggle}
              className="px-3 py-2 flex items-center gap-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Table Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
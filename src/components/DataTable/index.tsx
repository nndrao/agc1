import { DataTableMain } from './DataTableMain';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTableSettings } from './DataTableSettings';

// Export the main component as the default export
export default DataTableMain;

// Export components directly
export { DataTableToolbar, DataTableSettings };
export * from './types';
export * from './hooks';
export * from './utils';
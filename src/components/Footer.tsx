import React from 'react';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} My App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
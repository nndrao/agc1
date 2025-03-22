import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">My App</h1>
        </div>
        <div className="flex items-center space-x-6">
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Home</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</a></li>
              <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact</a></li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
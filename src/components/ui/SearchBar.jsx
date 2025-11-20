import React from 'react';

/**
 * 検索バーコンポーネント
 */
const SearchBar = ({ searchTerm, onSearchChange, searchColumn, onColumnChange, headers }) => {
  return (
    <div className="w-full sm:flex-grow sm:max-w-md">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="検索..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl sm:rounded-l-xl sm:rounded-r-none w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
          />
        </div>
        <select
          value={searchColumn}
          onChange={(e) => onColumnChange(e.target.value)}
          className="px-3 py-2.5 border sm:border-l-0 border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-r-xl sm:rounded-l-none bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base min-h-[44px]"
        >
          <option value="all">すべての列</option>
          {headers.map((header) => (
            <option key={header} value={header}>
              {header}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default React.memo(SearchBar);

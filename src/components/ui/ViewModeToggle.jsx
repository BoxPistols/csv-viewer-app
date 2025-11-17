import React from 'react';

/**
 * 表示モード切り替えコンポーネント
 */
const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
      <button
        onClick={() => onViewModeChange('table')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
          viewMode === 'table'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        テーブル
      </button>
      <button
        onClick={() => onViewModeChange('json')}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
          viewMode === 'json'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        JSON
      </button>
    </div>
  );
};

export default React.memo(ViewModeToggle);

import React from 'react';

/**
 * 列選択コンポーネント
 */
const ColumnSelector = ({
  isOpen,
  onToggle,
  headers,
  selectedColumns,
  onToggleColumn,
  onToggleAllColumns,
  onResetWidths
}) => {
  return (
    <>
      <div className="relative w-full sm:w-auto sm:ml-auto">
        <button
          className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] text-sm sm:text-base"
          onClick={onToggle}
        >
          <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">列の設定</span>
          <span className="sm:hidden">列設定</span>
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 z-30 max-h-80 overflow-y-auto w-72 sm:w-80">
            <div className="flex justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 gap-2">
              <button
                className="text-xs sm:text-sm px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all min-h-[44px] flex-1"
                onClick={() => onToggleAllColumns(true)}
              >
                すべて表示
              </button>
              <button
                className="text-xs sm:text-sm px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all min-h-[44px] flex-1"
                onClick={() => onToggleAllColumns(false)}
              >
                すべて非表示
              </button>
            </div>
            <div className="space-y-2">
              {headers.map(header => (
                <label key={header} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors min-h-[44px]">
                  <input
                    type="checkbox"
                    id={`col-${header}`}
                    checked={selectedColumns.includes(header)}
                    onChange={() => onToggleColumn(header)}
                    className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{header}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onResetWidths}
        className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md active:shadow-sm transition-all duration-200 flex items-center justify-center min-h-[44px] text-sm sm:text-base"
        title="列幅をリセット"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="hidden sm:inline">リセット</span>
        <span className="sm:hidden">リセット</span>
      </button>
    </>
  );
};

export default React.memo(ColumnSelector);

import React from 'react';

/**
 * ページネーションコンポーネント
 */
const Pagination = ({
  currentPage,
  totalPages,
  filteredDataLength,
  rowsPerPage,
  onPageChange,
  isFullScreen
}) => {
  const startRecord = filteredDataLength > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const endRecord = Math.min(currentPage * rowsPerPage, filteredDataLength);

  return (
    <div className={`${isFullScreen ?
      'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 z-50 shadow-2xl' : 'mt-4 sm:mt-6'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              {filteredDataLength}件中 {startRecord} - {endRecord} 件表示
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label="最初のページ"
          >
            &laquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label="前のページ"
          >
            &lsaquo;
          </button>

          <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-md text-sm sm:text-base min-h-[44px] flex items-center justify-center whitespace-nowrap">
            {currentPage} / {totalPages || 1}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label="次のページ"
          >
            &rsaquo;
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700 dark:text-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
            aria-label="最後のページ"
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Pagination);

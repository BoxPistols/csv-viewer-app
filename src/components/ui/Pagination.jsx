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
      'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl' : 'mt-6'}`}>
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {filteredDataLength}件中 {startRecord} - {endRecord} 件表示
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
          >
            &laquo;
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalPages === 0}
            className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
          >
            &lsaquo;
          </button>

          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-md">
            {currentPage} / {totalPages || 1}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
          >
            &rsaquo;
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
          >
            &raquo;
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Pagination);

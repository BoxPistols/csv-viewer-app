import React from 'react';

/**
 * エクスポートボタンコンポーネント
 */
const ExportButtons = ({
  onExportJson,
  onExportCsv,
  onCopyJson,
  viewMode,
  onToggleFullScreen,
  isFullScreen
}) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
      <button
        onClick={onExportJson}
        className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] text-sm sm:text-base whitespace-nowrap"
      >
        <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">JSON保存</span>
        <span className="sm:hidden">JSON</span>
      </button>

      <button
        onClick={onExportCsv}
        className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] text-sm sm:text-base whitespace-nowrap"
      >
        <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">CSV保存</span>
        <span className="sm:hidden">CSV</span>
      </button>

      {viewMode === 'json' && (
        <button
          onClick={onCopyJson}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">JSONコピー</span>
          <span className="sm:hidden">コピー</span>
        </button>
      )}

      {viewMode === 'table' && (
        <button
          onClick={onToggleFullScreen}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px] text-sm sm:text-base whitespace-nowrap"
        >
          <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span className="hidden sm:inline">{isFullScreen ? '解除' : 'フル画面'}</span>
          <span className="sm:hidden">全画面</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(ExportButtons);

import React from 'react';

/**
 * エラー表示コンポーネント
 */
const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-red-500 dark:border-red-400"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">エラーが発生しました</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300 transition-colors"
          aria-label="エラーメッセージを閉じる"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ErrorDisplay);

import React from 'react';

/**
 * ローディングスピナーコンポーネント
 */
const LoadingSpinner = ({ status }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 text-center px-2">{status}</p>
        <div className="w-full max-w-xs sm:max-w-sm md:w-80 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoadingSpinner);

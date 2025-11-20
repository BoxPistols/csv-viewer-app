import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ダークモード切り替えボタンコンポーネント
 */
const DarkModeToggle = () => {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-gray-700 to-gray-800 dark:from-yellow-500 dark:to-orange-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-h-[44px] min-w-[44px] justify-center"
      aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {isDark ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden sm:inline text-sm">ライト</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="hidden sm:inline text-sm">ダーク</span>
        </>
      )}
    </button>
  );
};

export default React.memo(DarkModeToggle);

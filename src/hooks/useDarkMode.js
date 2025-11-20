import { useState, useEffect } from 'react';

/**
 * ダークモード管理のカスタムフック
 */
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // ローカルストレージから保存された設定を読み込む
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // システムの設定を確認
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleDarkMode, setIsDark };
};

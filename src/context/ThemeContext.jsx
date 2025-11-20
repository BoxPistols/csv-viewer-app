import React, { createContext, useContext } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

/**
 * テーマコンテキスト
 */
const ThemeContext = createContext();

/**
 * テーマプロバイダーコンポーネント
 */
export const ThemeProvider = ({ children }) => {
  const { isDark, toggleDarkMode, setIsDark } = useDarkMode();

  return (
    <ThemeContext.Provider value={{ isDark, toggleDarkMode, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * テーマコンテキストを使用するカスタムフック
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import { useEffect, useCallback } from 'react';

/**
 * キーボードショートカットのカスタムフック
 */
export const useKeyboardShortcuts = (handlers = {}) => {
  const handleKeyPress = useCallback((e) => {
    const { ctrlKey, metaKey, key, target } = e;
    const isModifierKey = ctrlKey || metaKey;
    const isInputField = target.matches('input, select, textarea');

    // Ctrl/Cmd + O - ファイルを開く
    if (isModifierKey && key === 'o' && handlers.onOpen) {
      e.preventDefault();
      handlers.onOpen();
    }

    // Ctrl/Cmd + F - 検索フォーカス
    if (isModifierKey && key === 'f' && handlers.onSearch) {
      e.preventDefault();
      handlers.onSearch();
    }

    // Ctrl/Cmd + E - JSONエクスポート
    if (isModifierKey && key === 'e' && handlers.onExportJSON) {
      e.preventDefault();
      handlers.onExportJSON();
    }

    // Ctrl/Cmd + S - CSVエクスポート
    if (isModifierKey && key === 's' && handlers.onExportCSV) {
      e.preventDefault();
      handlers.onExportCSV();
    }

    // Ctrl/Cmd + K - サンプルデータ
    if (isModifierKey && key === 'k' && handlers.onLoadSample) {
      e.preventDefault();
      handlers.onLoadSample();
    }

    // 矢印キー - ページネーション (入力フィールド以外)
    if (!isInputField) {
      if (key === 'ArrowLeft' && handlers.onPreviousPage) {
        handlers.onPreviousPage();
      }
      if (key === 'ArrowRight' && handlers.onNextPage) {
        handlers.onNextPage();
      }
    }

    // Escape - エラーを閉じる
    if (key === 'Escape' && handlers.onClearError) {
      handlers.onClearError();
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return null;
};

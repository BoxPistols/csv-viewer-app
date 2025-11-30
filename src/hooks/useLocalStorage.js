import { useState, useEffect, useCallback } from 'react';

/**
 * ローカルストレージの値を管理するカスタムフック
 */
export const useLocalStorage = (key, initialValue) => {
  // 初期値を取得
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 値を設定する関数
  const setValue = useCallback((value) => {
    try {
      // 関数が渡された場合は実行
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 値を削除する関数
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * ファイル名ごとに設定を管理するカスタムフック
 */
export const useFileStorage = (fileName, settingKey, initialValue) => {
  const storageKey = fileName ? `${settingKey}_${fileName}` : null;

  const [value, setValue, removeValue] = useLocalStorage(
    storageKey || 'temp',
    initialValue
  );

  // ファイル名が変わったら値を更新
  useEffect(() => {
    if (storageKey) {
      try {
        const item = window.localStorage.getItem(storageKey);
        if (item) {
          setValue(JSON.parse(item));
        } else {
          setValue(initialValue);
        }
      } catch (error) {
        console.error(`Error loading file storage:`, error);
        setValue(initialValue);
      }
    }
  }, [storageKey, initialValue, setValue]);

  return storageKey ? [value, setValue, removeValue] : [initialValue, () => {}, () => {}];
};

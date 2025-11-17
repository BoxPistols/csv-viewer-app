import { useState, useCallback } from 'react';
import Papa from 'papaparse';

/**
 * CSV解析のカスタムフック
 */
export const useCSVParser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');

  /**
   * ファイルバリデーション
   */
  const validateFile = useCallback((file) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_EXTENSIONS = ['.csv'];

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます（最大: 50MB）。現在のサイズ: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'ファイルが空です。データが含まれているCSVファイルを選択してください。'
      };
    }

    const fileName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
      return {
        valid: false,
        error: `CSVファイル（.csv）を選択してください。選択されたファイル: ${file.name}`
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: true,
        warning: `大きなファイル（${(file.size / 1024 / 1024).toFixed(2)}MB）です。処理に時間がかかる場合があります。`
      };
    }

    return { valid: true };
  }, []);

  /**
   * CSV解析
   */
  const parseCSV = useCallback((file, options = {}) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setProcessingStatus(`ファイル "${file.name}" を読み込み中...`);
      setError(null);

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csvText = e.target.result;

          if (!csvText || csvText.trim().length === 0) {
            reject(new Error('ファイルにデータが含まれていません。'));
            setLoading(false);
            return;
          }

          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            preview: options.preview || 5000,
            encoding: 'UTF-8',
            dynamicTyping: false,
            complete: (results) => {
              if (results.errors && results.errors.length > 0) {
                const criticalErrors = results.errors.filter(
                  err => err.type === 'FieldMismatch' || err.type === 'Quotes'
                );
                if (criticalErrors.length > 0) {
                  console.warn('CSV解析時に警告:', results.errors);
                  setProcessingStatus(
                    `警告: CSVファイルに${results.errors.length}個の軽微な問題がありましたが、処理を続行します。`
                  );
                }
              }

              if (!results.data || results.data.length === 0) {
                reject(new Error('CSVファイルにデータ行が見つかりません。'));
                setLoading(false);
                return;
              }

              if (!results.meta.fields || results.meta.fields.length === 0) {
                reject(new Error('CSVファイルのヘッダー（列名）が見つかりません。'));
                setLoading(false);
                return;
              }

              setLoading(false);
              setProcessingStatus('');
              resolve({
                data: results.data,
                headers: results.meta.fields,
                fileName: file.name
              });
            },
            error: (err) => {
              const errorMsg = `CSV解析エラー: ${err.message}`;
              setError(errorMsg);
              setLoading(false);
              reject(new Error(errorMsg));
            }
          });
        } catch (err) {
          const errorMsg = `ファイル処理中にエラーが発生: ${err.message}`;
          setError(errorMsg);
          setLoading(false);
          reject(new Error(errorMsg));
        }
      };

      reader.onerror = () => {
        const errorMsg = 'ファイルの読み込みに失敗しました。';
        setError(errorMsg);
        setLoading(false);
        reject(new Error(errorMsg));
      };

      try {
        reader.readAsText(file, 'UTF-8');
      } catch (err) {
        const errorMsg = `ファイルの読み込みを開始できませんでした: ${err.message}`;
        setError(errorMsg);
        setLoading(false);
        reject(new Error(errorMsg));
      }
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    processingStatus,
    validateFile,
    parseCSV,
    clearError,
    setError
  };
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Papa from 'papaparse';

const CSVViewerApp = () => {
  // 状態管理
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' または 'json'
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [fileName, setFileName] = useState('');
  // 全画面表示モード用の状態変数を追加
  const [isFullScreen, setIsFullScreen] = useState(false);
  // セル表示モード用の状態変数を追加
  const [cellDisplayMode, setCellDisplayMode] = useState(); // 'singleline', 'ellipsis'
  // 列幅の状態を追加
  const [columnWidths, setColumnWidths] = useState({});
  // リサイズ中の状態管理
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // ツールチップ関連の状態
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [hoveredCell, setHoveredCell] = useState(null);

  // ヘッダー折り返し設定
  const [headerWrapMode, setHeaderWrapMode] = useState(false);

  // ヘッダー/アップロードセクション折りたたみ
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // 新しい状態変数
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [columnOrder, setColumnOrder] = useState([]);
  const [showAllRows, setShowAllRows] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  const fileInputRef = useRef(null);
  const tableRef = useRef(null);
  const rowsPerPageOptions = [10, 25, 50, 100];

  // 列設定を保存する関数
  const saveColumnSettings = (columns) => {
    try {
      localStorage.setItem(`columns_${fileName}`, JSON.stringify(columns));
    } catch (e) {
      console.error('列設定の保存に失敗しました:', e);
    }
  };

  // 列設定を読み込む関数
  const loadColumnSettings = (fileName) => {
    try {
      const saved = localStorage.getItem(`columns_${fileName}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('列設定の読み込みに失敗しました:', e);
      return null;
    }
  };

  // カラム順序の保存
  const saveColumnOrder = (order) => {
    try {
      localStorage.setItem(`columnOrder_${fileName}`, JSON.stringify(order));
    } catch (e) {
      console.error('カラム順序の保存に失敗しました:', e);
    }
  };

  // カラム順序の読み込み
  const loadColumnOrder = (fileName) => {
    try {
      const saved = localStorage.getItem(`columnOrder_${fileName}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('カラム順序の読み込みに失敗しました:', e);
      return null;
    }
  };

  // カラム幅の保存
  const saveColumnWidths = (widths) => {
    try {
      localStorage.setItem(`columnWidths_${fileName}`, JSON.stringify(widths));
    } catch (e) {
      console.error('カラム幅の保存に失敗しました:', e);
    }
  };

  // カラム幅の読み込み
  const loadColumnWidths = (fileName) => {
    try {
      const saved = localStorage.getItem(`columnWidths_${fileName}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('カラム幅の読み込みに失敗しました:', e);
      return null;
    }
  };

  // 列幅のリセット
  const resetColumnWidths = () => {
    setColumnWidths({});
    saveColumnWidths(columnWidths);
  };

  // スタイルの追加
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.id = 'csv-viewer-styles';
    styleEl.innerHTML = `
      .column-dragging {
        opacity: 0.6;
        transform: scale(0.98);
      }
      th.column-drag-over {
        background: #2563eb;
        border-left: 3px solid #fff;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
      }
      .cell-ellipsis {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cell-singleline {
        white-space: nowrap;
        overflow: hidden;
      }
      .cell-multiline {
        white-space: pre-wrap;
        max-height: 72px;
        overflow: hidden;
        display: block;
        text-overflow: ellipsis;
        word-break: break-word;
      }
      .resizing {
        cursor: col-resize;
        user-select: none;
      }
      .column-resize-handle {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 8px;
        cursor: col-resize;
        z-index: 1;
        background: transparent;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease;
      }
      .column-resize-handle:hover, .column-resize-handle:active {
        background: rgba(255, 255, 255, 0.2);
        border-right: 2px solid rgba(255, 255, 255, 0.5);
      }
      th {
        position: relative;
      }
      td, th {
        box-sizing: border-box;
      }
      .table-container {
        max-width: 100%;
      }
      .cell-tooltip {
        position: fixed;
        background: #1e40af;
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        font-size: 14px;
        line-height: 1.5;
      }
      .cell-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border-width: 6px;
        border-style: solid;
        border-color: #1e40af transparent transparent transparent;
      }
      .header-wrap {
        white-space: normal !important;
        word-break: break-word;
      }
      .header-nowrap {
        white-space: nowrap !important;
      }
      .switch-container {
        display: inline-flex;
        align-items: center;
        margin-right: 10px;
      }
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        margin: 0 8px;
      }
      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #cbd5e1;
        transition: 0.3s ease;
        border-radius: 24px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: white;
        transition: 0.3s ease;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
      input:checked + .slider {
        background: #2563eb;
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }
      .switch-label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
      }
      .dark .slider {
        background: #475569;
      }
      .dark input:checked + .slider {
        background: #3b82f6;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      const existingStyle = document.getElementById('csv-viewer-styles');
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  // リサイズイベントリスナーを設定
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (resizingColumn) {
        e.preventDefault();
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX); // 最小幅を50pxに設定

        setColumnWidths(prev => ({
          ...prev,
          [resizingColumn]: newWidth
        }));

        // テーブル全体にリサイズ中のクラスを追加
        if (tableRef.current) {
          tableRef.current.classList.add('resizing');
        }
      }
    };

    const handleMouseUp = () => {
      if (resizingColumn) {
        // リサイズが完了したら状態をリセット
        setResizingColumn(null);
        setStartX(0);
        setStartWidth(0);

        // テーブルからリサイズ中のクラスを削除
        if (tableRef.current) {
          tableRef.current.classList.remove('resizing');
        }

        // 列幅の設定を保存
        saveColumnWidths(columnWidths);
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // クリーンアップ関数
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingColumn, startX, startWidth, columnWidths]);

  // ツールチップ表示のためのマウスホバー管理を修正
  const handleCellMouseEnter = (e, content) => {
    if (!content) return;

    // ホバー開始時にすぐツールチップを表示する（タイマーを使わない）
    clearTimeout(hoverTimer);
    setHoveredCell(e.target);

    const newTimer = setTimeout(() => {
      const rect = e.target.getBoundingClientRect();
      setTooltipContent(content);
      setTooltipPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
      setShowTooltip(true);
    }, 2000); // 2秒後にツールチップ表示

    setHoverTimer(newTimer);
  };

  const handleCellMouseLeave = () => {
    clearTimeout(hoverTimer);
    setHoverTimer(null);
    setShowTooltip(false);
  };

  // 列のリサイズを開始する関数
  const handleMouseDown = (e, header) => {
    e.preventDefault();
    const headerCell = e.target.closest('th');
    if (headerCell) {
      const currentWidth = headerCell.offsetWidth;
      setResizingColumn(header);
      setStartX(e.clientX);
      setStartWidth(currentWidth);
    }
  };

  // ファイルバリデーション
  const validateFile = (file) => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const LARGE_FILE_WARNING_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const ALLOWED_EXTENSIONS = ['.csv'];

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `ファイルサイズが大きすぎます（最大: 50MB）。現在のサイズ: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    // ファイルサイズが0の場合
    if (file.size === 0) {
      return {
        valid: false,
        error: 'ファイルが空です。データが含まれているCSVファイルを選択してください。'
      };
    }

    // ファイル拡張子とMIMEタイプのチェック
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const hasValidType = ALLOWED_TYPES.includes(file.type);

    if (!hasValidExtension && !hasValidType) {
      return {
        valid: false,
        error: `CSVファイル（.csv）を選択してください。選択されたファイルタイプ: ${file.type || '不明'}`
      };
    }

    // 大きいファイルの警告
    if (file.size > LARGE_FILE_WARNING_SIZE) {
      return {
        valid: true,
        warning: `大きなファイル（${(file.size / 1024 / 1024).toFixed(2)}MB）です。処理に時間がかかる場合があります。`
      };
    }

    return { valid: true };
  };

  // ファイルアップロードハンドラー
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      if (validation.warning) {
        console.warn(validation.warning);
        setProcessingStatus(validation.warning);
      }

      setFileName(file.name);
      parseCSVFile(file);
    }
  };

  // CSVファイルの解析（エンコーディングフォールバック付き）
  const parseCSVFile = (file, encoding = 'UTF-8') => {
    setLoading(true);
    setProcessingStatus(`ファイル "${file.name}" を読み込み中... (エンコーディング: ${encoding})`);
    setError(null);

    // FileReaderを使用してファイルを読み込む
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvText = e.target.result;

      // 空のファイルチェック
      if (!csvText || csvText.trim().length === 0) {
        setError('ファイルにデータが含まれていません。CSVデータを含むファイルを選択してください。');
        setLoading(false);
        return;
      }

      // PapaParseでCSVを解析
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        preview: 5000, // パフォーマンスのために最初の5000行に制限
        dynamicTyping: false, // すべて文字列として扱う
        complete: (results) => {
          // 解析エラーチェック
          if (results.errors && results.errors.length > 0) {
            const parsingWarnings = results.errors.filter(err => err.type === 'FieldMismatch' || err.type === 'Quotes');

            if (parsingWarnings.length > 0) {
              console.warn('CSV解析時に警告がありました:', results.errors);
              setProcessingStatus(`警告: CSVファイルに${results.errors.length}個の軽微な問題がありましたが、処理を続行します。`);
            }
          }

          // データが存在するかチェック
          if (!results.data || results.data.length === 0) {
            setError('CSVファイルにデータ行が見つかりません。ヘッダー行のみのファイルの可能性があります。');
            setLoading(false);
            return;
          }

          // ヘッダーチェック
          if (!results.meta.fields || results.meta.fields.length === 0) {
            setError('CSVファイルのヘッダー（列名）が見つかりません。');
            setLoading(false);
            return;
          }

          processCSVData(results, file.name);
        },
        error: (error) => {
          setError(`CSV解析エラー: ${error.message}。ファイルが正しいCSV形式であることを確認してください。`);
          setLoading(false);
        }
      });
    };

    reader.onerror = () => {
      // UTF-8で失敗した場合、Shift-JIS（または他のエンコーディング）で再試行
      if (encoding === 'UTF-8') {
        console.warn('UTF-8での読み込みに失敗しました。Shift-JISで再試行します。');
        setProcessingStatus('UTF-8での読み込みに失敗しました。別のエンコーディングで再試行中...');
        parseCSVFile(file, 'Shift-JIS');
      } else {
        setError(`ファイルの読み込みに失敗しました。ファイルが破損していないか、アクセス権限があるか確認してください。`);
        setLoading(false);
        console.error('FileReader error with encoding:', encoding);
      }
    };

    // 指定されたエンコーディングでファイルを読み込む
    reader.readAsText(file, encoding);
  };

  // CSVデータの処理
  const processCSVData = useCallback((results, currentFileName) => {
    setProcessingStatus('データを処理中...');

    try {
      // 総行数を記録
      setTotalRows(results.data.length);

      // ヘッダー名を取得
      const headers = results.meta.fields || [];

      // 保存された列設定を読み込む
      const savedColumns = loadColumnSettings(currentFileName);

      // 保存された設定があれば使用、なければデフォルト（最初の10列）
      const defaultColumns = savedColumns || headers.slice(0, 10);

      // 保存されたカラム順序を読み込む
      const savedOrder = loadColumnOrder(currentFileName);
      const initialOrder = savedOrder || [...headers];

      // 保存されたカラム幅を読み込む
      const savedWidths = loadColumnWidths(currentFileName);
      setColumnWidths(savedWidths || {});

      setHeaders(headers);
      setSelectedColumns(defaultColumns);
      setColumnOrder(initialOrder);
      setData(results.data);
      setFilteredData(results.data);
      setCurrentPage(1);
      setSortConfig({ key: null, direction: 'ascending' });
      setLoading(false);
      setProcessingStatus('');
    } catch (e) {
      setError(`データの処理中にエラーが発生しました: ${e.message}`);
      setLoading(false);
    }
  }, [loadColumnSettings, loadColumnOrder, loadColumnWidths]);

  // ソート関数
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // ソート状態に基づいてデータをソート
  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      // 数値の場合は数値としてソート
      if (!isNaN(a[sortConfig.key]) && !isNaN(b[sortConfig.key])) {
        return sortConfig.direction === 'ascending'
          ? Number(a[sortConfig.key]) - Number(b[sortConfig.key])
          : Number(b[sortConfig.key]) - Number(a[sortConfig.key]);
      }

      // 文字列の場合
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  // 検索機能
  useEffect(() => {
    if (data.length === 0) return;

    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(row => {
        if (searchColumn === 'all') {
          // すべての列を検索
          return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          // 特定の列のみ検索
          return String(row[searchColumn] || '').toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
      setFilteredData(filtered);
      setCurrentPage(1); // 検索結果の1ページ目に移動
    }
  }, [searchTerm, searchColumn, data]);

  // 列の表示/非表示を切り替える
  const toggleColumn = (header) => {
    const newColumns = selectedColumns.includes(header)
      ? selectedColumns.filter(col => col !== header)
      : [...selectedColumns, header];

    setSelectedColumns(newColumns);
    saveColumnSettings(newColumns); // 設定を保存
  };

  // すべての列を表示/非表示
  const toggleAllColumns = (show) => {
    const newColumns = show ? [...headers] : [];
    setSelectedColumns(newColumns);
    saveColumnSettings(newColumns); // 設定を保存
  };

  // ドラッグ関連の状態と処理
  const [draggedColumn, setDraggedColumn] = useState(null);

  // ドラッグ開始時の処理
  const handleDragStart = (e, header, index) => {
    setDraggedColumn(header);
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    // ドラッグ中のゴースト画像を設定（オプション）
    const ghostElement = document.createElement('div');
    ghostElement.textContent = header;
    ghostElement.className = 'bg-blue-100 px-4 py-2 rounded opacity-70';
    document.body.appendChild(ghostElement);
    e.dataTransfer.setDragImage(ghostElement, 0, 0);
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  // ドラッグ中のハンドラー
  const handleDragOver = (e, header) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // ドラッグ中のスタイル変更のためのクラス操作
    const headerElements = document.querySelectorAll('th[data-draggable="true"]');
    headerElements.forEach(el => {
      if (el.getAttribute('data-header') === header) {
        el.classList.add('bg-blue-100');
      }
    });
  };

  // ドラッグ離脱時の処理
  const handleDragLeave = (e, header) => {
    const headerElements = document.querySelectorAll('th[data-draggable="true"]');
    headerElements.forEach(el => {
      if (el.getAttribute('data-header') === header) {
        el.classList.remove('bg-blue-100');
      }
    });
  };

  // ドロップ時の処理
  const handleDrop = (e, targetHeader) => {
    e.preventDefault();
    const sourceIndex = columnOrder.findIndex(h => h === draggedColumn);
    const targetIndex = columnOrder.findIndex(h => h === targetHeader);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newOrder = [...columnOrder];
      const [removed] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, removed);

      setColumnOrder(newOrder);
      saveColumnOrder(newOrder); // 設定を保存
    }

    // スタイルをリセット
    const headerElements = document.querySelectorAll('th[data-draggable="true"]');
    headerElements.forEach(el => {
      el.classList.remove('bg-blue-100');
    });

    setDraggedColumn(null);
  };

  // ドラッグ終了時の処理
  const handleDragEnd = () => {
    // スタイルをリセット
    const headerElements = document.querySelectorAll('th[data-draggable="true"]');
    headerElements.forEach(el => {
      el.classList.remove('bg-blue-100');
    });

    setDraggedColumn(null);
  };

  // 表示件数の変更
  const handleRowsPerPageChange = (value) => {
    const numValue = Number(value);
    setRowsPerPage(numValue);
    setCurrentPage(1); // ページをリセット
    setShowAllRows(false);
  };

  // 全件表示の切り替え
  const toggleShowAllRows = (checked) => {
    setShowAllRows(checked);
    if (checked) {
      setRowsPerPage(filteredData.length || 1);
    } else {
      setRowsPerPage(10);
    }
    setCurrentPage(1);
  };

  // 全画面表示モードの切り替え
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // ページネーション
  const sortedData = getSortedData(filteredData);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const changePage = useCallback((page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  }, [totalPages]);

  // JSONエクスポート
  const exportJson = useCallback(() => {
    if (filteredData.length === 0) return;

    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.csv', '')}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData, fileName]);

  // CSVエクスポート
  const exportCsv = useCallback(() => {
    if (filteredData.length === 0) return;

    const csv = Papa.unparse({
      fields: headers,
      data: filteredData
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.csv', '')}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData, fileName, headers]);

  // JSONデータをクリップボードにコピー
  const copyJsonToClipboard = useCallback(() => {
    if (currentData.length === 0) return;

    const jsonString = JSON.stringify(currentData, null, 2);
    navigator.clipboard.writeText(jsonString)
      .then(() => alert('JSONデータをクリップボードにコピーしました'))
      .catch(err => console.error('コピーに失敗しました', err));
  }, [currentData]);

  // サンプルCSVデータを読み込む
  const loadSampleData = useCallback(() => {
    // サンプルCSVデータ（50件）
    const sampleCSV = `企業ID,企業名,業種,従業員数,住所,売上,設立年,代表者,資本金,上場
1,サンプル株式会社,IT,100,東京都渋谷区,10000000,2010,山田太郎,5000000,非上場
2,テスト技研,製造,50,大阪府大阪市,5000000,2005,佐藤次郎,3000000,非上場
3,フューチャー開発,不動産,30,福岡県福岡市,7500000,2015,鈴木花子,2000000,非上場
4,グローバルコンサルティング,コンサルティング,200,東京都千代田区,30000000,2000,高橋一郎,10000000,上場
5,イノベーションテクノロジー,IT,150,神奈川県横浜市,20000000,2008,伊藤誠,8000000,非上場
6,東京フードサービス,飲食,80,東京都新宿区,12000000,2012,中村健太,4000000,非上場
7,デジタルマーケティング,広告,45,東京都港区,8500000,2016,小林美咲,3500000,非上場
8,関西物流,物流,120,大阪府堺市,15000000,2003,田中正雄,6000000,非上場
9,北海道農産,農業,25,北海道札幌市,4500000,2018,木村大地,1500000,非上場
10,九州エナジー,エネルギー,90,福岡県北九州市,25000000,2007,松本直人,12000000,上場
11,東北メディカル,医療,200,宮城県仙台市,35000000,2001,井上智子,15000000,上場
12,中部オートモーティブ,自動車,350,愛知県名古屋市,50000000,1998,渡辺修一,20000000,上場
13,関東建設,建設,180,埼玉県さいたま市,28000000,2004,加藤勇太,9000000,非上場
14,西日本通信,通信,95,広島県広島市,18000000,2009,山本陽子,7000000,非上場
15,四国観光,旅行,40,香川県高松市,6000000,2014,吉田康平,2500000,非上場
16,沖縄リゾート,ホテル,150,沖縄県那覇市,22000000,2006,佐々木真理,8500000,非上場
17,首都圏不動産,不動産,65,東京都中央区,40000000,2002,斎藤健,11000000,上場
18,北陸精密工業,製造,220,石川県金沢市,32000000,1995,西村正明,13000000,上場
19,南九州食品,食品,75,熊本県熊本市,9500000,2011,森田幸子,4500000,非上場
20,東海運輸,運輸,130,静岡県静岡市,17000000,2000,清水太一,7500000,非上場
21,北信越IT,IT,55,新潟県新潟市,7000000,2017,原田真一,3000000,非上場
22,中国商事,商社,85,岡山県岡山市,14000000,2008,藤田美穂,5500000,非上場
23,近畿製薬,製薬,280,大阪府吹田市,45000000,1990,村上誠,18000000,上場
24,関西電機,電機,190,兵庫県神戸市,38000000,1997,中島裕介,14000000,上場
25,東京アパレル,アパレル,60,東京都目黒区,11000000,2013,岡田由美,4000000,非上場
26,名古屋機械,機械,240,愛知県豊田市,42000000,1993,長谷川博,16000000,上場
27,横浜海運,海運,100,神奈川県横浜市,20000000,2005,池田隆,8000000,非上場
28,大阪金属,金属,160,大阪府東大阪市,26000000,1999,石井正和,10000000,非上場
29,札幌ソフトウェア,IT,70,北海道札幌市,9000000,2015,高木健一,3500000,非上場
30,福岡商会,卸売,110,福岡県福岡市,19000000,2002,山下美紀,6500000,非上場
31,仙台エレクトロニクス,電子部品,140,宮城県仙台市,24000000,2006,小川達也,9500000,非上場
32,京都伝統工芸,工芸,35,京都府京都市,5500000,2010,前田雅彦,2000000,非上場
33,神戸ファッション,アパレル,50,兵庫県神戸市,8000000,2014,川上真由,3000000,非上場
34,広島重工業,重工業,300,広島県呉市,55000000,1985,藤本勝,22000000,上場
35,千葉バイオテック,バイオ,80,千葉県千葉市,12500000,2012,中田愛,5000000,非上場
36,茨城農機,農業機械,95,茨城県つくば市,16000000,2004,久保田剛,6000000,非上場
37,栃木プラスチック,化学,70,栃木県宇都宮市,10500000,2009,小島康子,4000000,非上場
38,群馬自動車部品,自動車部品,180,群馬県太田市,30000000,1996,野口秀樹,12000000,上場
39,長野精密機器,精密機器,120,長野県松本市,22000000,2001,宮崎直美,8500000,非上場
40,山梨ワイナリー,飲料,45,山梨県甲府市,7500000,2008,河野浩二,3000000,非上場
41,静岡茶業,食品,55,静岡県静岡市,9500000,2007,大野美香,3500000,非上場
42,岐阜セラミック,窯業,85,岐阜県多治見市,14500000,2003,松井健太郎,5500000,非上場
43,三重石油化学,化学,200,三重県四日市市,36000000,1992,福田正人,15000000,上場
44,滋賀環境テック,環境,60,滋賀県大津市,10000000,2016,坂本裕子,4000000,非上場
45,奈良観光開発,観光,40,奈良県奈良市,6500000,2011,上田誠一,2500000,非上場
46,和歌山水産,水産,75,和歌山県和歌山市,11500000,2005,杉本和也,4500000,非上場
47,鳥取農園,農業,30,鳥取県鳥取市,5000000,2018,橋本恵子,1800000,非上場
48,島根IT,IT,40,島根県松江市,6000000,2017,内田浩,2200000,非上場
49,山口化学工業,化学,150,山口県周南市,27000000,1998,村田正義,11000000,非上場
50,徳島製紙,製紙,90,徳島県徳島市,15500000,2000,青木由紀,6500000,非上場`;

    // サンプルデータを解析
    Papa.parse(sampleCSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileName('sample_data.csv');
        processCSVData(results, 'sample_data.csv');
      }
    });
  }, [processCSVData]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + O で ファイル選択
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }

      // Ctrl/Cmd + F で検索フォーカス
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="検索..."]');
        searchInput?.focus();
      }

      // Ctrl/Cmd + E でJSON エクスポート
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && data.length > 0) {
        e.preventDefault();
        exportJson();
      }

      // Ctrl/Cmd + S でCSV エクスポート
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && data.length > 0) {
        e.preventDefault();
        exportCsv();
      }

      // 矢印キーでページネーション (データがロードされている時のみ)
      if (data.length > 0 && viewMode === 'table') {
        const sortedDataLength = getSortedData(filteredData).length;
        const maxPages = Math.ceil(sortedDataLength / rowsPerPage);

        if (e.key === 'ArrowLeft' && currentPage > 1 && !e.target.matches('input, select, textarea')) {
          changePage(currentPage - 1);
        }
        if (e.key === 'ArrowRight' && currentPage < maxPages && !e.target.matches('input, select, textarea')) {
          changePage(currentPage + 1);
        }
      }

      // Escapeキーでエラーをクリア
      if (e.key === 'Escape' && error) {
        setError(null);
      }

      // Ctrl/Cmd + K でサンプルデータ
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        loadSampleData();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [data, error, currentPage, rowsPerPage, filteredData, viewMode, exportJson, exportCsv, changePage, loadSampleData, getSortedData]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* コンパクトヘッダーバー - Excel風 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">
              CSV Viewer
            </h1>
            {fileName && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                - {fileName}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isHeaderCollapsed ? "ツールバーを展開" : "ツールバーを折りたたむ"}
          >
            <svg className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform ${isHeaderCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-hidden flex flex-col p-2 sm:p-3">

      {/* ファイルアップロード - 折りたたみ可能なコンパクトセクション */}
      {!isHeaderCollapsed && (
        <div className={`flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl shadow-md mb-2 transition-all duration-300 ${data.length > 0 ? 'p-3' : 'p-4'}`}>
          {data.length === 0 ? (
            <div
              className={`p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isDragActive) setIsDragActive(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragActive(false);

                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  const validation = validateFile(file);

                  if (!validation.valid) {
                    setError(validation.error);
                    setLoading(false);
                    return;
                  }

                  if (validation.warning) {
                    console.warn(validation.warning);
                    setProcessingStatus(validation.warning);
                  }

                  setFileName(file.name);
                  parseCSVFile(file);
                } else {
                  setError('ファイルが選択されていません');
                }
              }}
            >
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                  aria-label="CSVファイルを選択"
                  id="csv-file-input"
                />

                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">ファイルをアップロード</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                  ドラッグ＆ドロップ、またはクリックして選択
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 text-sm"
                  >
                    CSVファイルを選択
                  </button>
                  <button
                    onClick={loadSampleData}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 text-sm"
                  >
                    サンプルデータを表示
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                aria-label="CSVファイルを選択"
                id="csv-file-input"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transform transition-all duration-200 hover:scale-105 text-xs flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                ファイル選択
              </button>
              <button
                onClick={loadSampleData}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transform transition-all duration-200 hover:scale-105 text-xs"
              >
                サンプルデータ
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {totalRows.toLocaleString()}件
                {searchTerm && ` (検索結果: ${filteredData.length.toLocaleString()}件)`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 読み込み中表示 - コンパクト */}
      {loading && (
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute top-0 left-0 w-full h-full border-3 border-blue-200 dark:border-blue-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-3 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{processingStatus}</p>
          </div>
        </div>
      )}

      {/* エラー表示 - コンパクト */}
      {error && (
        <div
          className="flex-shrink-0 bg-red-50 dark:bg-red-900/30 rounded-lg p-3 mb-2 border-l-4 border-red-500"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
              aria-label="エラーメッセージを閉じる"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* データが読み込まれている場合のみ表示 */}
      {!loading && data.length > 0 && (
        <>
          {/* コントロールパネル - コンパクトなツールバー */}
          {!isHeaderCollapsed && (
            <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 mb-2">
              <div className="flex flex-wrap gap-2 items-center">
                {/* 検索 */}
                <div className="flex-grow max-w-xs">
                  <div className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <select
                      value={searchColumn}
                      onChange={(e) => setSearchColumn(e.target.value)}
                      className="px-2 py-1.5 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">全列</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 表示モード切り替え */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      viewMode === 'table'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    テーブル
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      viewMode === 'json'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                {/* 表示件数 */}
                {viewMode === 'table' && (
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 text-xs"
                    disabled={showAllRows}
                  >
                    {rowsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}件</option>
                    ))}
                  </select>
                )}

                {/* 全件表示チェックボックス */}
                {viewMode === 'table' && (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAllRows}
                      onChange={(e) => toggleShowAllRows(e.target.checked)}
                      className="w-3 h-3 text-blue-600 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300">全件</span>
                  </label>
                )}

                {/* エクスポートボタン */}
                <button
                  onClick={exportJson}
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                  title="JSON保存"
                >
                  JSON
                </button>
                <button
                  onClick={exportCsv}
                  className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                  title="CSV保存"
                >
                  CSV
                </button>

                {viewMode === 'json' && (
                  <button
                    onClick={copyJsonToClipboard}
                    className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    コピー
                  </button>
                )}

                {/* テーブル専用ボタン */}
                {viewMode === 'table' && (
                  <>
                    <button
                      onClick={toggleFullScreen}
                      className="px-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                      title={isFullScreen ? '解除' : 'フル画面'}
                    >
                      {isFullScreen ? '解除' : '全画面'}
                    </button>

                    {/* 列設定 */}
                    <div className="relative">
                      <button
                        className="px-2 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md transition-all"
                        onClick={() => setIsColumnSelectorOpen(prev => !prev)}
                      >
                        列設定
                      </button>
                      {isColumnSelectorOpen && (
                        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-3 z-30 max-h-60 overflow-y-auto w-56">
                          <div className="flex justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">
                            <button
                              className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all"
                              onClick={() => toggleAllColumns(true)}
                            >
                              全表示
                            </button>
                            <button
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                              onClick={() => toggleAllColumns(false)}
                            >
                              全非表示
                            </button>
                          </div>
                          <div className="space-y-1">
                            {headers.map(header => (
                              <label key={header} className="flex items-center p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={selectedColumns.includes(header)}
                                  onChange={() => toggleColumn(header)}
                                  className="mr-2 w-3 h-3 text-blue-600 rounded"
                                />
                                <span className="text-gray-700 dark:text-gray-300 truncate">{header}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={resetColumnWidths}
                      className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      title="列幅リセット"
                    >
                      リセット
                    </button>

                    {/* セル表示モード */}
                    <select
                      value={cellDisplayMode}
                      onChange={(e) => setCellDisplayMode(e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 text-xs"
                    >
                      <option value="singleline">1行</option>
                      <option value="ellipsis">省略</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          )}

          {/* テーブル表示 - Excel風フルハイト */}
          {viewMode === 'table' && (
            <>
              <div className={`${isFullScreen ?
                'fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 p-2 flex flex-col' :
                'flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col min-h-0'}`}>
                {isFullScreen && (
                  <div className="flex-shrink-0 flex justify-end mb-2">
                    <button
                      onClick={toggleFullScreen}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium shadow-md hover:shadow-lg transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      閉じる
                    </button>
                  </div>
                )}
                <div className="flex-1 overflow-auto min-h-0">
                <div className="table-container">
                  <table className="min-w-full bg-white dark:bg-gray-800" ref={tableRef}>
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-blue-600">
                        <th className={`py-3 px-4 border-b border-blue-500 sticky left-0 bg-blue-600 z-30 text-white font-semibold ${headerWrapMode ? 'header-wrap minw-' : 'header-nowrap'}`}>No.</th>
                        {columnOrder
                          .filter(header => selectedColumns.includes(header))
                          .map((header, index) => (
                            <th
                              key={header}
                              className={`py-3 px-4 border-b border-blue-500 text-left min-w-24 cursor-pointer hover:bg-blue-700 relative text-white font-semibold transition-colors ${headerWrapMode ? 'header-wrap' : 'header-nowrap'}`}
                              data-draggable="true"
                              data-header={header}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, header, index)}
                              onDragOver={(e) => handleDragOver(e, header)}
                              onDragLeave={(e) => handleDragLeave(e, header)}
                              onDrop={(e) => handleDrop(e, header)}
                              onDragEnd={handleDragEnd}
                              style={{
                                width: columnWidths[header] ? `${columnWidths[header]}px` : 'auto',
                                paddingRight: '16px' // ハンドル用の余白を確保
                              }}
                            >
                              <div className="flex items-center group relative">
                                <div
                                  className="mr-2 text-white cursor-move px-1 rounded hover:bg-white hover:bg-opacity-20 inline-flex items-center justify-center transition-colors"
                                  title="ドラッグして列の順序を変更"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6"></line>
                                    <line x1="8" y1="12" x2="21" y2="12"></line>
                                    <line x1="8" y1="18" x2="21" y2="18"></line>
                                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                  </svg>
                                </div>
                                <div onClick={() => requestSort(header)} className="flex-grow">
                                  {header}
                                  {sortConfig.key === header && (
                                    <span className="ml-1">
                                      {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                    </span>
                                  )}
                                </div>
                                {/* 列幅調整ハンドル - 常に表示 */}
                                <div
                                  className="column-resize-handle"
                                  onMouseDown={(e) => handleMouseDown(e, header)}
                                  title="ドラッグして列幅を調整"
                                >
                                  <div className="h-full flex items-center justify-center">
                                    <div className="w-0.5 h-6 bg-white bg-opacity-30"></div>
                                  </div>
                                </div>
                              </div>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((row, rowIndex) => (
                          <tr key={rowIndex} className={`transition-colors hover:bg-blue-50 dark:hover:bg-gray-700 ${rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-750'}`}>
                            <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 sticky left-0 bg-inherit z-10 font-medium text-gray-700 dark:text-gray-300">
                              {(currentPage - 1) * rowsPerPage + rowIndex + 1}
                            </td>
                            {columnOrder
                              .filter(header => selectedColumns.includes(header))
                              .map((header) => {
                                const content = String(row[header] || '');
                                let displayContent = content;

                                return (
                                  <td
                                    key={`${rowIndex}-${header}`}
                                    className={`py-3 px-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ${cellDisplayMode === 'singleline'
                                      ? 'cell-singleline'
                                      : cellDisplayMode === 'ellipsis'
                                        ? 'cell-ellipsis'
                                        : ''
                                      }`}
                                    style={{
                                      width: columnWidths[header] ? `${columnWidths[header]}px` : 'auto',
                                      maxWidth: columnWidths[header] ? `${columnWidths[header]}px` : '250px'
                                    }}
                                    onMouseEnter={(e) => handleCellMouseEnter(e, content)}
                                    onMouseLeave={handleCellMouseLeave}
                                  >
                                    {displayContent}
                                  </td>
                                );
                              })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={selectedColumns.length + 1} className="py-4 text-center text-gray-500 dark:text-gray-400">
                            該当するデータがありません
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                </div>

                {/* ツールチップ */}
                {showTooltip && (
                  <div className="cell-tooltip" style={{
                    top: `${tooltipPosition.y}px`,
                    left: `${tooltipPosition.x}px`,
                    transform: 'translate(-50%, -100%)'
                  }}>
                    {tooltipContent}
                  </div>
                )}

                {/* ページネーション - コンパクト */}
                <div className={`flex-shrink-0 ${isFullScreen ?
                  'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50' : 'border-t border-gray-200 dark:border-gray-700 p-2'}`}>
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {filteredData.length}件中 {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}-{Math.min(currentPage * rowsPerPage, filteredData.length)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changePage(1)}
                        disabled={currentPage === 1 || totalPages === 0}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-300"
                      >
                        &laquo;
                      </button>
                      <button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1 || totalPages === 0}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-300"
                      >
                        &lsaquo;
                      </button>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                        {currentPage}/{totalPages || 1}
                      </span>
                      <button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-300"
                      >
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => changePage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-700 dark:text-gray-300"
                      >
                        &raquo;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* JSON表示 - フルハイト */}
          {viewMode === 'json' && (
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col min-h-0">
              <div className="flex-shrink-0 bg-gray-700 dark:bg-gray-900 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-white text-sm font-medium">JSON Output</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="flex-1 bg-gray-900 p-4 overflow-auto min-h-0">
                <pre className="whitespace-pre-wrap text-xs font-mono text-emerald-400">
                  {JSON.stringify(currentData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {/* ヘルプ情報 - コンパクト */}
      {!loading && data.length === 0 && !error && (
        <div className="flex-1 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400">使い方</h2>
            </div>

            <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
              CSVファイルをアップロードするか、サンプルデータで機能をお試しください。
            </p>

            {/* 注意事項 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <strong>注意:</strong> CSVファイルはUTF-8エンコーディング推奨。最大ファイルサイズ: 50MB
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {[
                'テーブル/JSON表示',
                '検索・フィルタ',
                '列の選択・並替',
                'ソート機能',
                'CSV/JSON出力',
                '全画面表示',
                '列幅調整',
                'ツールチップ'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-1 p-2 bg-blue-50 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                  <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">キーボードショートカット</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { keys: 'Ctrl+O', action: 'ファイルを開く' },
                  { keys: 'Ctrl+F', action: '検索' },
                  { keys: 'Ctrl+E', action: 'JSON出力' },
                  { keys: 'Ctrl+S', action: 'CSV出力' },
                  { keys: 'Ctrl+K', action: 'サンプル表示' },
                  { keys: '←→', action: 'ページ移動' },
                  { keys: 'Esc', action: 'エラーを閉じる' }
                ].map((shortcut, index) => (
                  <div key={index} className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs font-mono">{shortcut.keys}</kbd>
                    <span>{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CSVViewerApp;

import React, { useState, useEffect, useRef } from 'react';
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
        background: linear-gradient(to right, rgb(59, 130, 246), rgb(147, 51, 234));
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
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1));
        border-right: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.2s ease;
      }
      .column-resize-handle:hover, .column-resize-handle:active {
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3));
        border-right: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 14px;
        border-radius: 12px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        font-size: 14px;
        line-height: 1.5;
        backdrop-filter: blur(10px);
      }
      .cell-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -6px;
        border-width: 6px;
        border-style: solid;
        border-color: #764ba2 transparent transparent transparent;
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
        background: linear-gradient(to right, #cbd5e1, #94a3b8);
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
        background: linear-gradient(to right, rgb(59, 130, 246), rgb(147, 51, 234));
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }
      .switch-label {
        font-size: 12px;
        color: #666;
        font-weight: 500;
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

    // ファイル拡張子チェック
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        valid: false,
        error: `CSVファイル（.csv）を選択してください。選択されたファイル: ${file.name}`
      };
    }

    // 大きいファイルの警告
    if (file.size > 10 * 1024 * 1024) { // 10MB以上
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

  // CSVファイルの解析
  const parseCSVFile = (file) => {
    setLoading(true);
    setProcessingStatus(`ファイル "${file.name}" を読み込み中...`);
    setError(null);

    // FileReaderを使用してファイルを読み込む
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
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
          encoding: 'UTF-8', // UTF-8で固定
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
      } catch (err) {
        setError(`ファイル処理中に予期しないエラーが発生しました: ${err.message}`);
        setLoading(false);
      }
    };

    reader.onerror = (error) => {
      setError(`ファイルの読み込みに失敗しました。ファイルが破損していないか、アクセス権限があるか確認してください。`);
      setLoading(false);
      console.error('FileReader error:', error);
    };

    // UTF-8で読み込み、失敗した場合はShift-JISで再試行
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (err) {
      setError(`ファイルの読み込みを開始できませんでした: ${err.message}`);
      setLoading(false);
    }
  };

  // CSVデータの処理
  const processCSVData = (results, currentFileName) => {
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
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, currentPage, rowsPerPage, filteredData, viewMode]);

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

  const changePage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // JSONエクスポート
  const exportJson = () => {
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
  };

  // CSVエクスポート
  const exportCsv = () => {
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
  };

  // JSONデータをクリップボードにコピー
  const copyJsonToClipboard = () => {
    if (currentData.length === 0) return;

    const jsonString = JSON.stringify(currentData, null, 2);
    navigator.clipboard.writeText(jsonString)
      .then(() => alert('JSONデータをクリップボードにコピーしました'))
      .catch(err => console.error('コピーに失敗しました', err));
  };

  // サンプルCSVデータを読み込む
  const loadSampleData = () => {
    // サンプルCSVデータ（簡易版）
    const sampleCSV = `企業ID,企業名,業種,従業員数,住所,売上,設立年,代表者,資本金,上場
1,サンプル株式会社,IT,100,東京都渋谷区,10000000,2010,山田太郎,5000000,非上場
2,テスト技研,製造,50,大阪府大阪市,5000000,2005,佐藤次郎,3000000,非上場
3,フューチャー開発,不動産,30,福岡県福岡市,7500000,2015,鈴木花子,2000000,非上場
4,グローバルコンサルティング,コンサルティング,200,東京都千代田区,30000000,2000,高橋一郎,10000000,上場
5,イノベーションテクノロジー,IT,150,神奈川県横浜市,20000000,2008,伊藤誠,8000000,非上場`;

    // サンプルデータを解析
    Papa.parse(sampleCSV, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileName('sample_data.csv');
        processCSVData(results, 'sample_data.csv');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full p-6 max-w-7xl mx-auto">
        {/* ヘッダーセクション - モダンなデザイン */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CSV Viewer
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            CSVファイルを美しく表示・分析。データを視覚化し、検索、エクスポートが簡単にできます。
          </p>
        </div>

      {/* ファイルアップロード - モダンなカードデザイン */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
        <div
          className={`p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${
            isDragActive
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg'
              : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:bg-blue-50'
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

            {/* アップロードアイコン */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg transform transition-transform hover:scale-110">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-gray-800">ファイルをアップロード</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              ファイルをドラッグ＆ドロップ、またはクリックして選択
            </p>

            <button
              onClick={() => fileInputRef.current.click()}
              className="mb-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              CSVファイルを選択
            </button>

            <div className="flex items-center my-4">
              <div className="h-px bg-gray-300 w-16"></div>
              <p className="text-sm text-gray-400 mx-4">または</p>
              <div className="h-px bg-gray-300 w-16"></div>
            </div>

            <button
              onClick={loadSampleData}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              サンプルデータを表示
            </button>

            {fileName && (
              <div className="mt-6 px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {fileName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 読み込み中表示 - モダンなアニメーション */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-8">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">{processingStatus}</p>
            <div className="w-80 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 - モダンなデザイン */}
      {error && (
        <div
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-red-500"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">エラーが発生しました</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-400 hover:text-red-600 transition-colors"
              aria-label="エラーメッセージを閉じる"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* データが読み込まれている場合のみ表示 */}
      {!loading && data.length > 0 && (
        <>
          {/* コントロールパネル - モダンなデザイン */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* 検索 */}
              <div className="flex-grow max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-3 py-2.5 border border-gray-300 rounded-l-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="px-4 py-2.5 border border-l-0 border-gray-300 rounded-r-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">すべての列</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>

              {/* 表示モード切り替え */}
              <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  テーブル
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                    viewMode === 'json'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  JSON
                </button>
              </div>

              {/* データエクスポート */}
              <button
                onClick={exportJson}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON保存
              </button>

              <button
                onClick={exportCsv}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV保存
              </button>

              {viewMode === 'json' && (
                <button
                  onClick={copyJsonToClipboard}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  JSONコピー
                </button>
              )}

              {/* 全画面表示ボタン（テーブルモードのみ） */}
              {viewMode === 'table' && (
                <button
                  onClick={toggleFullScreen}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {isFullScreen ? '解除' : 'フル画面'}
                </button>
              )}

              {/* 列表示設定（テーブルモードのみ） */}
              {viewMode === 'table' && (
                <div className="relative ml-auto">
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center"
                    onClick={() => setIsColumnSelectorOpen(prev => !prev)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    列の設定
                  </button>
                  {isColumnSelectorOpen && (
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-30 max-h-80 overflow-y-auto w-72">
                    <div className="flex justify-between mb-3 pb-3 border-b border-gray-200">
                      <button
                        className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                        onClick={() => toggleAllColumns(true)}
                      >
                        すべて表示
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                        onClick={() => toggleAllColumns(false)}
                      >
                        すべて非表示
                      </button>
                    </div>
                    <div className="space-y-2">
                      {headers.map(header => (
                        <label key={header} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            id={`col-${header}`}
                            checked={selectedColumns.includes(header)}
                            onChange={() => toggleColumn(header)}
                            className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{header}</span>
                        </label>
                      ))}
                    </div>
                    </div>
                  )}
                </div>
              )}

              {/* 列幅リセットボタン */}
              {viewMode === 'table' && (
                <button
                  onClick={resetColumnWidths}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                  title="列幅をリセット"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  リセット
                </button>
              )}
            </div>
          </div>

          {/* 表示オプション設定 */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">表示件数:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    disabled={showAllRows}
                  >
                    {rowsPerPageOptions.map(option => (
                      <option key={option} value={option}>{option}件</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showAllRows}
                    onChange={(e) => toggleShowAllRows(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">全件表示</span>
                </label>

                {/* セル表示モードの設定 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">セル表示:</span>
                  <select
                    value={cellDisplayMode}
                    onChange={(e) => setCellDisplayMode(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="singleline">1行（折り返しなし）</option>
                    <option value="ellipsis">1行（省略表示）</option>
                  </select>
                </div>

                {/* ヘッダー折り返しトグルスイッチ */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">見出し:</span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <span className="text-xs text-gray-600 px-2">改行なし</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={headerWrapMode}
                        onChange={() => setHeaderWrapMode(!headerWrapMode)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="text-xs text-gray-600 px-2">改行あり</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* データサマリー */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">総レコード数</p>
                  <p className="text-lg font-bold text-gray-800">{totalRows.toLocaleString()}行</p>
                </div>
              </div>
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">検索結果</p>
                    <p className="text-lg font-bold text-gray-800">{filteredData.length.toLocaleString()}行</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* テーブル表示 */}
          {viewMode === 'table' && (
            <>
              <div className={`${isFullScreen ?
                'fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6' :
                'bg-white rounded-2xl shadow-xl overflow-hidden'}`}>
                {isFullScreen && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={toggleFullScreen}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      閉じる
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto max-h-[70vh]">
                <div className="table-container">
                  <table className="min-w-full bg-white" ref={tableRef}>
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <th className={`py-3 px-4 border-b border-blue-400 sticky left-0 bg-gradient-to-r from-blue-500 to-purple-600 z-30 text-white font-semibold ${headerWrapMode ? 'header-wrap minw-' : 'header-nowrap'}`}>No.</th>
                        {columnOrder
                          .filter(header => selectedColumns.includes(header))
                          .map((header, index) => (
                            <th
                              key={header}
                              className={`py-3 px-4 border-b border-blue-400 text-left min-w-24 cursor-pointer hover:bg-blue-600 relative text-white font-semibold transition-colors ${headerWrapMode ? 'header-wrap' : 'header-nowrap'}`}
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
                          <tr key={rowIndex} className={`transition-colors hover:bg-blue-50 ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-3 px-4 border-b border-gray-200 sticky left-0 bg-inherit z-10 font-medium text-gray-700">
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
                                    className={`py-3 px-4 border-b border-gray-200 text-gray-700 ${cellDisplayMode === 'singleline'
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
                          <td colSpan={selectedColumns.length + 1} className="py-4 text-center">
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

                {/* ページネーション */}
                <div className={`${isFullScreen ?
                  'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-2xl' : 'mt-6'}`}>
                  <div className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          {filteredData.length}件中 {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {Math.min(currentPage * rowsPerPage, filteredData.length)} 件表示
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changePage(1)}
                        disabled={currentPage === 1 || totalPages === 0}
                        className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
                      >
                        &laquo;
                      </button>
                      <button
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1 || totalPages === 0}
                        className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
                      >
                        &lsaquo;
                      </button>

                      <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-md">
                        {currentPage} / {totalPages || 1}
                      </div>

                      <button
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
                      >
                        &rsaquo;
                      </button>
                      <button
                        onClick={() => changePage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
                      >
                        &raquo;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* JSON表示 */}
          {viewMode === 'json' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-white font-semibold">JSON Output</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap text-sm font-mono text-emerald-400">
                  {JSON.stringify(currentData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </>
      )}

      {/* ヘルプ情報 */}
      {!loading && data.length === 0 && !error && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">はじめに</h2>
          </div>

          <p className="mb-6 text-gray-700 leading-relaxed">
            このアプリはCSVファイルを簡単に表示・分析するためのツールです。
            上部の「CSVファイルを選択」ボタンからファイルをアップロードするか、
            「サンプルデータを表示」ボタンでデモデータを確認できます。
          </p>

          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            できること：
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              'CSVファイルのテーブル表示とJSON表示',
              'データの検索とフィルタリング',
              '表示する列の選択（設定は自動保存）',
              '列の並べ替え（ドラッグ＆ドロップ）',
              '列幅の調整（境界線をドラッグ）',
              'セル表示の切り替え',
              'ホバーでツールチップ表示',
              'ヘッダー折り返し設定',
              'データのソート機能',
              '表示件数の制御',
              'CSVまたはJSON形式でエクスポート',
              'JSON形式でクリップボードコピー',
              'フルスクリーン表示モード'
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-800">
                <strong>注意:</strong> CSVファイルは必ずUTF-8エンコーディングで保存してください。最大ファイルサイズ: 50MB
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              キーボードショートカット
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { keys: 'Ctrl/Cmd + O', action: 'ファイルを開く' },
                { keys: 'Ctrl/Cmd + F', action: '検索フォーカス' },
                { keys: 'Ctrl/Cmd + E', action: 'JSONエクスポート' },
                { keys: 'Ctrl/Cmd + S', action: 'CSVエクスポート' },
                { keys: 'Ctrl/Cmd + K', action: 'サンプルデータ表示' },
                { keys: '← →', action: 'ページ移動' },
                { keys: 'Esc', action: 'エラーを閉じる' }
              ].map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                    {shortcut.keys}
                  </kbd>
                  <span className="text-sm text-gray-600 ml-3">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CSVViewerApp;
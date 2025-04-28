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
      }
      .column-drag-over {
        background-color: #e0f2fe;
        border-left: 2px solid #3b82f6;
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
        max-height: 72px; /* 約3行分 */
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
        background-color: rgba(0, 0, 0, 0.05);
        border-right: 1px solid #ddd;
      }
      .column-resize-handle:hover, .column-resize-handle:active {
        background-color: rgba(59, 130, 246, 0.2);
        border-right: 1px solid #3b82f6;
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
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-size: 14px;
        line-height: 1.5;
      }
      .cell-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #333 transparent transparent transparent;
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
        width: 40px;
        height: 20px;
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
        background-color: #ccc;
        transition: .4s;
        border-radius: 20px;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + .slider {
        background-color: #2196F3;
      }
      input:checked + .slider:before {
        transform: translateX(20px);
      }
      .switch-label {
        font-size: 12px;
        color: #666;
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

  // ファイルアップロードハンドラー
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
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
      const csvText = e.target.result;

      // PapaParseでCSVを解析
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        preview: 5000, // パフォーマンスのために最初の5000行に制限
        encoding: 'UTF-8', // UTF-8で固定
        complete: (results) => {
          processCSVData(results, file.name);
        },
        error: (error) => {
          setError(`CSV解析エラー: ${error.message}`);
          setLoading(false);
        }
      });
    };

    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました');
      setLoading(false);
    };

    reader.readAsText(file, 'UTF-8');
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
    <div className="w-full p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">CSVビューアアプリ</h1>
        <p className="text-sm text-gray-600">
          CSVファイルをアップロードして、データをテーブルやJSONで表示、検索、エクスポートできます。
        </p>
      </div>

      {/* ファイルアップロード - ドラッグアンドドロップ対応 */}
      <div
        className={`mb-6 p-6 border-2 border-dashed rounded-lg ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
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
          if (files && files.length > 0 && files[0].type === 'text/csv') {
            setFileName(files[0].name);
            parseCSVFile(files[0]);
          } else {
            setError('CSVファイルをアップロードしてください');
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
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            CSVファイルを選択
          </button>

          <p className="text-sm text-gray-500 mb-2">または</p>

          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p className="text-sm text-gray-600">ファイルをドラッグ＆ドロップしてアップロード</p>
            </div>
          </div>

          <button
            onClick={loadSampleData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            サンプルデータを表示
          </button>

          {fileName && (
            <p className="mt-4 text-sm font-medium">
              現在のファイル: {fileName}
            </p>
          )}
        </div>
      </div>

      {/* 読み込み中表示 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-lg mb-2">{processingStatus}</div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {/* データが読み込まれている場合のみ表示 */}
      {!loading && data.length > 0 && (
        <>
          {/* コントロールパネル */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {/* 検索 */}
            <div className="flex flex-grow max-w-md">
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-l flex-grow"
              />
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="px-3 py-2 border border-l-0 rounded-r"
              >
                <option value="all">すべての列</option>
                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            {/* 表示モード切り替え */}
            <div className="flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-l ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                テーブル表示
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-2 rounded-r ${viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                JSON表示
              </button>
            </div>

            {/* データエクスポート */}
            <button
              onClick={exportJson}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              JSON保存
            </button>

            <button
              onClick={exportCsv}
              className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              CSV保存
            </button>

            {viewMode === 'json' && (
              <button
                onClick={copyJsonToClipboard}
                className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                JSONコピー
              </button>
            )}

            {/* 全画面表示ボタン（テーブルモードのみ） */}
            {viewMode === 'table' && (
              <button
                onClick={toggleFullScreen}
                className="px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
              >
                {isFullScreen ? 'フルスクリーン解除' : 'フルスクリーン表示'}
              </button>
            )}

            {/* 列表示設定（テーブルモードのみ） */}
            {viewMode === 'table' && (
              <div className="relative ml-auto">
                <button
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => document.getElementById('column-selector').classList.toggle('hidden')}
                >
                  列の表示設定
                </button>
                <div id="column-selector" className="hidden absolute right-0 mt-1 bg-white border rounded shadow-lg p-2 z-30 max-h-64 overflow-y-auto w-64">
                  <div className="flex justify-between mb-2 pb-2 border-b">
                    <button
                      className="text-xs px-2 py-1 bg-blue-100 rounded"
                      onClick={() => toggleAllColumns(true)}
                    >
                      すべて表示
                    </button>
                    <button
                      className="text-xs px-2 py-1 bg-gray-100 rounded"
                      onClick={() => toggleAllColumns(false)}
                    >
                      すべて非表示
                    </button>
                  </div>
                  {headers.map(header => (
                    <div key={header} className="flex items-center p-1">
                      <input
                        type="checkbox"
                        id={`col-${header}`}
                        checked={selectedColumns.includes(header)}
                        onChange={() => toggleColumn(header)}
                        className="mr-2"
                      />
                      <label htmlFor={`col-${header}`} className="text-sm truncate">{header}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 列幅リセットボタン */}
            {viewMode === 'table' && (
              <button
                onClick={resetColumnWidths}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                title="列幅をリセット"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                列幅リセット
              </button>
            )}
          </div>

          {/* 表示オプション設定 */}
          {viewMode === 'table' && (
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm mr-2">表示件数:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(e.target.value)}
                  className="px-2 py-1 border rounded"
                  disabled={showAllRows}
                >
                  {rowsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showAllRows}
                  onChange={(e) => toggleShowAllRows(e.target.checked)}
                  className="mr-2"
                />
                全件表示
              </label>

              {/* セル表示モードの設定 */}
              <div className="flex items-center ml-4">
                <span className="text-sm mr-2">セル表示:</span>
                <select
                  value={cellDisplayMode}
                  onChange={(e) => setCellDisplayMode(e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="singleline">1行（折り返しなし）</option>
                  <option value="ellipsis">1行（省略表示）</option>
                </select>
              </div>

              {/* ヘッダー折り返しトグルスイッチ */}
              <div className="switch-container">
                <span className="switch-label">見出し改行なし</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={headerWrapMode}
                    onChange={() => setHeaderWrapMode(!headerWrapMode)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="switch-label">改行あり</span>
              </div>
            </div>
          )}

          {/* データサマリー */}
          <div className="mb-4 text-sm text-gray-600">
            <p>総レコード数: {totalRows.toLocaleString()}行</p>
            {searchTerm && (
              <p>検索結果: {filteredData.length.toLocaleString()}行</p>
            )}
          </div>

          {/* テーブル表示 */}
          {viewMode === 'table' && (
            <>
              <div className={`overflow-x-auto border rounded ${isFullScreen ?
                'fixed inset-0 z-50 bg-white p-4' :
                'max-h-[70vh]'}`}>
                {isFullScreen && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={toggleFullScreen}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    >
                      ✕ 閉じる
                    </button>
                  </div>
                )}
                <div className="table-container">
                  <table className="min-w-full bg-white" ref={tableRef}>
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-gray-100">
                        <th className={`py-2 px-3 border-b sticky left-0 bg-gray-100 z-30 ${headerWrapMode ? 'header-wrap minw-' : 'header-nowrap'}`}>No.</th>
                        {columnOrder
                          .filter(header => selectedColumns.includes(header))
                          .map((header, index) => (
                            <th
                              key={header}
                              className={`py-2 px-3 border-b text-left min-w-24 cursor-pointer hover:bg-gray-200 relative ${headerWrapMode ? 'header-wrap' : 'header-nowrap'}`}
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
                                  className="mr-2 text-gray-400 cursor-move px-1 rounded hover:bg-gray-300 inline-flex items-center justify-center"
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
                                    <div className="w-0.5 h-6 bg-gray-300"></div>
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
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2 px-3 border-b sticky left-0 bg-inherit z-10">
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
                                    className={`py-2 px-3 border-b ${cellDisplayMode === 'singleline'
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
              <div className={`mt-4 flex flex-wrap justify-between items-center ${isFullScreen ?
                'fixed bottom-0 left-0 right-0 bg-white p-4 border-t z-50' : ''}`}>
                <div>
                  {filteredData.length}件中 {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} - {Math.min(currentPage * rowsPerPage, filteredData.length)} 件表示
                </div>
                <div className="flex space-x-1 mt-2 sm:mt-0">
                  <button
                    onClick={() => changePage(1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    &lsaquo;
                  </button>

                  <span className="px-3 py-1">
                    {currentPage} / {totalPages || 1}
                  </span>

                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => changePage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    &raquo;
                  </button>
                </div>
              </div>
            </>
          )}

          {/* JSON表示 */}
          {viewMode === 'json' && (
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(currentData, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}

      {/* ヘルプ情報 */}
      {!loading && data.length === 0 && !error && (
        <div className="mt-6 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">はじめに</h2>
          <p className="mb-4">
            このアプリはCSVファイルを簡単に表示・分析するためのツールです。
            上部の「CSVファイルを選択」ボタンからファイルをアップロードするか、
            「サンプルデータを表示」ボタンでデモデータを確認できます。
          </p>
          <h3 className="font-semibold mb-1">できること：</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>CSVファイルのテーブル表示とJSON表示</li>
            <li>データの検索とフィルタリング</li>
            <li>表示する列の選択（設定は自動保存されます）</li>
            <li>列の並べ替え（ドラッグ＆ドロップで順序変更）</li>
            <li>列幅の調整（境界線をドラッグして幅を変更）</li>
            <li>セル表示の切り替え（単一行または省略表示）</li>
            <li>ホバーでツールチップ表示（長文の全文表示）</li>
            <li>ヘッダー折り返し設定（長い列見出しの表示調整）</li>
            <li>データのソート（列ヘッダーをクリックしてソート）</li>
            <li>表示件数の制御（ページネーションと全件表示）</li>
            <li>CSVまたはJSON形式でのエクスポート</li>
            <li>JSON形式でのクリップボードコピー</li>
            <li>フルスクリーン表示モード</li>
          </ul>
          <p className="text-sm text-gray-600">
            注意: CSVファイルは必ずUTF-8エンコーディングで保存してください。
          </p>
        </div>
      )}
    </div>
  );
};

export default CSVViewerApp;
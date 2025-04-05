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
  
  // 新しい状態変数
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [columnOrder, setColumnOrder] = useState([]);
  const [showAllRows, setShowAllRows] = useState(false);
  
  const fileInputRef = useRef(null);
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

  // ドラッグ関連のハンドラー
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    const dragIndex = Number(e.dataTransfer.getData('text/plain'));
    const newOrder = [...columnOrder];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);
    
    setColumnOrder(newOrder);
    saveColumnOrder(newOrder); // 設定を保存
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

      {/* ファイルアップロード */}
      <div className="mb-6 p-6 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50">
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
            
            {/* 列表示設定（テーブルモードのみ） */}
            {viewMode === 'table' && (
              <div className="relative ml-auto">
                <button
                  className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => document.getElementById('column-selector').classList.toggle('hidden')}
                >
                  列の表示設定
                </button>
                <div id="column-selector" className="hidden absolute right-0 mt-1 bg-white border rounded shadow-lg p-2 z-10 max-h-64 overflow-y-auto w-64">
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
          </div>
          
          {/* 表示件数の設定 */}
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
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 border-b sticky left-0 bg-gray-100 z-10">No.</th>
                      {columnOrder
                        .filter(header => selectedColumns.includes(header))
                        .map((header, index) => (
                          <th 
                            key={header} 
                            className="py-2 px-3 border-b text-left cursor-pointer hover:bg-gray-200"
                            onClick={() => requestSort(header)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                          >
                            <div className="flex items-center">
                              <span className="mr-1 text-gray-400">≡</span>
                              {header}
                              {sortConfig.key === header && (
                                <span className="ml-1">
                                  {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                                </span>
                              )}
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
                            .map((header) => (
                              <td key={`${rowIndex}-${header}`} className="py-2 px-3 border-b">
                                {row[header] || ''}
                              </td>
                            ))}
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
              
              {/* ページネーション */}
              <div className="mt-4 flex flex-wrap justify-between items-center">
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
            <li>データのソート（列ヘッダーをクリックしてソート）</li>
            <li>表示件数の制御（ページネーションと全件表示）</li>
            <li>CSVまたはJSON形式でのエクスポート</li>
            <li>JSON形式でのクリップボードコピー</li>
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
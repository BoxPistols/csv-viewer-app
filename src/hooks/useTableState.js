import { useState, useMemo, useCallback } from 'react';

/**
 * テーブル状態管理のカスタムフック
 */
export const useTableState = (initialData = []) => {
  const [data, setData] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchColumn, setSearchColumn] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter(row => {
      if (searchColumn === 'all') {
        return Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return String(row[searchColumn] || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchColumn]);

  // ソート済みデータ
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // 数値としてソート
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return sortConfig.direction === 'ascending'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      // 文字列としてソート
      if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ページネーション
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, rowsPerPage]);

  // ソート切り替え
  const requestSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending'
        ? 'descending'
        : 'ascending'
    }));
  }, []);

  // ページ変更
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // 検索時は1ページ目に戻る
  const handleSearch = useCallback((term, column = 'all') => {
    setSearchTerm(term);
    setSearchColumn(column);
    setCurrentPage(1);
  }, []);

  // 表示件数変更
  const handleRowsPerPageChange = useCallback((rows) => {
    setRowsPerPage(Number(rows));
    setCurrentPage(1);
  }, []);

  // 列の表示/非表示切り替え
  const toggleColumn = useCallback((header) => {
    setSelectedColumns(prev =>
      prev.includes(header)
        ? prev.filter(col => col !== header)
        : [...prev, header]
    );
  }, []);

  // すべての列を表示/非表示
  const toggleAllColumns = useCallback((show, headers) => {
    setSelectedColumns(show ? [...headers] : []);
  }, []);

  // 列幅設定
  const setColumnWidth = useCallback((header, width) => {
    setColumnWidths(prev => ({ ...prev, [header]: width }));
  }, []);

  // 列幅リセット
  const resetColumnWidths = useCallback(() => {
    setColumnWidths({});
  }, []);

  // データリセット
  const reset = useCallback(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSearchColumn('all');
    setSortConfig({ key: null, direction: 'ascending' });
  }, []);

  return {
    // State
    data,
    currentPage,
    rowsPerPage,
    searchTerm,
    searchColumn,
    sortConfig,
    selectedColumns,
    columnOrder,
    columnWidths,

    // Computed
    filteredData,
    sortedData,
    currentData,
    totalPages,

    // Setters
    setData,
    setCurrentPage,
    setRowsPerPage,
    setSearchTerm,
    setSearchColumn,
    setSortConfig,
    setSelectedColumns,
    setColumnOrder,
    setColumnWidths,

    // Actions
    requestSort,
    changePage,
    handleSearch,
    handleRowsPerPageChange,
    toggleColumn,
    toggleAllColumns,
    setColumnWidth,
    resetColumnWidths,
    reset
  };
};

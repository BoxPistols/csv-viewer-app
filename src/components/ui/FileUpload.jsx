import React, { useRef } from 'react';

/**
 * ファイルアップロードコンポーネント
 */
const FileUpload = ({
  onFileSelect,
  onSampleDataLoad,
  fileName,
  isDragActive,
  setIsDragActive
}) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 transition-all duration-300 hover:shadow-2xl">
      <div
        className={`p-6 sm:p-8 md:p-10 border-2 border-dashed rounded-xl transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 scale-105 shadow-lg'
            : 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => onFileSelect(e.target.files[0])}
            ref={fileInputRef}
            className="hidden"
            aria-label="CSVファイルを選択"
            id="csv-file-input"
          />

          {/* アップロードアイコン */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg transform transition-transform hover:scale-110 active:scale-95">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100 text-center">ファイルをアップロード</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-center px-2">
            ファイルをドラッグ＆ドロップ、またはクリックして選択
          </p>

          <button
            onClick={() => fileInputRef.current.click()}
            className="mb-3 sm:mb-4 px-5 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 min-h-[44px] w-full sm:w-auto text-sm sm:text-base"
          >
            CSVファイルを選択
          </button>

          <div className="flex items-center my-3 sm:my-4 w-full max-w-xs">
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mx-3 sm:mx-4">または</p>
            <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
          </div>

          <button
            onClick={onSampleDataLoad}
            className="px-5 py-3 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl active:shadow-md transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 min-h-[44px] w-full sm:w-auto text-sm sm:text-base"
          >
            サンプルデータを表示
          </button>

          {fileName && (
            <div className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 max-w-full">
              <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center break-all">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {fileName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(FileUpload);

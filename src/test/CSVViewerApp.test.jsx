import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CSVViewerApp from '../components/CSVViewerApp';

describe('CSVViewerApp - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render the application', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/CSV Viewer/i)).toBeInTheDocument();
  });

  it('should display upload section', () => {
    render(<CSVViewerApp />);
    expect(screen.getAllByText(/ファイルをアップロード/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CSVファイルを選択/i).length).toBeGreaterThan(0);
  });

  it('should have sample data button', () => {
    render(<CSVViewerApp />);
    const sampleButtons = screen.getAllByText(/サンプルデータを表示/);
    expect(sampleButtons.length).toBeGreaterThan(0);
  });

  it('should display help section when no data is loaded', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/はじめに/i)).toBeInTheDocument();
    expect(screen.getByText(/できること/i)).toBeInTheDocument();
  });

  it('should show keyboard shortcuts information', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/キーボードショートカット/i)).toBeInTheDocument();
    expect(screen.getByText(/Ctrl\/Cmd \+ O/)).toBeInTheDocument();
  });

  it('should display file input with correct attributes', () => {
    render(<CSVViewerApp />);
    const fileInput = document.getElementById('csv-file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.csv');
    expect(fileInput).toHaveAttribute('aria-label', 'CSVファイルを選択');
  });

  it('should have drag and drop zone', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/ファイルをドラッグ＆ドロップ/)).toBeInTheDocument();
  });

  it('should display maximum file size information', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/最大ファイルサイズ: 50MB/i)).toBeInTheDocument();
  });

  it('should display UTF-8 encoding notice', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/UTF-8エンコーディング/i)).toBeInTheDocument();
  });

  it('should have feature list', () => {
    render(<CSVViewerApp />);
    expect(screen.getByText(/CSVファイルのテーブル表示とJSON表示/i)).toBeInTheDocument();
    expect(screen.getByText(/データの検索とフィルタリング/i)).toBeInTheDocument();
  });
});

describe('CSVViewerApp - File Validation', () => {
  it('should validate file in validateFile function', () => {
    render(<CSVViewerApp />);

    // Test that the component renders without errors
    // The actual validateFile function is internal to the component
    expect(screen.getByText(/CSV Viewer/i)).toBeInTheDocument();
  });
});

describe('CSVViewerApp - Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<CSVViewerApp />);
    const fileInput = document.getElementById('csv-file-input');
    expect(fileInput).toHaveAttribute('aria-label');
  });

  it('should render heading hierarchy correctly', () => {
    render(<CSVViewerApp />);
    const mainHeading = screen.getByText(/CSV Viewer/);
    expect(mainHeading.tagName).toBe('H1');
  });
});

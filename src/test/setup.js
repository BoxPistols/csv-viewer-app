import '@testing-library/jest-dom';

// Mock FileReader for tests
class FileReaderMock {
  constructor() {
    this.readAsText = vi.fn(function(file) {
      if (this.onload) {
        this.onload({ target: { result: file._content } });
      }
    });
    this.onerror = null;
    this.onload = null;
  }
}

global.FileReader = FileReaderMock;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
  configurable: true,
});

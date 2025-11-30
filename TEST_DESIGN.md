# CSV Viewer - テスト設計アーキテクチャ 🧪

このドキュメントでは、CSV Viewerアプリケーションのテスト戦略、アーキテクチャ、実装の詳細を説明します。

---

## 📋 目次

1. [テスト戦略](#テスト戦略)
2. [テストアーキテクチャ](#テストアーキテクチャ)
3. [テストの種類](#テストの種類)
4. [テストツール](#テストツール)
5. [テストケース設計](#テストケース設計)
6. [モックとスタブ](#モックとスタブ)
7. [カバレッジ目標](#カバレッジ目標)
8. [CI/CD統合](#cicd統合)
9. [ベストプラクティス](#ベストプラクティス)

---

## 🎯 テスト戦略

### テストピラミッド

```
           /\
          /  \    E2E Tests (今後実装予定)
         /____\
        /      \
       / Integration \ (一部実装済み)
      /____________\
     /              \
    /  Unit Tests    \ (現在の主力)
   /__________________\
```

### 現在のフォーカス

1. **Unit Tests (80%)** - コンポーネント、Hook、関数のテスト
2. **Integration Tests (15%)** - コンポーネント間の連携テスト
3. **E2E Tests (5%)** - 将来的に Playwright/Cypress で実装

---

## 🏗️ テストアーキテクチャ

### ディレクトリ構造

```
src/
├── test/
│   ├── setup.js              # テスト環境のセットアップ
│   ├── CSVViewerApp.test.jsx # メインコンポーネントのテスト
│   ├── hooks/                # カスタムHookのテスト（今後）
│   │   ├── useCSVParser.test.js
│   │   ├── useDarkMode.test.js
│   │   └── useKeyboardShortcuts.test.js
│   ├── components/           # UIコンポーネントのテスト（今後）
│   │   ├── FileUpload.test.jsx
│   │   ├── SearchBar.test.jsx
│   │   └── DarkModeToggle.test.jsx
│   └── utils/                # ユーティリティ関数のテスト（今後）
│       └── validators.test.js
```

### テスト環境の構成

**ファイル**: `src/test/setup.js`

```javascript
import '@testing-library/jest-dom';

// 1. FileReader のモック
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

// 2. localStorage のモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// 3. navigator.clipboard のモック
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
  writable: true,
  configurable: true,
});
```

**重要ポイント**:
- `Object.defineProperty` を使用して読み取り専用プロパティをモック
- 各テストで `beforeEach` で状態をクリア
- グローバルオブジェクトのモックは慎重に実装

---

## 🧪 テストの種類

### 1. ユニットテスト

#### コンポーネントテスト

```javascript
describe('FileUpload Component', () => {
  it('should render upload button', () => {
    render(<FileUpload onFileSelect={vi.fn()} />);
    expect(screen.getByText(/CSVファイルを選択/i)).toBeInTheDocument();
  });

  it('should handle file selection', async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/CSVファイルを選択/i);

    await userEvent.upload(input, file);

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
```

#### Hookテスト

```javascript
describe('useDarkMode Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with light mode by default', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current.isDark).toBe(false);
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should save theme to localStorage', () => {
    const { result } = renderHook(() => useDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
});
```

### 2. 統合テスト

#### コンポーネント間の連携

```javascript
describe('CSV Upload and Display Integration', () => {
  it('should upload CSV and display data', async () => {
    render(<CSVViewerApp />);

    const csvContent = 'name,age\nJohn,30\nJane,25';
    const file = new File([csvContent], 'test.csv', {
      type: 'text/csv',
      _content: csvContent
    });

    const input = screen.getByLabelText(/CSVファイルを選択/i);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });
});
```

### 3. スナップショットテスト（今後）

```javascript
describe('DarkModeToggle Snapshot', () => {
  it('should match snapshot in light mode', () => {
    const { container } = render(
      <ThemeProvider>
        <DarkModeToggle />
      </ThemeProvider>
    );
    expect(container).toMatchSnapshot();
  });
});
```

---

## 🔧 テストツール

### Vitest

**設定**: `vite.config.js`

```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // グローバル変数を有効化
    environment: 'happy-dom',    // ブラウザ環境をシミュレート
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.js',
      ],
      threshold: {              // カバレッジの閾値
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
})
```

### React Testing Library

**主要なAPI**:

| API | 用途 | 例 |
|-----|------|-----|
| `render()` | コンポーネントをレンダリング | `render(<App />)` |
| `screen` | DOM要素にアクセス | `screen.getByText('Hello')` |
| `waitFor()` | 非同期処理を待つ | `await waitFor(() => { ... })` |
| `userEvent` | ユーザー操作をシミュレート | `await userEvent.click(button)` |
| `fireEvent` | イベントを発火 | `fireEvent.change(input, { target: { value: 'test' } })` |

### Jest DOM Matchers

```javascript
// 存在確認
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// 表示確認
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// 属性確認
expect(element).toHaveAttribute('type', 'file')
expect(element).toHaveClass('bg-blue-500')

// テキスト確認
expect(element).toHaveTextContent('Hello')

// 値確認
expect(input).toHaveValue('test')
```

---

## 📝 テストケース設計

### AAA パターン (Arrange-Act-Assert)

```javascript
it('should filter data by search term', () => {
  // Arrange (準備)
  const testData = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ];
  render(<DataTable data={testData} />);

  // Act (実行)
  const searchInput = screen.getByPlaceholderText('検索...');
  userEvent.type(searchInput, 'Alice');

  // Assert (検証)
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();
});
```

### Given-When-Then パターン

```javascript
describe('CSV File Validation', () => {
  it('should reject files larger than 50MB', () => {
    // Given: 50MBを超えるファイル
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.csv');

    // When: ファイルをバリデーション
    const result = validateFile(largeFile);

    // Then: エラーが返される
    expect(result.valid).toBe(false);
    expect(result.error).toContain('ファイルサイズが大きすぎます');
  });
});
```

### データ駆動テスト

```javascript
describe.each([
  { input: 'test.csv', expected: true },
  { input: 'test.txt', expected: false },
  { input: 'test.CSV', expected: true },
  { input: 'test.xls', expected: false },
])('File Extension Validation', ({ input, expected }) => {
  it(`should return ${expected} for ${input}`, () => {
    const result = isValidCSVExtension(input);
    expect(result).toBe(expected);
  });
});
```

---

## 🎭 モックとスタブ

### FileReader のモック

```javascript
class FileReaderMock {
  readAsText(file, encoding) {
    // ファイル内容を即座に読み込み
    setTimeout(() => {
      if (this.onload) {
        this.onload({
          target: { result: file._content || '' }
        });
      }
    }, 0);
  }
}
```

**使用例**:

```javascript
it('should parse CSV file', async () => {
  const csvContent = 'name,age\nJohn,30';
  const file = new File([csvContent], 'test.csv', {
    type: 'text/csv',
    _content: csvContent  // モック用のカスタムプロパティ
  });

  // ... テストコード
});
```

### PapaParse のモック

```javascript
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((csvString, config) => {
      const lines = csvString.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      config.complete({
        data,
        meta: { fields: headers }
      });
    })
  }
}));
```

### API コールのモック（今後）

```javascript
// MSW (Mock Service Worker) を使用
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/upload', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 📊 カバレッジ目標

### 現在のカバレッジ

```
Test Files: 1 passed (1)
Tests:      13 passed (13)
Duration:   2.60s
```

### 目標カバレッジ（6ヶ月後）

| カテゴリ | 現在 | 目標 |
|---------|------|------|
| **Statements** | 45% | 80% |
| **Branches** | 35% | 75% |
| **Functions** | 50% | 85% |
| **Lines** | 45% | 80% |

### 優先順位

#### 高優先度（すぐに実装）
- ✅ CSVViewerApp コンポーネント（完了）
- 🔲 FileUpload コンポーネント
- 🔲 validateFile 関数
- 🔲 parseCSVFile 関数
- 🔲 useDarkMode Hook

#### 中優先度（2週間以内）
- 🔲 SearchBar コンポーネント
- 🔲 Pagination コンポーネント
- 🔲 useCSVParser Hook
- 🔲 useKeyboardShortcuts Hook

#### 低優先度（1ヶ月以内）
- 🔲 ExportButtons コンポーネント
- 🔲 ColumnSelector コンポーネント
- 🔲 ErrorDisplay コンポーネント
- 🔲 LoadingSpinner コンポーネント

---

## 🔄 CI/CD 統合

### GitHub Actions（推奨設定）

```yaml
name: Test and Build

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Build
        run: npm run build
```

### プルリクエストチェック

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on:
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run lint
      - run: npm test

      - name: Comment Coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
```

---

## ✅ ベストプラクティス

### 1. テストの独立性

```javascript
// ❌ 悪い例: テスト間で状態を共有
let userData;

beforeAll(() => {
  userData = { name: 'John', age: 30 };
});

it('test 1', () => {
  userData.age = 31; // 状態を変更
  expect(userData.age).toBe(31);
});

it('test 2', () => {
  expect(userData.age).toBe(30); // 失敗する！
});

// ✅ 良い例: 各テストで新しい状態を作成
it('test 1', () => {
  const userData = { name: 'John', age: 30 };
  userData.age = 31;
  expect(userData.age).toBe(31);
});

it('test 2', () => {
  const userData = { name: 'John', age: 30 };
  expect(userData.age).toBe(30);
});
```

### 2. 意味のあるテスト名

```javascript
// ❌ 悪い例
it('test 1', () => { ... })
it('works correctly', () => { ... })

// ✅ 良い例
it('should display error when CSV file is too large', () => { ... })
it('should save user preferences to localStorage', () => { ... })
```

### 3. 実装詳細ではなく動作をテスト

```javascript
// ❌ 悪い例: 実装詳細に依存
it('should call setState with dark theme', () => {
  const { result } = renderHook(() => useDarkMode());
  const setStateSpy = vi.spyOn(result.current, 'setState');

  result.current.toggleDarkMode();

  expect(setStateSpy).toHaveBeenCalledWith({ theme: 'dark' });
});

// ✅ 良い例: ユーザーから見た動作をテスト
it('should apply dark theme to document', () => {
  const { result } = renderHook(() => useDarkMode());

  act(() => {
    result.current.toggleDarkMode();
  });

  expect(document.documentElement.classList.contains('dark')).toBe(true);
});
```

### 4. 適切な待機処理

```javascript
// ❌ 悪い例: 固定時間の待機
it('should display data after loading', async () => {
  render(<DataLoader />);
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ 良い例: waitFor を使用
it('should display data after loading', async () => {
  render(<DataLoader />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 5. テストのDRY原則

```javascript
// ヘルパー関数を作成
const renderWithProvider = (component) => {
  return render(
    <ThemeProvider>
      <Router>
        {component}
      </Router>
    </ThemeProvider>
  );
};

// 使用例
it('should render dark mode toggle', () => {
  renderWithProvider(<DarkModeToggle />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### 6. エラーケースのテスト

```javascript
describe('Error Handling', () => {
  it('should display error for invalid file type', () => {
    render(<FileUpload />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/CSVファイルを選択/i);

    userEvent.upload(input, file);

    expect(screen.getByText(/CSVファイル.*を選択してください/i))
      .toBeInTheDocument();
  });
});
```

---

## 📚 参考リソース

### 公式ドキュメント
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM](https://github.com/testing-library/jest-dom)

### 推奨記事
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)

### コミュニティ
- [Discord - Testing Library](https://discord.gg/testing-library)
- [GitHub Discussions](https://github.com/testing-library/react-testing-library/discussions)

---

## 🎓 まとめ

### テスト設計の5原則

1. **FIRST原則**
   - **F**ast - テストは高速に実行
   - **I**ndependent - テストは独立している
   - **R**epeatable - 何度実行しても同じ結果
   - **S**elf-validating - 結果は自動的に判定
   - **T**imely - コードと同時に書く

2. **テストピラミッド**
   - 多くのユニットテスト
   - 適度な統合テスト
   - 少数のE2Eテスト

3. **実装詳細ではなく動作をテスト**
   - ユーザーの視点でテスト
   - 内部実装の変更に強い

4. **適切なカバレッジ**
   - 100%を目指さない
   - 重要な部分を優先

5. **継続的改善**
   - テストを定期的にレビュー
   - 失敗から学ぶ

---

**Happy Testing! 🎉**

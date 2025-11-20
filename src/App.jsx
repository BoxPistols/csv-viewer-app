import CSVViewerApp from './components/CSVViewerApp.jsx'
import DarkModeToggle from './components/ui/DarkModeToggle'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Dark Mode Toggle - Fixed position with mobile adjustments */}
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="py-4 sm:py-6 md:py-8">
        <CSVViewerApp />
      </div>
    </div>
  )
}

export default App
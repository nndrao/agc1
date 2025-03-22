import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DataTable } from './components/DataTable'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-16 pb-12">
        <DataTable />
      </main>
      <Footer />
    </div>
  )
}

export default App
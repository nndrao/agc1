import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DataTable } from './components/DataTable'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="pt-16 pb-12">
        <DataTable />
      </main>
      <Footer />
    </div>
  )
}

export default App
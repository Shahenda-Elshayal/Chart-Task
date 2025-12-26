import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'chart.js/auto' // Auto-register all Chart.js components
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

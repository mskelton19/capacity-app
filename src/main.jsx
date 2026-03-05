import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TimelineProvider } from './context/TimelineContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <TimelineProvider>
    <App />
  </TimelineProvider>
)

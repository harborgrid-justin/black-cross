/**
 * @fileoverview Application entry point.
 * 
 * Initializes the React application by rendering the root App component
 * with React StrictMode enabled for development checks.
 * 
 * @module main
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

/**
 * Initialize and render the React application.
 * 
 * Creates a React root and renders the App component wrapped in StrictMode
 * for additional development checks and warnings.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

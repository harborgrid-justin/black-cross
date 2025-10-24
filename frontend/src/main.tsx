/**
 * @fileoverview Application entry point for the Black-Cross platform.
 *
 * This module initializes and bootstraps the React application by:
 * - Locating the root DOM element
 * - Creating a React 18 concurrent root
 * - Rendering the App component with StrictMode for development safety checks
 * - Loading global CSS styles
 *
 * StrictMode helps identify potential problems by:
 * - Detecting components with unsafe lifecycles
 * - Warning about legacy string ref API usage
 * - Warning about deprecated findDOMNode usage
 * - Detecting unexpected side effects
 * - Ensuring reusable state
 *
 * @module main
 * @see {@link https://react.dev/reference/react/StrictMode|React StrictMode}
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

/**
 * Bootstraps and renders the React application.
 *
 * Retrieves the root DOM element, creates a React 18 concurrent rendering root,
 * and renders the main App component wrapped in StrictMode for additional
 * development-time checks and warnings.
 *
 * @throws {Error} Implicitly throws if the 'root' element is not found in the DOM
 *
 * @example
 * ```html
 * <!-- index.html must contain: -->
 * <div id="root"></div>
 * ```
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

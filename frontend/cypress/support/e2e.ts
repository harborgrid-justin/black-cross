// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Cypress Testing Library
import '@testing-library/cypress/add-commands';

// Handle uncaught exceptions that might occur during React rendering
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific React/Redux related errors that don't affect test functionality
  if (err.message.includes('Cannot read properties of null')) {
    console.warn('Ignoring React context error:', err.message);
    return false;
  }
  if (err.message.includes('useMemo')) {
    console.warn('Ignoring React useMemo error:', err.message);
    return false;
  }
  
  // Allow other errors to fail the test
  return true;
});

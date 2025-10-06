// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// Custom command to set auth token
Cypress.Commands.add('setAuthToken', (token: string) => {
  window.localStorage.setItem('token', token);
});

// Custom command to clear auth
Cypress.Commands.add('clearAuth', () => {
  window.localStorage.removeItem('token');
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      setAuthToken(token: string): Chainable<void>;
      clearAuth(): Chainable<void>;
    }
  }
}

export {};

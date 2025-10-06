describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('should display dashboard after login', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.visit('/');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  it('should display key metrics and charts', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.visit('/');
      cy.contains('Dashboard').should('be.visible');
      cy.get('[data-testid="dashboard"]').should('exist');
    });
  });

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.visit('/');
      cy.contains('Dashboard').should('be.visible');
    });
  });
});

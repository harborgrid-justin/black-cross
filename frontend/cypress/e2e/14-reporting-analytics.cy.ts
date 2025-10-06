describe('Reporting & Analytics Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/reporting');
  });

  it('should display reporting page', () => {
    cy.contains(/Report|Analytics/i).should('be.visible');
  });

  it('should show dashboard metrics', () => {
    cy.get('[data-testid="metrics"]').should('exist');
  });

  it('should display charts and graphs', () => {
    cy.get('[data-testid="chart"]').should('exist');
  });

  it('should allow generating reports', () => {
    cy.contains(/Generate|Create Report/i).should('exist');
  });

  it('should filter by date range', () => {
    cy.get('[data-testid="date-filter"]').should('exist');
  });

  it('should export reports', () => {
    cy.contains(/Export|Download/i).should('exist');
  });
});

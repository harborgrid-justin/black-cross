describe('Dark Web Monitoring Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/dark-web');
  });

  it('should display dark web monitoring page', () => {
    cy.contains(/Dark Web/i).should('be.visible');
  });

  it('should show monitored keywords', () => {
    cy.get('[data-testid="keywords"]').should('exist');
  });

  it('should display alerts', () => {
    cy.get('[data-testid="alerts"]').should('exist');
  });

  it('should allow adding new keywords', () => {
    cy.contains(/Add|Create/i).should('exist');
  });

  it('should show scan results', () => {
    cy.get('[data-testid="scan-results"]').should('exist');
  });
});

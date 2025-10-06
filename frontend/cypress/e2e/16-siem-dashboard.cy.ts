describe('SIEM Dashboard Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/siem');
  });

  it('should display SIEM dashboard', () => {
    cy.contains(/SIEM/i).should('be.visible');
  });

  it('should show real-time events', () => {
    cy.get('[data-testid="events-feed"]').should('exist');
  });

  it('should display security alerts', () => {
    cy.get('[data-testid="alerts"]').should('exist');
  });

  it('should show correlation rules', () => {
    cy.get('[data-testid="correlation-rules"]').should('exist');
  });

  it('should filter events by severity', () => {
    cy.get('[data-testid="severity-filter"]').should('exist');
  });
});

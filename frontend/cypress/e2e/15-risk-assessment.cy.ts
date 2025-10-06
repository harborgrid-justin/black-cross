describe('Risk Assessment Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/risk');
  });

  it('should display risk assessment page', () => {
    cy.contains(/Risk/i).should('be.visible');
  });

  it('should show risk matrix', () => {
    cy.get('[data-testid="risk-matrix"]').should('exist');
  });

  it('should display risk score', () => {
    cy.get('[data-testid="risk-score"]').should('exist');
  });

  it('should list assets at risk', () => {
    cy.get('[data-testid="assets-list"]').should('exist');
  });

  it('should allow risk mitigation actions', () => {
    cy.get('[data-testid="mitigation-actions"]').should('exist');
  });
});

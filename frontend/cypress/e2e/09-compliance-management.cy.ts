describe('Compliance Management Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/compliance');
  });

  it('should display compliance page', () => {
    cy.contains('Compliance').should('be.visible');
  });

  it('should show compliance frameworks', () => {
    cy.get('[data-testid="frameworks"]').should('exist');
  });

  it('should display compliance score', () => {
    cy.get('[data-testid="compliance-score"]').should('exist');
  });

  it('should list compliance requirements', () => {
    cy.get('[data-testid="requirements-list"]').should('exist');
  });

  it('should filter by framework', () => {
    cy.get('[data-testid="framework-filter"]').should('exist');
  });
});

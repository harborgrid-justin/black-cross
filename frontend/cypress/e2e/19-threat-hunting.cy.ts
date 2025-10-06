describe('Threat Hunting Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/hunting');
  });

  it('should display threat hunting page', () => {
    cy.contains(/Threat Hunt/i).should('be.visible');
  });

  it('should show hunting queries', () => {
    cy.get('[data-testid="queries"]').should('exist');
  });

  it('should allow creating new hunt', () => {
    cy.contains(/Create|New Hunt/i).should('exist');
  });

  it('should display hunt results', () => {
    cy.get('[data-testid="hunt-results"]').should('exist');
  });

  it('should show saved queries', () => {
    cy.get('[data-testid="saved-queries"]').should('exist');
  });
});

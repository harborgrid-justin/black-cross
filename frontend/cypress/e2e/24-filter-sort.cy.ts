describe('Filter and Sort Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should filter threats by severity', () => {
    cy.visit('/threats');
    cy.get('[data-testid="severity-filter"]').click();
    cy.contains('High').click();
    cy.get('[data-testid="threat-item"]').should('exist');
  });

  it('should sort threats by date', () => {
    cy.visit('/threats');
    cy.get('[data-testid="sort-button"]').click();
    cy.contains('Date').click();
    cy.get('[data-testid="threat-item"]').should('exist');
  });

  it('should filter incidents by status', () => {
    cy.visit('/incidents');
    cy.get('[data-testid="status-filter"]').click();
    cy.contains('Active').click();
    cy.get('[data-testid="incident-item"]').should('exist');
  });

  it('should apply multiple filters', () => {
    cy.visit('/threats');
    cy.get('[data-testid="severity-filter"]').click();
    cy.contains('High').click();
    cy.get('[data-testid="status-filter"]').click();
    cy.contains('Active').click();
    cy.get('[data-testid="threat-item"]').should('exist');
  });

  it('should reset filters', () => {
    cy.visit('/threats');
    cy.get('[data-testid="severity-filter"]').click();
    cy.contains('High').click();
    cy.get('[data-testid="reset-filters"]').click();
    cy.get('[data-testid="threat-item"]').should('exist');
  });
});

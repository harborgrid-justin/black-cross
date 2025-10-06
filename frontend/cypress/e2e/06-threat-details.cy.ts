describe('Threat Details Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should display threat details', () => {
    cy.visit('/threats/1');
    cy.contains('Threat Details').should('be.visible');
  });

  it('should show threat severity', () => {
    cy.visit('/threats/1');
    cy.get('[data-testid="severity"]').should('exist');
  });

  it('should show threat status', () => {
    cy.visit('/threats/1');
    cy.get('[data-testid="status"]').should('exist');
  });

  it('should display action buttons', () => {
    cy.visit('/threats/1');
    cy.get('[data-testid="action-buttons"]').should('exist');
  });

  it('should navigate back to list', () => {
    cy.visit('/threats/1');
    cy.contains('Back').click();
    cy.url().should('include', '/threats');
    cy.url().should('not.include', '/threats/');
  });
});

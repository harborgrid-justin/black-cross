describe('Incident Response Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/incidents');
  });

  it('should display incidents page', () => {
    cy.contains(/Incident/i).should('be.visible');
  });

  it('should show incidents list', () => {
    cy.get('[data-testid="incidents-list"]').should('exist');
  });

  it('should display incident severity', () => {
    cy.get('[data-testid="severity-badge"]').should('exist');
  });

  it('should allow creating new incident', () => {
    cy.contains(/Create|New Incident/i).should('exist');
  });

  it('should filter incidents by status', () => {
    cy.get('[data-testid="status-filter"]').should('exist');
  });

  it('should show incident timeline', () => {
    cy.get('[data-testid="incident-item"]').first().click();
    cy.get('[data-testid="timeline"]').should('exist');
  });
});

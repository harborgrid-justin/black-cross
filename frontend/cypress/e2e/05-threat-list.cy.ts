describe('Threat List Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/threats');
  });

  it('should display threat list page', () => {
    cy.contains('Threat Intelligence').should('be.visible');
  });

  it('should display threats table or list', () => {
    cy.get('[data-testid="threat-list"]').should('exist');
  });

  it('should allow filtering threats', () => {
    cy.get('[data-testid="filter-button"]').should('exist');
  });

  it('should allow searching threats', () => {
    cy.get('input[placeholder*="Search"]').should('exist');
  });

  it('should navigate to threat details on click', () => {
    cy.get('[data-testid="threat-item"]').first().click();
    cy.url().should('include', '/threats/');
  });

  it('should display pagination if many threats', () => {
    cy.get('[data-testid="pagination"]').should('exist');
  });
});

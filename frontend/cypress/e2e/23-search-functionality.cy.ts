describe('Search Functionality Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should search threats', () => {
    cy.visit('/threats');
    cy.get('input[placeholder*="Search"]').type('malware');
    cy.get('[data-testid="search-button"]').click();
    cy.contains('malware').should('be.visible');
  });

  it('should search vulnerabilities', () => {
    cy.visit('/vulnerabilities');
    cy.get('input[placeholder*="Search"]').type('CVE-2024');
    cy.get('[data-testid="search-results"]').should('exist');
  });

  it('should handle empty search results', () => {
    cy.visit('/threats');
    cy.get('input[placeholder*="Search"]').type('nonexistentquery12345');
    cy.contains(/no results|not found/i).should('be.visible');
  });

  it('should clear search', () => {
    cy.visit('/threats');
    cy.get('input[placeholder*="Search"]').type('test');
    cy.get('[data-testid="clear-search"]').click();
    cy.get('input[placeholder*="Search"]').should('have.value', '');
  });
});

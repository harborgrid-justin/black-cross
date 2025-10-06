describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should navigate through all main pages', () => {
    const pages = [
      { path: '/', text: 'Dashboard' },
      { path: '/threats', text: 'Threat' },
      { path: '/incidents', text: 'Incident' },
      { path: '/vulnerabilities', text: 'Vulnerabilit' },
      { path: '/automation', text: 'Automation' },
      { path: '/compliance', text: 'Compliance' },
    ];

    pages.forEach((page) => {
      cy.visit(page.path);
      cy.contains(new RegExp(page.text, 'i')).should('be.visible');
      cy.url().should('include', page.path);
    });
  });

  it('should maintain authentication across navigation', () => {
    cy.visit('/');
    cy.visit('/threats');
    cy.visit('/incidents');
    cy.url().should('not.include', '/login');
  });

  it('should handle browser back button', () => {
    cy.visit('/');
    cy.visit('/threats');
    cy.go('back');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should handle browser forward button', () => {
    cy.visit('/');
    cy.visit('/threats');
    cy.go('back');
    cy.go('forward');
    cy.url().should('include', '/threats');
  });
});

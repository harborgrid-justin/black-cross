describe('Private Route Protection', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/threat-intelligence');
    cy.url().should('include', '/login');
  });

  it('should allow authenticated users to access protected routes', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.visit('/threat-intelligence');
      cy.url().should('include', '/threat-intelligence');
    });
  });

  it('should protect all dashboard routes', () => {
    const protectedRoutes = [
      '/threat-intelligence',
      '/incident-response',
      '/vulnerability-management',
      '/automation',
      '/compliance',
    ];

    protectedRoutes.forEach((route) => {
      cy.visit(route);
      cy.url().should('include', '/login');
    });
  });
});

describe('Private Route Protection', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/threats');
    cy.url().should('include', '/login');
  });

  it('should allow authenticated users to access protected routes', () => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
      cy.visit('/threats');
      cy.url().should('include', '/threats');
    });
  });

  it('should protect all dashboard routes', () => {
    const protectedRoutes = [
      '/threats',
      '/incidents',
      '/vulnerabilities',
      '/automation',
      '/compliance',
    ];

    protectedRoutes.forEach((route) => {
      cy.visit(route);
      cy.url().should('include', '/login');
    });
  });
});

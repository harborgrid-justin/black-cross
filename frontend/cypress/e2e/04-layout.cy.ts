describe('Layout Component', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should display navigation menu', () => {
    cy.visit('/');
    cy.get('nav').should('be.visible');
  });

  it('should navigate to different pages via menu', () => {
    cy.visit('/');
    cy.contains('Threats').click();
    cy.url().should('include', '/threats');
  });

  it('should display user menu', () => {
    cy.visit('/');
    cy.get('[data-testid="user-menu"]').should('exist');
  });

  it('should allow logout', () => {
    cy.visit('/');
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });

  it('should collapse sidebar on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('[data-testid="menu-button"]').should('be.visible');
  });
});

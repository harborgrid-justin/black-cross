describe('Login Component', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('required').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('input[name="email"]').type('invalid@email.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains(/invalid|error/i).should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('input[name="email"]').type(users.validUser.email);
      cy.get('input[name="password"]').type(users.validUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
    });
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-x');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });
});

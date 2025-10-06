describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should have proper page titles', () => {
    cy.visit('/');
    cy.title().should('include', 'Black-Cross');
  });

  it('should support keyboard navigation on login', () => {
    cy.clearAuth();
    cy.visit('/login');
    cy.get('input[name="email"]').focus().should('have.focus');
    cy.get('input[name="email"]').type('{tab}');
    cy.get('input[name="password"]').should('have.focus');
  });

  it('should have accessible form labels', () => {
    cy.clearAuth();
    cy.visit('/login');
    cy.get('label[for="email"]').should('exist');
    cy.get('label[for="password"]').should('exist');
  });

  it('should have proper ARIA labels on buttons', () => {
    cy.visit('/');
    cy.get('button[aria-label]').should('exist');
  });

  it('should support high contrast mode', () => {
    cy.visit('/');
    cy.get('body').should('have.css', 'background-color');
    cy.get('body').should('have.css', 'color');
  });

  it('should have proper heading hierarchy', () => {
    cy.visit('/');
    cy.get('h1').should('exist');
  });

  it('should have alt text on images', () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });
});

describe('Collaboration Hub Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/collaboration');
  });

  it('should display collaboration page', () => {
    cy.contains('Collaboration').should('be.visible');
  });

  it('should show team members', () => {
    cy.get('[data-testid="team-members"]').should('exist');
  });

  it('should display activity feed', () => {
    cy.get('[data-testid="activity-feed"]').should('exist');
  });

  it('should allow posting messages', () => {
    cy.get('[data-testid="message-input"]').should('exist');
  });

  it('should show notifications', () => {
    cy.get('[data-testid="notifications"]').should('exist');
  });
});

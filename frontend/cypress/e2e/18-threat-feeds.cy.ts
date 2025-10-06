describe('Threat Feeds Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/threat-feeds');
  });

  it('should display threat feeds page', () => {
    cy.contains(/Threat Feed/i).should('be.visible');
  });

  it('should show available feeds', () => {
    cy.get('[data-testid="feeds-list"]').should('exist');
  });

  it('should display feed status', () => {
    cy.get('[data-testid="feed-status"]').should('exist');
  });

  it('should allow subscribing to feeds', () => {
    cy.contains(/Subscribe|Add/i).should('exist');
  });

  it('should show feed updates', () => {
    cy.get('[data-testid="feed-updates"]').should('exist');
  });
});

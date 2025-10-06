describe('Threat Actors Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/threat-actors');
  });

  it('should display threat actors page', () => {
    cy.contains(/Threat Actor/i).should('be.visible');
  });

  it('should show threat actors list', () => {
    cy.get('[data-testid="actors-list"]').should('exist');
  });

  it('should display actor profiles', () => {
    cy.get('[data-testid="actor-profile"]').should('exist');
  });

  it('should show activity timeline', () => {
    cy.get('[data-testid="activity-timeline"]').should('exist');
  });

  it('should filter by actor type', () => {
    cy.get('[data-testid="type-filter"]').should('exist');
  });
});

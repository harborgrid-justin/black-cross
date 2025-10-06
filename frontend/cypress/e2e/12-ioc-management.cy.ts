describe('IoC Management Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/iocs');
  });

  it('should display IoC management page', () => {
    cy.contains(/IoC|Indicator/i).should('be.visible');
  });

  it('should show IoC list', () => {
    cy.get('[data-testid="ioc-list"]').should('exist');
  });

  it('should display IoC types', () => {
    cy.get('[data-testid="ioc-type"]').should('exist');
  });

  it('should allow adding new IoC', () => {
    cy.contains(/Add|Create/i).should('exist');
  });

  it('should filter by IoC type', () => {
    cy.get('[data-testid="type-filter"]').should('exist');
  });

  it('should search IoCs', () => {
    cy.get('input[placeholder*="Search"]').should('exist');
  });
});

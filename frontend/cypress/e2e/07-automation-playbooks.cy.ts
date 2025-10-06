describe('Automation & Playbooks Page', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/automation');
  });

  it('should display automation page', () => {
    cy.contains(/Automation|Playbooks/i).should('be.visible');
  });

  it('should display playbooks list', () => {
    cy.get('[data-testid="playbooks-list"]').should('exist');
  });

  it('should allow creating new playbook', () => {
    cy.contains(/Create|New/i).should('exist');
  });

  it('should show playbook execution history', () => {
    cy.get('[data-testid="execution-history"]').should('exist');
  });

  it('should filter playbooks by status', () => {
    cy.get('[data-testid="status-filter"]').should('exist');
  });
});

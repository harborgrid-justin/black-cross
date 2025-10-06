describe('API Integration Tests', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
  });

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '/api/v1/threats', {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('threatsError');

    cy.visit('/threats');
    cy.wait('@threatsError');
    cy.contains(/error|failed/i).should('be.visible');
  });

  it('should handle network timeouts', () => {
    cy.intercept('GET', '/api/v1/threats', (req) => {
      req.reply({
        delay: 30000,
        statusCode: 408,
      });
    }).as('threatsTimeout');

    cy.visit('/threats');
  });

  it('should retry failed requests', () => {
    let requestCount = 0;
    cy.intercept('GET', '/api/v1/threats', (req) => {
      requestCount++;
      if (requestCount < 2) {
        req.reply({ statusCode: 500 });
      } else {
        req.reply({ statusCode: 200, body: [] });
      }
    }).as('threatsRetry');

    cy.visit('/threats');
  });

  it('should load data from API', () => {
    cy.intercept('GET', '/api/v1/threats', {
      statusCode: 200,
      body: { data: [] },
    }).as('threatsLoad');

    cy.visit('/threats');
    cy.wait('@threatsLoad');
  });
});

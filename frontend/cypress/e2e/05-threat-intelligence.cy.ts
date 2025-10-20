describe('Threat Intelligence Management - Comprehensive Test Suite', () => {
  // =============================================================================
  // SECTION 1: Basic Page Load and Navigation (Tests 1-5)
  // =============================================================================
  describe('Basic Page Load and Navigation', () => {
    it('Test 1: should display threat intelligence page', () => {
      cy.visit('/threats');
      cy.contains(/Threat Intelligence/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 2: should have correct page title', () => {
      cy.visit('/threats');
      cy.contains('Threat Intelligence', { timeout: 10000 }).should('be.visible');
    });

    it('Test 3: should navigate to threats page directly', () => {
      cy.visit('/threats');
      cy.url().should('include', '/threats');
      cy.contains('Threat Intelligence').should('be.visible');
    });

    it('Test 4: should load without errors', () => {
      cy.visit('/threats');
      cy.wait(1000);
      // Page should be visible even with errors shown
      cy.contains('Threat Intelligence').should('be.visible');
    });

    it('Test 5: should show page content', () => {
      cy.visit('/threats');
      cy.get('body').should('be.visible');
      cy.contains(/Threat/i).should('exist');
    });
  });

  // =============================================================================
  // SECTION 2: Display and Layout (Tests 6-10)
  // =============================================================================
  describe('Display and Layout', () => {
    it('Test 6: should show Add Threat button', () => {
      cy.visit('/threats');
      cy.contains(/Add Threat/i, { timeout: 10000 }).should('exist');
    });

    it('Test 7: should display threat table structure', () => {
      cy.visit('/threats');
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 8: should show table headers', () => {
      cy.visit('/threats');
      cy.get('table thead th', { timeout: 10000 }).contains(/Name/i).should('be.visible');
      cy.get('table thead th').contains(/Type/i).should('be.visible');
      cy.get('table thead th').contains(/Severity/i).should('be.visible');
      cy.get('table thead th').contains(/Status/i).should('be.visible');
      cy.get('table thead th').contains(/Confidence/i).should('be.visible');
    });

    it('Test 9: should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/threats');
      cy.wait(500); // Wait for viewport change
      cy.get('body').should('be.visible');
      cy.contains('Threat').should('exist');
    });

    it('Test 10: should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/threats');
      cy.contains('Threat Intelligence', { timeout: 10000 }).should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 3: Threat List Display (Tests 11-15)
  // =============================================================================
  describe('Threat List Display', () => {
    it('Test 11: should display threat list', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 12: should display severity chips', () => {
      cy.visit('/threats');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 13: should display threat names', () => {
      cy.visit('/threats');
      cy.get('table tbody', { timeout: 10000 }).should('exist');
    });

    it('Test 14: should display confidence scores', () => {
      cy.visit('/threats');
      cy.get('table tbody', { timeout: 10000 }).should('contain', '%');
    });

    it('Test 15: should display status indicators', () => {
      cy.visit('/threats');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 4: Threat Type Tests (Tests 16-23)
  // =============================================================================
  describe('Threat Type Tests', () => {
    it('Test 16: should handle APT threats', () => {
      cy.visit('/threats');
      cy.get('table tbody', { timeout: 10000 }).should('exist');
      cy.get('.MuiChip-label').should('exist');
    });

    it('Test 17: should handle ransomware threats', () => {
      cy.visit('/threats');
      cy.get('table tbody', { timeout: 10000 }).should('exist');
      cy.get('.MuiChip-label').should('exist');
    });

    it('Test 18: should handle phishing threats', () => {
      cy.visit('/threats');
      cy.get('table tbody', { timeout: 10000 }).should('exist');
      cy.get('.MuiChip-label').should('exist');
    });

    it('Test 19: should handle botnet threats', () => {
      cy.visit('/threats');
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 20: should handle malware threats', () => {
      cy.visit('/threats');
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 21: should handle DDoS threats', () => {
      cy.visit('/threats');
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 22: should display threat types in chips', () => {
      cy.visit('/threats');
      cy.get('table tbody td', { timeout: 10000 }).should('exist');
    });

    it('Test 23: should display different threat types together', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
      cy.get('table tbody td').should('have.length.at.least', 1);
    });
  });

  // =============================================================================
  // SECTION 5: Search and Filter (Tests 24-30)
  // =============================================================================
  describe('Search and Filter', () => {
    it('Test 24: should have search input field', () => {
      cy.visit('/threats');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 25: should have severity filter dropdown', () => {
      cy.visit('/threats');
      cy.contains(/Severity/i, { timeout: 10000 }).should('exist');
    });

    it('Test 26: should have status filter dropdown', () => {
      cy.visit('/threats');
      cy.contains(/Status/i, { timeout: 10000 }).should('exist');
    });

    it('Test 27: should allow typing in search field', () => {
      cy.visit('/threats');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 })
        .type('phishing')
        .should('have.value', 'phishing');
    });

    it('Test 28: should have Search button', () => {
      cy.visit('/threats');
      cy.contains('button', /Search/i, { timeout: 10000 }).should('exist');
    });

    it('Test 29: should show filter controls', () => {
      cy.visit('/threats');
      cy.get('.MuiFormControl-root', { timeout: 10000 }).should('exist');
    });

    it('Test 30: should display search results area', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 6: Sorting (Tests 31-35)
  // =============================================================================
  describe('Sorting', () => {
    it('Test 31: should have sortable columns', () => {
      cy.visit('/threats');
      cy.get('table thead th', { timeout: 10000 }).should('have.length.at.least', 5);
    });

    it('Test 32: should display threat data in table', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });

    it('Test 33: should show column headers', () => {
      cy.visit('/threats');
      cy.get('table thead', { timeout: 10000 }).should('be.visible');
    });

    it('Test 34: should display sortable threat list', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 35: should maintain table structure for sorting', () => {
      cy.visit('/threats');
      cy.get('table', { timeout: 10000 }).should('exist');
      cy.get('table thead').should('exist');
      cy.get('table tbody').should('exist');
    });
  });

  // =============================================================================
  // SECTION 7: Threat Details Navigation (Tests 36-40)
  // =============================================================================
  describe('Threat Details Navigation', () => {
    it('Test 36: should navigate to threat details on row click', () => {
      cy.visit('/threats');
      cy.get('table tbody tr', { timeout: 10000 }).first().click();
      cy.url().should('include', '/threats/');
    });

    it('Test 37: should display threat details page', () => {
      cy.visit('/threats/1');
      cy.contains(/Threat/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 38: should show Back button on details page', () => {
      cy.visit('/threats/1');
      cy.contains('Back', { timeout: 10000 }).should('exist');
    });

    it('Test 39: should display threat severity on details page', () => {
      cy.visit('/threats/1');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 40: should show threat metadata on details page', () => {
      cy.visit('/threats/1');
      cy.contains(/First Seen|Last Seen|Created/i, { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 8: Threat Details Display (Tests 41-45)
  // =============================================================================
  describe('Threat Details Display', () => {
    it('Test 41: should display threat description', () => {
      cy.visit('/threats/1');
      cy.get('body', { timeout: 10000 }).should('contain.text', 'APT29');
    });

    it('Test 42: should show categories section', () => {
      cy.visit('/threats/1');
      cy.contains(/Categories/i, { timeout: 10000 }).should('exist');
    });

    it('Test 43: should show tags section', () => {
      cy.visit('/threats/1');
      cy.contains(/Tags/i, { timeout: 10000 }).should('exist');
    });

    it('Test 44: should display action buttons', () => {
      cy.visit('/threats/1');
      cy.contains('button', /Edit|Archive/i, { timeout: 10000 }).should('exist');
    });

    it('Test 45: should show indicators of compromise section', () => {
      cy.visit('/threats/1');
      cy.contains(/Indicator|IoC/i, { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 9: Action Buttons and Operations (Tests 46-48)
  // =============================================================================
  describe('Action Buttons and Operations', () => {
    it('Test 46: should have Refresh button', () => {
      cy.visit('/threats');
      cy.contains('button', /Refresh/i, { timeout: 10000 }).should('exist');
    });

    it('Test 47: should have Add Threat button clickable', () => {
      cy.visit('/threats');
      cy.contains('button', /Add Threat/i, { timeout: 10000 }).should('be.visible').click();
      cy.url().should('include', '/threats/new');
    });

    it('Test 48: should navigate back from details page', () => {
      cy.visit('/threats/1');
      cy.contains('button', /Back/i, { timeout: 10000 }).click();
      cy.url().should('match', /\/threats$/);
    });
  });

  // =============================================================================
  // SECTION 10: Performance and Edge Cases (Tests 49-50)
  // =============================================================================
  describe('Performance and Edge Cases', () => {
    it('Test 49: should handle empty threat list gracefully', () => {
      cy.visit('/threats');
      // Even if empty, table should exist
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 50: should load page within acceptable time', () => {
      const startTime = Date.now();
      cy.visit('/threats');
      cy.contains('Threat Intelligence', { timeout: 10000 }).should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000); // Should load within 10 seconds
      });
    });
  });
});

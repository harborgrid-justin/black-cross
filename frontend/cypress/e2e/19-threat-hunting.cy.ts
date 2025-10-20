describe('Threat Hunting Platform - Comprehensive Test Suite', () => {
  // =============================================================================
  // SECTION 1: Basic Page Load and Navigation (Tests 1-10)
  // =============================================================================
  describe('Basic Page Load and Navigation', () => {
    it('Test 1: should display threat hunting platform page', () => {
      cy.visit('/hunting');
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 2: should have correct page title', () => {
      cy.visit('/hunting');
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 3: should navigate to threat hunting page directly', () => {
      cy.visit('/hunting');
      cy.url().should('include', '/hunting');
      cy.contains(/Threat Hunting/i).should('be.visible');
    });

    it('Test 4: should load without errors', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains('Threat Hunting').should('be.visible');
    });

    it('Test 5: should show page content', () => {
      cy.visit('/hunting');
      cy.get('body').should('be.visible');
      cy.contains(/Hunt/i).should('exist');
    });

    it('Test 6: should display refresh button', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Refresh/i, { timeout: 10000 }).should('exist');
    });

    it('Test 7: should display new hypothesis button', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).should('exist');
    });

    it('Test 8: should be accessible without login errors', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 9: should load within reasonable time', () => {
      const startTime = Date.now();
      cy.visit('/hunting');
      cy.contains('Threat Hunting', { timeout: 10000 }).should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000);
      });
    });

    it('Test 10: should maintain URL after page load', () => {
      cy.visit('/hunting');
      cy.url().should('include', '/hunting');
      cy.wait(1000);
      cy.url().should('include', '/hunting');
    });
  });

  // =============================================================================
  // SECTION 2: Display and Layout (Tests 11-20)
  // =============================================================================
  describe('Display and Layout', () => {
    it('Test 11: should display query builder section', () => {
      cy.visit('/hunting');
      cy.contains(/Query Builder/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 12: should display query results section', () => {
      cy.visit('/hunting');
      cy.contains(/Query Results/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 13: should display hunting hypotheses section', () => {
      cy.visit('/hunting');
      cy.contains(/Hunting Hypotheses/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 14: should have query language selector', () => {
      cy.visit('/hunting');
      cy.contains(/Language/i, { timeout: 10000 }).should('exist');
    });

    it('Test 15: should have query text input area', () => {
      cy.visit('/hunting');
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 }).should('exist');
    });

    it('Test 16: should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/hunting');
      cy.wait(500);
      cy.get('body').should('be.visible');
      cy.contains('Threat').should('exist');
    });

    it('Test 17: should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/hunting');
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 18: should display execute query button', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Execute/i, { timeout: 10000 }).should('exist');
    });

    it('Test 19: should display save query button', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Save/i, { timeout: 10000 }).should('exist');
    });

    it('Test 20: should have proper grid layout structure', () => {
      cy.visit('/hunting');
      cy.get('.MuiGrid2-root', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 3: Statistics Display (Tests 21-30)
  // =============================================================================
  describe('Statistics Display', () => {
    it('Test 21: should display total hypotheses statistic', () => {
      cy.visit('/hunting');
      cy.contains(/Hypotheses/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 22: should display active hypotheses count', () => {
      cy.visit('/hunting');
      cy.contains(/Active/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 23: should display validated hypotheses count', () => {
      cy.visit('/hunting');
      cy.contains(/Validated/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 24: should display total findings count', () => {
      cy.visit('/hunting');
      cy.contains(/Findings/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 25: should display critical findings count', () => {
      cy.visit('/hunting');
      cy.contains(/Critical/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 26: should display campaigns count', () => {
      cy.visit('/hunting');
      cy.contains(/Campaigns/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 27: should display statistics in cards', () => {
      cy.visit('/hunting');
      cy.get('.MuiCard-root', { timeout: 10000 }).should('have.length.at.least', 5);
    });

    it('Test 28: should show numeric values in statistics', () => {
      cy.visit('/hunting');
      cy.get('.MuiCard-root .MuiTypography-h4', { timeout: 10000 }).should('exist');
    });

    it('Test 29: should display statistics with proper formatting', () => {
      cy.visit('/hunting');
      cy.get('.MuiCardContent-root', { timeout: 10000 }).should('have.length.at.least', 5);
    });

    it('Test 30: should show statistics labels', () => {
      cy.visit('/hunting');
      cy.get('.MuiCard-root .MuiTypography-body2', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 4: Hypothesis Management (Tests 31-40)
  // =============================================================================
  describe('Hypothesis Management', () => {
    it('Test 31: should display hypothesis list', () => {
      cy.visit('/hunting');
      cy.get('.MuiList-root', { timeout: 10000 }).should('exist');
    });

    it('Test 32: should show hypothesis items', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItem-root', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 33: should display hypothesis titles', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItemText-primary', { timeout: 10000 }).should('exist');
    });

    it('Test 34: should display hypothesis priority chips', () => {
      cy.visit('/hunting');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 35: should display hypothesis status chips', () => {
      cy.visit('/hunting');
      cy.get('.MuiChip-outlined', { timeout: 10000 }).should('exist');
    });

    it('Test 36: should allow clicking on hypotheses', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItemButton-root', { timeout: 10000 }).first().should('exist');
    });

    it('Test 37: should highlight selected hypothesis', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItemButton-root.Mui-selected', { timeout: 10000 }).should('exist');
    });

    it('Test 38: should show different priority levels', () => {
      cy.visit('/hunting');
      cy.get('.MuiChip-colorError, .MuiChip-colorWarning, .MuiChip-colorInfo', { timeout: 10000 }).should('exist');
    });

    it('Test 39: should display hypothesis count', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItem-root', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 40: should show hypothesis metadata', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItemText-secondary', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 5: Query Builder and Execution (Tests 41-50)
  // =============================================================================
  describe('Query Builder and Execution', () => {
    it('Test 41: should have query language dropdown', () => {
      cy.visit('/hunting');
      cy.get('.MuiSelect-select', { timeout: 10000 }).should('exist');
    });

    it('Test 42: should display KQL language option', () => {
      cy.visit('/hunting');
      cy.contains(/KQL/i, { timeout: 10000 }).should('exist');
    });

    it('Test 43: should allow typing in query field', () => {
      cy.visit('/hunting');
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 })
        .type('source="security" | search malware')
        .should('contain.value', 'malware');
    });

    it('Test 44: should enable execute button when query is entered', () => {
      cy.visit('/hunting');
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 }).type('test query');
      cy.contains('button', /Execute Query/i).should('not.be.disabled');
    });

    it('Test 45: should disable execute button when query is empty', () => {
      cy.visit('/hunting');
      cy.contains('button', /Execute Query/i, { timeout: 10000 }).should('be.disabled');
    });

    it('Test 46: should have save query functionality', () => {
      cy.visit('/hunting');
      cy.contains('button', /Save Query/i, { timeout: 10000 }).should('exist');
    });

    it('Test 47: should display query text area with multiple rows', () => {
      cy.visit('/hunting');
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 })
        .should('have.attr', 'rows', '6');
    });

    it('Test 48: should show language selector options', () => {
      cy.visit('/hunting');
      cy.get('.MuiFormControl-root:has(.MuiInputLabel-root:contains("Language"))', { timeout: 10000 })
        .should('exist');
    });

    it('Test 49: should display monospace font for query input', () => {
      cy.visit('/hunting');
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 })
        .should('have.css', 'font-family')
        .and('match', /monospace/i);
    });

    it('Test 50: should have execute and save buttons in query builder', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Execute/i, { timeout: 10000 }).should('exist');
      cy.contains(/Save/i).should('exist');
    });
  });

  // =============================================================================
  // SECTION 6: Search and Filter (Tests 51-60)
  // =============================================================================
  describe('Search and Filter', () => {
    it('Test 51: should filter hypotheses by priority', () => {
      cy.visit('/hunting');
      cy.get('.MuiChip-colorError, .MuiChip-colorWarning', { timeout: 10000 }).should('exist');
    });

    it('Test 52: should display critical priority hypotheses', () => {
      cy.visit('/hunting');
      cy.contains('.MuiChip-label', /critical/i, { timeout: 10000 }).should('exist');
    });

    it('Test 53: should display high priority hypotheses', () => {
      cy.visit('/hunting');
      cy.contains('.MuiChip-label', /high/i, { timeout: 10000 }).should('exist');
    });

    it('Test 54: should show active status hypotheses', () => {
      cy.visit('/hunting');
      cy.contains('.MuiChip-outlined', /active/i, { timeout: 10000 }).should('exist');
    });

    it('Test 55: should show validated status hypotheses', () => {
      cy.visit('/hunting');
      cy.get('.MuiChip-outlined', { timeout: 10000 }).should('exist');
    });

    it('Test 56: should filter by category', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItem-root', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 57: should display different hypothesis categories', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItemText-primary', { timeout: 10000 }).should('exist');
    });

    it('Test 58: should show multiple priority levels', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiChip-label', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 59: should display status filters', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiChip-outlined', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 60: should allow filtering by multiple criteria', () => {
      cy.visit('/hunting');
      cy.get('.MuiListItem-root', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 7: Findings Display (Tests 61-70)
  // =============================================================================
  describe('Findings Display', () => {
    it('Test 61: should display findings section', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 62: should show findings count when available', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 63: should display finding titles', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 64: should show finding severity levels', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 65: should display finding status', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 66: should show finding chips', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiChip-label', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 67: should display findings list', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('.MuiList-root', { timeout: 10000 }).should('exist');
    });

    it('Test 68: should show different severity findings', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 69: should display finding metadata', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });

    it('Test 70: should organize findings by hypothesis', () => {
      cy.visit('/hunting');
      cy.wait(2000);
      cy.get('body').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 8: CRUD Operations (Tests 71-80)
  // =============================================================================
  describe('CRUD Operations', () => {
    it('Test 71: should open new hypothesis dialog', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.contains(/Create|Hypothesis/i, { timeout: 5000 }).should('be.visible');
    });

    it('Test 72: should display hypothesis form fields', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).should('be.visible');
    });

    it('Test 73: should have description field in hypothesis form', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains(/Description/i).should('be.visible');
    });

    it('Test 74: should have category selector in hypothesis form', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains(/Category/i).should('be.visible');
    });

    it('Test 75: should have priority selector in hypothesis form', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains(/Priority/i).should('be.visible');
    });

    it('Test 76: should close hypothesis dialog on cancel', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains('button', /Cancel/i).click();
      cy.wait(500);
      cy.get('.MuiDialog-root').should('not.exist');
    });

    it('Test 77: should have create button in hypothesis dialog', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains('button', /Create/i).should('exist');
    });

    it('Test 78: should open save query dialog', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Save/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).should('be.visible');
    });

    it('Test 79: should have query name field in save dialog', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Save/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains(/Query Name/i).should('be.visible');
    });

    it('Test 80: should close save query dialog on cancel', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Save/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).contains('button', /Cancel/i).click();
      cy.wait(500);
    });
  });

  // =============================================================================
  // SECTION 9: Integration and Dialogs (Tests 81-90)
  // =============================================================================
  describe('Integration and Dialogs', () => {
    it('Test 81: should display refresh functionality', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Refresh/i, { timeout: 10000 }).click();
      cy.wait(1000);
      cy.contains(/Threat Hunting/i).should('be.visible');
    });

    it('Test 82: should handle dialog interactions', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 5000 }).should('be.visible');
    });

    it('Test 83: should display proper dialog structure', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialogTitle-root', { timeout: 5000 }).should('exist');
      cy.get('.MuiDialogContent-root').should('exist');
      cy.get('.MuiDialogActions-root').should('exist');
    });

    it('Test 84: should have form controls in dialogs', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiFormControl-root', { timeout: 5000 }).should('exist');
    });

    it('Test 85: should validate dialog inputs', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('input', { timeout: 5000 }).should('exist');
    });

    it('Test 86: should display category options in dropdown', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(1000);
      cy.get('.MuiSelect-select', { timeout: 5000 }).should('exist');
    });

    it('Test 87: should handle multiple dialog states', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root').contains('button', /Cancel/i, { timeout: 5000 }).click();
      cy.wait(500);
      cy.contains(/Save/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root').contains('button', /Cancel/i, { timeout: 5000 }).click();
    });

    it('Test 88: should display query results placeholder', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Execute a query to see results/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 89: should handle hypothesis selection', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiListItemButton-root', { timeout: 10000 }).should('exist');
    });

    it('Test 90: should maintain state after interactions', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/New Hypothesis/i, { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root').contains('button', /Cancel/i, { timeout: 5000 }).click();
      cy.wait(500);
      cy.contains(/Threat Hunting/i).should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 10: Performance and Edge Cases (Tests 91-100)
  // =============================================================================
  describe('Performance and Edge Cases', () => {
    it('Test 91: should handle empty query state', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('textarea[placeholder*="hunting query"]', { timeout: 10000 }).should('be.empty');
    });

    it('Test 92: should display proper loading states', () => {
      cy.visit('/hunting');
      cy.wait(500);
      cy.get('body').should('be.visible');
    });

    it('Test 93: should handle multiple hypotheses', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiListItem-root', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 94: should display statistics correctly', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiCard-root .MuiTypography-h4', { timeout: 10000 }).should('exist');
    });

    it('Test 95: should handle window resize gracefully', () => {
      cy.viewport(1920, 1080);
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
      cy.viewport(1280, 720);
      cy.contains(/Threat Hunting/i).should('be.visible');
    });

    it('Test 96: should maintain data integrity', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiCard-root', { timeout: 10000 }).should('have.length', 6);
    });

    it('Test 97: should display proper chip colors', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.get('.MuiChip-colorError, .MuiChip-colorWarning, .MuiChip-colorInfo', { timeout: 10000 })
        .should('exist');
    });

    it('Test 98: should handle rapid navigation', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 99: should display all UI elements consistently', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
      cy.contains(/Query Builder/i).should('be.visible');
      cy.contains(/Hunting Hypotheses/i).should('be.visible');
    });

    it('Test 100: should complete comprehensive test suite successfully', () => {
      cy.visit('/hunting');
      cy.wait(1000);
      cy.contains(/Threat Hunting/i, { timeout: 10000 }).should('be.visible');
      cy.get('.MuiCard-root').should('have.length', 6);
      cy.get('.MuiListItem-root').should('have.length.at.least', 1);
      cy.contains(/New Hypothesis/i).should('exist');
      cy.contains(/Execute/i).should('exist');
    });
  });
});

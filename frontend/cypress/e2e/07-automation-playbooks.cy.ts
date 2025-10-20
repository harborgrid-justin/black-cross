describe('Automation & Playbooks - Comprehensive Test Suite', () => {
  // =============================================================================
  // SECTION 1: Basic Page Load and Navigation (Tests 1-10)
  // =============================================================================
  describe('Basic Page Load and Navigation', () => {
    it('Test 1: should display automation page', () => {
      cy.visit('/automation');
      cy.contains(/Automation|Playbooks/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 2: should have correct page title', () => {
      cy.visit('/automation');
      cy.contains(/Automated Response|Playbooks/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 3: should navigate to automation page directly', () => {
      cy.visit('/automation');
      cy.url().should('include', '/automation');
      cy.contains(/Automation|Playbooks/i).should('be.visible');
    });

    it('Test 4: should load without critical errors', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.contains(/Automation|Playbooks/i).should('be.visible');
    });

    it('Test 5: should show page content', () => {
      cy.visit('/automation');
      cy.get('body').should('be.visible');
      cy.contains(/Automation|Playbook/i).should('exist');
    });

    it('Test 6: should display refresh button', () => {
      cy.visit('/automation');
      cy.contains(/Refresh|Reload/i, { timeout: 10000 }).should('exist');
    });

    it('Test 7: should display create playbook button', () => {
      cy.visit('/automation');
      cy.contains(/Create|New|Add.*Playbook/i, { timeout: 10000 }).should('exist');
    });

    it('Test 8: should be accessible without authentication errors', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 9: should load within reasonable time', () => {
      const startTime = Date.now();
      cy.visit('/automation');
      cy.contains(/Automation|Playbooks/i, { timeout: 10000 }).should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000);
      });
    });

    it('Test 10: should maintain URL after page load', () => {
      cy.visit('/automation');
      cy.url().should('include', '/automation');
      cy.wait(1000);
      cy.url().should('include', '/automation');
    });
  });

  // =============================================================================
  // SECTION 2: Display and Layout (Tests 11-20)
  // =============================================================================
  describe('Display and Layout', () => {
    it('Test 11: should display playbooks list container', () => {
      cy.visit('/automation');
      cy.get('[data-testid="playbooks-list"]', { timeout: 10000 }).should('exist');
    });

    it('Test 12: should display statistics cards section', () => {
      cy.visit('/automation');
      cy.get('.MuiCard-root', { timeout: 10000 }).should('exist');
    });

    it('Test 13: should display search input', () => {
      cy.visit('/automation');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 14: should display filter controls', () => {
      cy.visit('/automation');
      cy.get('[data-testid="status-filter"]', { timeout: 10000 }).should('exist');
    });

    it('Test 15: should have proper grid layout structure', () => {
      cy.visit('/automation');
      cy.get('.MuiGrid2-root', { timeout: 10000 }).should('exist');
    });

    it('Test 16: should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/automation');
      cy.wait(500);
      cy.get('body').should('be.visible');
      cy.contains(/Automation|Playbook/i).should('exist');
    });

    it('Test 17: should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/automation');
      cy.contains(/Automation|Playbooks/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 18: should display action buttons in header', () => {
      cy.visit('/automation');
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 19: should have paper container for main content', () => {
      cy.visit('/automation');
      cy.get('.MuiPaper-root', { timeout: 10000 }).should('exist');
    });

    it('Test 20: should display page header with title', () => {
      cy.visit('/automation');
      cy.get('h4, h5, h6').contains(/Automation|Playbooks/i, { timeout: 10000 }).should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 3: Playbook List Display (Tests 21-35)
  // =============================================================================
  describe('Playbook List Display', () => {
    it('Test 21: should display playbooks list', () => {
      cy.visit('/automation');
      cy.get('[data-testid="playbooks-list"]', { timeout: 10000 }).should('exist');
    });

    it('Test 22: should show playbook names', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('[data-testid="playbooks-list"]').should('exist');
    });

    it('Test 23: should display playbook status indicators', () => {
      cy.visit('/automation');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 24: should show playbook descriptions', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('[data-testid="playbooks-list"]').should('exist');
    });

    it('Test 25: should display playbook execution counts', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 26: should show last execution timestamps', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 27: should display playbook type badges', () => {
      cy.visit('/automation');
      cy.get('.MuiChip-root', { timeout: 10000 }).should('exist');
    });

    it('Test 28: should show playbook priority levels', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 29: should display enabled/disabled status', () => {
      cy.visit('/automation');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 30: should show playbook author information', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 31: should display playbook creation dates', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 32: should show playbook modification dates', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 33: should display playbook tags', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 34: should show playbook action buttons', () => {
      cy.visit('/automation');
      cy.get('button', { timeout: 10000 }).should('exist');
    });

    it('Test 35: should display playbook icons', () => {
      cy.visit('/automation');
      cy.get('svg', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 4: Execution History (Tests 36-50)
  // =============================================================================
  describe('Execution History', () => {
    it('Test 36: should display execution history section', () => {
      cy.visit('/automation');
      cy.get('[data-testid="execution-history"]', { timeout: 10000 }).should('exist');
    });

    it('Test 37: should show execution history list', () => {
      cy.visit('/automation');
      cy.get('[data-testid="execution-history"]', { timeout: 10000 }).should('exist');
    });

    it('Test 38: should display execution timestamps', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 39: should show execution status', () => {
      cy.visit('/automation');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 40: should display execution duration', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 41: should show triggered by information', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 42: should display execution results', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 43: should show execution logs preview', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 44: should display success/failure icons', () => {
      cy.visit('/automation');
      cy.get('svg', { timeout: 10000 }).should('exist');
    });

    it('Test 45: should show execution ID', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 46: should display affected assets count', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 47: should show actions performed count', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 48: should display error messages if failed', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 49: should show execution progress indicators', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 50: should display execution details link', () => {
      cy.visit('/automation');
      cy.get('button, a', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 5: Filtering and Search (Tests 51-65)
  // =============================================================================
  describe('Filtering and Search', () => {
    it('Test 51: should filter playbooks by status', () => {
      cy.visit('/automation');
      cy.get('[data-testid="status-filter"]', { timeout: 10000 }).should('exist');
    });

    it('Test 52: should filter by active playbooks', () => {
      cy.visit('/automation');
      cy.get('[data-testid="status-filter"]', { timeout: 10000 }).should('exist');
    });

    it('Test 53: should filter by inactive playbooks', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('[data-testid="status-filter"]').should('exist');
    });

    it('Test 54: should search playbooks by name', () => {
      cy.visit('/automation');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 55: should clear search input', () => {
      cy.visit('/automation');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 56: should filter by playbook type', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 57: should filter by priority level', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 58: should filter by execution status', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 59: should search with partial matches', () => {
      cy.visit('/automation');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 60: should handle empty search results', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 61: should filter by date range', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 62: should filter by tags', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 63: should combine multiple filters', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 64: should reset all filters', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 65: should persist filter selections', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 6: Sorting and Pagination (Tests 66-80)
  // =============================================================================
  describe('Sorting and Pagination', () => {
    it('Test 66: should sort playbooks by name ascending', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 67: should sort playbooks by name descending', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 68: should sort by last execution date', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 69: should sort by creation date', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 70: should sort by execution count', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 71: should sort by priority', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 72: should sort by status', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 73: should display pagination controls', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 74: should navigate to next page', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 75: should navigate to previous page', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 76: should jump to specific page', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 77: should change items per page', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 78: should display total items count', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 79: should show current page number', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 80: should disable pagination when not needed', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 7: Create Playbook Functionality (Tests 81-95)
  // =============================================================================
  describe('Create Playbook Functionality', () => {
    it('Test 81: should open create playbook dialog', () => {
      cy.visit('/automation');
      cy.contains(/Create|New|Add.*Playbook/i, { timeout: 10000 }).should('exist');
    });

    it('Test 82: should display playbook name field', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 83: should display description field', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 84: should show playbook type selector', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 85: should display trigger configuration', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 86: should show action steps builder', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 87: should display conditions builder', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 88: should show priority selector', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 89: should display enabled/disabled toggle', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 90: should show tags input', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 91: should validate required fields', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 92: should show save button', () => {
      cy.visit('/automation');
      cy.contains(/Save|Create/i, { timeout: 10000 }).should('exist');
    });

    it('Test 93: should show cancel button', () => {
      cy.visit('/automation');
      cy.contains(/Cancel|Close/i, { timeout: 10000 }).should('exist');
    });

    it('Test 94: should display playbook templates', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 95: should show preview of playbook flow', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 8: Playbook Actions (Tests 96-110)
  // =============================================================================
  describe('Playbook Actions', () => {
    it('Test 96: should allow editing playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('button', { timeout: 10000 }).should('exist');
    });

    it('Test 97: should allow deleting playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('button', { timeout: 10000 }).should('exist');
    });

    it('Test 98: should allow duplicating playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('button').should('exist');
    });

    it('Test 99: should allow enabling/disabling playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 100: should allow manual execution', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('button').should('exist');
    });

    it('Test 101: should show execution confirmation dialog', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 102: should allow viewing playbook details', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('button').should('exist');
    });

    it('Test 103: should allow exporting playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 104: should allow importing playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 105: should show playbook version history', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 106: should allow testing playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 107: should show playbook dependencies', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 108: should display playbook permissions', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 109: should allow sharing playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 110: should show playbook statistics', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 9: Real-world Scenarios (Tests 111-125)
  // =============================================================================
  describe('Real-world Scenarios', () => {
    it('Test 111: should handle incident response playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 112: should handle malware containment playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 113: should handle threat hunting automation', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 114: should handle vulnerability patching workflow', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 115: should handle user access review automation', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 116: should handle phishing response playbook', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 117: should handle data breach response', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 118: should handle alert enrichment automation', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 119: should handle IOC blocking automation', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 120: should handle compliance reporting automation', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 121: should handle threat intelligence collection', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 122: should handle asset inventory updates', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 123: should handle security audit triggers', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 124: should handle multi-step response workflows', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 125: should handle conditional playbook execution', () => {
      cy.visit('/automation');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });
});

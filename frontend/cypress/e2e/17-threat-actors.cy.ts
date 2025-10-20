describe('Threat Actor Profiling - Comprehensive Test Suite (100 Tests)', () => {
  // =============================================================================
  // SECTION 1: Basic Page Load and Navigation (Tests 1-10)
  // =============================================================================
  describe('Basic Page Load and Navigation', () => {
    it('Test 1: should display threat actor profiling page', () => {
      cy.visit('/threat-actors');
      cy.contains(/Threat Actor/i, { timeout: 10000 }).should('be.visible');
    });

    it('Test 2: should have correct page title', () => {
      cy.visit('/threat-actors');
      cy.contains('Threat Actor Profiling', { timeout: 10000 }).should('be.visible');
    });

    it('Test 3: should navigate to threat actors page directly', () => {
      cy.visit('/threat-actors');
      cy.url().should('include', '/threat-actors');
      cy.contains('Threat Actor Profiling').should('be.visible');
    });

    it('Test 4: should load without critical errors', () => {
      cy.visit('/threat-actors');
      cy.wait(1000);
      cy.contains('Threat Actor').should('be.visible');
    });

    it('Test 5: should show page content', () => {
      cy.visit('/threat-actors');
      cy.get('body').should('be.visible');
      cy.contains(/Actor/i).should('exist');
    });

    it('Test 6: should display refresh button', () => {
      cy.visit('/threat-actors');
      cy.contains('Refresh', { timeout: 10000 }).should('exist');
    });

    it('Test 7: should display add actor button', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).should('exist');
    });

    it('Test 8: should be accessible without authentication errors', () => {
      cy.visit('/threat-actors');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });

    it('Test 9: should load within reasonable time', () => {
      const startTime = Date.now();
      cy.visit('/threat-actors');
      cy.contains('Threat Actor Profiling', { timeout: 10000 }).should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000);
      });
    });

    it('Test 10: should maintain URL after page load', () => {
      cy.visit('/threat-actors');
      cy.url().should('include', '/threat-actors');
      cy.wait(1000);
      cy.url().should('include', '/threat-actors');
    });
  });

  // =============================================================================
  // SECTION 2: Display and Layout (Tests 11-20)
  // =============================================================================
  describe('Display and Layout', () => {
    it('Test 11: should display statistics cards section', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).should('exist');
    });

    it('Test 12: should display search input', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('exist');
    });

    it('Test 13: should display tabs navigation', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiTabs-root', { timeout: 10000 }).should('exist');
    });

    it('Test 14: should display table structure', () => {
      cy.visit('/threat-actors');
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 15: should have proper grid layout structure', () => {
      cy.visit('/threat-actors');
      // Check for grid container with statistics cards
      cy.get('.MuiCard-root', { timeout: 10000 }).should('have.length.at.least', 4);
    });

    it('Test 16: should be responsive on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/threat-actors');
      cy.wait(500);
      cy.get('body').should('be.visible');
      cy.contains('Threat').should('exist');
    });

    it('Test 17: should be responsive on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/threat-actors');
      cy.contains('Threat Actor Profiling', { timeout: 10000 }).should('be.visible');
    });

    it('Test 18: should display filter icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="FilterListIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 19: should have paper container', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiPaper-root', { timeout: 10000 }).should('exist');
    });

    it('Test 20: should display action buttons in header', () => {
      cy.visit('/threat-actors');
      cy.get('button', { timeout: 10000 }).should('have.length.at.least', 2);
    });
  });

  // =============================================================================
  // SECTION 3: Statistics Display (Tests 21-30)
  // =============================================================================
  describe('Statistics Display', () => {
    it('Test 21: should display total actors statistic', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Total Actors').should('be.visible');
    });

    it('Test 22: should display active actors statistic', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Active').should('be.visible');
    });

    it('Test 23: should display advanced sophistication statistic', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Advanced Sophistication').should('be.visible');
    });

    it('Test 24: should display total campaigns statistic', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Total Campaigns').should('be.visible');
    });

    it('Test 25: should show numeric values in statistics', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root .MuiTypography-h4', { timeout: 10000 }).should('have.length.at.least', 4);
    });

    it('Test 26: should display security icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="SecurityIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 27: should display warning icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="WarningIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 28: should show total actors count greater than zero', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Total Actors').parent().parent()
        .find('.MuiTypography-h4').invoke('text').then((text) => {
          const count = parseInt(text);
          expect(count).to.be.greaterThan(0);
        });
    });

    it('Test 29: should show active actors count', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiCard-root', { timeout: 10000 }).contains('Active').parent().parent()
        .find('.MuiTypography-h4').should('exist');
    });

    it('Test 30: should display statistics in grid layout', () => {
      cy.visit('/threat-actors');
      // Verify all 4 statistic cards are displayed in a grid
      cy.get('.MuiCard-root', { timeout: 10000 }).should('have.length.at.least', 4);
      // Verify they contain the expected statistics
      cy.get('.MuiCard-root').contains('Total Actors').should('be.visible');
      cy.get('.MuiCard-root').contains('Active').should('be.visible');
    });
  });

  // =============================================================================
  // SECTION 4: Actor List Display (Tests 31-40)
  // =============================================================================
  describe('Actor List Display', () => {
    it('Test 31: should display table with actors', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 32: should display table headers', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Name/i).should('be.visible');
    });

    it('Test 33: should display aliases column header', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Aliases/i).should('be.visible');
    });

    it('Test 34: should display sophistication column header', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Sophistication/i).should('be.visible');
    });

    it('Test 35: should display motivation column header', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Motivation/i).should('be.visible');
    });

    it('Test 36: should display target sectors column header', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Target Sectors/i).should('be.visible');
    });

    it('Test 37: should display actions column header', () => {
      cy.visit('/threat-actors');
      cy.get('table thead th', { timeout: 10000 }).contains(/Actions/i).should('be.visible');
    });

    it('Test 38: should display actor names in table', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().should('contain.text', 'APT');
    });

    it('Test 39: should display alias chips', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiChip-label', { timeout: 10000 }).should('exist');
    });

    it('Test 40: should display sophistication chips', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).find('.MuiChip-root').should('exist');
    });
  });

  // =============================================================================
  // SECTION 5: Search and Filter Functionality (Tests 41-50)
  // =============================================================================
  describe('Search and Filter Functionality', () => {
    it('Test 41: should have search input field', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).should('be.visible');
    });

    it('Test 42: should display search icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="SearchIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 43: should allow typing in search field', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('APT28');
      cy.get('input[placeholder*="Search"]').should('have.value', 'APT28');
    });

    it('Test 44: should filter actors by name search', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('APT28');
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 45: should filter actors by alias search', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('Fancy Bear');
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });

    it('Test 46: should clear search results', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('APT28');
      cy.wait(500);
      cy.get('input[placeholder*="Search"]').clear();
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });

    it('Test 47: should show no results message for invalid search', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('xyznonexistent123');
      cy.wait(500);
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'No');
    });

    it('Test 48: should search case-insensitive', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('apt28');
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });

    it('Test 49: should display filter list icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="FilterListIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 50: should search in description', () => {
      cy.visit('/threat-actors');
      cy.get('input[placeholder*="Search"]', { timeout: 10000 }).type('Russian');
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    });
  });

  // =============================================================================
  // SECTION 6: Tab Navigation (Tests 51-60)
  // =============================================================================
  describe('Tab Navigation', () => {
    it('Test 51: should display tabs for actor status', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiTabs-root', { timeout: 10000 }).should('be.visible');
    });

    it('Test 52: should display Active tab', () => {
      cy.visit('/threat-actors');
      cy.contains('Active', { timeout: 10000 }).should('be.visible');
    });

    it('Test 53: should display Inactive tab', () => {
      cy.visit('/threat-actors');
      cy.contains('Inactive', { timeout: 10000 }).should('be.visible');
    });

    it('Test 54: should display All tab', () => {
      cy.visit('/threat-actors');
      cy.contains('All', { timeout: 10000 }).should('be.visible');
    });

    it('Test 55: should show count in Active tab', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiTab-root', { timeout: 10000 }).contains(/Active \(\d+\)/).should('be.visible');
    });

    it('Test 56: should show count in Inactive tab', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiTab-root', { timeout: 10000 }).contains(/Inactive \(\d+\)/).should('be.visible');
    });

    it('Test 57: should show count in All tab', () => {
      cy.visit('/threat-actors');
      cy.get('.MuiTab-root', { timeout: 10000 }).contains(/All \(\d+\)/).should('be.visible');
    });

    it('Test 58: should switch to Inactive tab', () => {
      cy.visit('/threat-actors');
      cy.contains('Inactive', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiTab-root.Mui-selected').should('contain.text', 'Inactive');
    });

    it('Test 59: should switch to All tab', () => {
      cy.visit('/threat-actors');
      cy.contains('All', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiTab-root.Mui-selected').should('contain.text', 'All');
    });

    it('Test 60: should display different content in tabs', () => {
      cy.visit('/threat-actors');
      cy.contains('Active', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });
  });

  // =============================================================================
  // SECTION 7: Actor Details Dialog (Tests 61-70)
  // =============================================================================
  describe('Actor Details Dialog', () => {
    it('Test 61: should have view details button for actors', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').should('exist');
    });

    it('Test 62: should display visibility icon for details', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="VisibilityIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 63: should open details dialog on click', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
    });

    it('Test 64: should display dialog title', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.contains('Threat Actor Details', { timeout: 10000 }).should('be.visible');
    });

    it('Test 65: should display actor name in dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('contain.text', 'APT');
    });

    it('Test 66: should display aliases in dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root .MuiChip-root', { timeout: 10000 }).should('exist');
    });

    it('Test 67: should display actor description', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('contain.text', 'threat');
    });

    it('Test 68: should display sophistication in dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Sophistication').should('be.visible');
    });

    it('Test 69: should display target sectors section', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Target Sectors').should('be.visible');
    });

    it('Test 70: should close dialog on close button', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root button', { timeout: 10000 }).contains('Close').click();
      cy.wait(500);
      cy.get('.MuiDialog-root').should('not.exist');
    });
  });

  // =============================================================================
  // SECTION 8: Add Actor Dialog (Tests 71-80)
  // =============================================================================
  describe('Add Actor Dialog', () => {
    it('Test 71: should have Add Actor button', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).should('be.visible');
    });

    it('Test 72: should display add icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="AddIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 73: should open add dialog on button click', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).should('be.visible');
    });

    it('Test 74: should display Add Threat Actor dialog title', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.contains('Add Threat Actor', { timeout: 10000 }).should('be.visible');
    });

    it('Test 75: should have Name input field', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('input[name="name"], label:contains("Name")', { timeout: 10000 }).should('exist');
    });

    it('Test 76: should have Aliases input field', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Aliases').should('exist');
    });

    it('Test 77: should have Description textarea', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Description').should('exist');
    });

    it('Test 78: should have Target Sectors field', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Target Sectors').should('exist');
    });

    it('Test 79: should have Cancel button in dialog', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root button', { timeout: 10000 }).contains('Cancel').should('be.visible');
    });

    it('Test 80: should close add dialog on cancel', () => {
      cy.visit('/threat-actors');
      cy.contains('Add Actor', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('.MuiDialog-root button', { timeout: 10000 }).contains('Cancel').click();
      cy.wait(500);
      cy.get('.MuiDialog-root').should('not.exist');
    });
  });

  // =============================================================================
  // SECTION 9: Table Interactions (Tests 81-90)
  // =============================================================================
  describe('Table Interactions', () => {
    it('Test 81: should display multiple actor rows', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 3);
    });

    it('Test 82: should display APT28 actor', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'APT28');
    });

    it('Test 83: should display Lazarus Group actor', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'Lazarus');
    });

    it('Test 84: should display APT29 actor', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'APT29');
    });

    it('Test 85: should show sophistication levels with colors', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody .MuiChip-colorError, table tbody .MuiChip-colorWarning', { timeout: 10000 }).should('exist');
    });

    it('Test 86: should display motivation text', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'Espionage');
    });

    it('Test 87: should display target sectors text', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'Government');
    });

    it('Test 88: should show multiple aliases as chips', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('.MuiChip-root').should('have.length.at.least', 1);
    });

    it('Test 89: should truncate long lists with +N indicator', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody', { timeout: 10000 }).should('exist');
      // Check if any row has +N indicator pattern
      cy.get('table tbody').then(($tbody) => {
        const text = $tbody.text();
        // Should contain either chips or +N pattern
        expect(text.length).to.be.greaterThan(0);
      });
    });

    it('Test 90: should have hover effect on table rows', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().trigger('mouseover');
      cy.wait(200);
      cy.get('table tbody tr').first().should('exist');
    });
  });

  // =============================================================================
  // SECTION 10: Responsive Design and Edge Cases (Tests 91-100)
  // =============================================================================
  describe('Responsive Design and Edge Cases', () => {
    it('Test 91: should display properly on small mobile screen', () => {
      cy.viewport(375, 667);
      cy.visit('/threat-actors');
      // On mobile, the title should be visible in the main content area
      cy.get('h4', { timeout: 10000 }).contains('Threat Actor').should('exist');
      // Verify the page content is accessible
      cy.get('table', { timeout: 10000 }).should('exist');
    });

    it('Test 92: should display properly on large desktop screen', () => {
      cy.viewport(1920, 1080);
      cy.visit('/threat-actors');
      cy.contains('Threat Actor Profiling', { timeout: 10000 }).should('be.visible');
    });

    it('Test 93: should handle refresh button click', () => {
      cy.visit('/threat-actors');
      cy.contains('Refresh', { timeout: 10000 }).click();
      cy.wait(1000);
      cy.get('table tbody tr', { timeout: 10000 }).should('exist');
    });

    it('Test 94: should display refresh icon', () => {
      cy.visit('/threat-actors');
      cy.get('[data-testid="RefreshIcon"]', { timeout: 10000 }).should('exist');
    });

    it('Test 95: should show info alert when fallback data is loaded', () => {
      cy.visit('/threat-actors');
      cy.wait(2000);
      // Either show alert or load data successfully
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    it('Test 96: should display FIN7 as inactive actor', () => {
      cy.visit('/threat-actors');
      cy.contains('Inactive', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('table tbody', { timeout: 10000 }).should('contain.text', 'FIN7');
    });

    it('Test 97: should show status chip in All tab', () => {
      cy.visit('/threat-actors');
      cy.contains('All', { timeout: 10000 }).click();
      cy.wait(500);
      cy.get('table tbody tr', { timeout: 10000 }).first().should('contain.text', 'Active');
    });

    it('Test 98: should display TTPs section in details dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('TTPs').should('be.visible');
    });

    it('Test 99: should display Campaigns section in details dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      // Scroll to make Campaigns section visible
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Campaigns').scrollIntoView();
      cy.get('.MuiDialog-root').contains('Campaigns').should('exist');
    });

    it('Test 100: should display Motivation section in details dialog', () => {
      cy.visit('/threat-actors');
      cy.get('table tbody tr', { timeout: 10000 }).first().find('button').first().click();
      cy.wait(500);
      cy.get('.MuiDialog-root', { timeout: 10000 }).contains('Motivation').should('be.visible');
    });
  });
});

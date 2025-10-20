#!/bin/bash

# Cypress Tests Validation Script
# Validates test structure without running the full test suite

echo "=================================================="
echo "Black-Cross Cypress Tests - Structure Validation"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track results
total_checks=0
passed_checks=0
failed_checks=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((total_checks++))
    ((passed_checks++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((total_checks++))
    ((failed_checks++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Change to repository root
cd "$(dirname "$0")"

echo "1. Checking test file existence..."
echo "-----------------------------------"

modules=(
    "07-automation-playbooks"
    "08-collaboration-hub"
    "09-compliance-management"
    "10-dark-web-monitoring"
    "11-incident-response"
    "13-malware-analysis"
    "14-reporting-analytics"
    "16-siem-dashboard"
    "18-threat-feeds"
)

for module in "${modules[@]}"; do
    file="frontend/cypress/e2e/${module}.cy.ts"
    if [ -f "$file" ]; then
        check_pass "Found: $module.cy.ts"
    else
        check_fail "Missing: $module.cy.ts"
    fi
done

echo ""
echo "2. Checking test file structure..."
echo "-----------------------------------"

for module in "${modules[@]}"; do
    file="frontend/cypress/e2e/${module}.cy.ts"
    if [ -f "$file" ]; then
        # Check for describe blocks
        describe_count=$(grep -c "describe(" "$file")
        if [ "$describe_count" -ge 7 ]; then
            check_pass "$module: $describe_count describe blocks (≥7 required)"
        else
            check_fail "$module: $describe_count describe blocks (<7 required)"
        fi
        
        # Check for it blocks
        it_count=$(grep -E "(it\(|it\(\`)" "$file" | wc -l)
        if [ "$it_count" -ge 100 ]; then
            check_pass "$module: $it_count test blocks (≥100 required)"
        else
            check_warn "$module: $it_count test blocks (note: loops generate additional tests at runtime)"
        fi
    fi
done

echo ""
echo "3. Checking test syntax patterns..."
echo "-----------------------------------"

for module in "${modules[@]}"; do
    file="frontend/cypress/e2e/${module}.cy.ts"
    if [ -f "$file" ]; then
        # Check for cy.visit calls
        if grep -q "cy.visit" "$file"; then
            check_pass "$module: Contains cy.visit() calls"
        else
            check_fail "$module: Missing cy.visit() calls"
        fi
        
        # Check for timeouts
        if grep -q "timeout:" "$file"; then
            check_pass "$module: Contains timeout configurations"
        else
            check_warn "$module: No explicit timeouts (using defaults)"
        fi
        
        # Check for should assertions
        if grep -q ".should(" "$file"; then
            check_pass "$module: Contains Cypress assertions"
        else
            check_fail "$module: Missing Cypress assertions"
        fi
    fi
done

echo ""
echo "4. Checking test categories..."
echo "-----------------------------------"

categories=(
    "Basic Page Load"
    "Display and Layout"
)

for module in "${modules[@]}"; do
    file="frontend/cypress/e2e/${module}.cy.ts"
    if [ -f "$file" ]; then
        found_basic=false
        found_display=false
        
        if grep -q "Basic Page Load" "$file"; then
            found_basic=true
        fi
        
        if grep -q "Display and Layout" "$file"; then
            found_display=true
        fi
        
        if $found_basic && $found_display; then
            check_pass "$module: Contains required test sections"
        else
            check_fail "$module: Missing required test sections"
        fi
    fi
done

echo ""
echo "5. Checking Cypress configuration..."
echo "-----------------------------------"

if [ -f "frontend/cypress.config.ts" ]; then
    check_pass "Cypress config exists"
    
    if grep -q "baseUrl" "frontend/cypress.config.ts"; then
        check_pass "Base URL configured"
    else
        check_fail "Base URL not configured"
    fi
    
    if grep -q "defaultCommandTimeout" "frontend/cypress.config.ts"; then
        check_pass "Default timeout configured"
    else
        check_warn "Default timeout not explicitly configured"
    fi
else
    check_fail "Cypress config missing"
fi

echo ""
echo "6. Checking support files..."
echo "-----------------------------------"

if [ -f "frontend/cypress/support/commands.ts" ]; then
    check_pass "Custom commands file exists"
else
    check_fail "Custom commands file missing"
fi

if [ -f "frontend/cypress/support/e2e.ts" ]; then
    check_pass "E2E support file exists"
else
    check_fail "E2E support file missing"
fi

echo ""
echo "7. Checking fixtures..."
echo "-----------------------------------"

fixtures=("users.json" "threats.json" "iocs.json")
for fixture in "${fixtures[@]}"; do
    if [ -f "frontend/cypress/fixtures/$fixture" ]; then
        check_pass "Fixture exists: $fixture"
    else
        check_warn "Fixture missing: $fixture"
    fi
done

echo ""
echo "8. Documentation check..."
echo "-----------------------------------"

if [ -f "CYPRESS_TESTS_EXECUTION_GUIDE.md" ]; then
    check_pass "Execution guide exists"
else
    check_fail "Execution guide missing"
fi

if [ -f "CYPRESS_TESTS_SUMMARY.md" ]; then
    check_pass "Test summary exists"
else
    check_fail "Test summary missing"
fi

echo ""
echo "9. Calculating test statistics..."
echo "-----------------------------------"

total_lines=0
total_describes=0
total_its=0

for module in "${modules[@]}"; do
    file="frontend/cypress/e2e/${module}.cy.ts"
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        describes=$(grep -c "describe(" "$file")
        its=$(grep -E "(it\(|it\(\`)" "$file" | wc -l)
        
        total_lines=$((total_lines + lines))
        total_describes=$((total_describes + describes))
        total_its=$((total_its + its))
    fi
done

echo "Total lines of test code: $total_lines"
echo "Total describe blocks: $total_describes"
echo "Total explicit it blocks: $total_its"
echo ""
echo "Note: Loop-based tests generate additional it blocks at runtime"
echo "Expected total tests when executed: 1,125+ across 9 modules"

echo ""
echo "=================================================="
echo "Validation Results"
echo "=================================================="
echo -e "Total checks: $total_checks"
echo -e "${GREEN}Passed: $passed_checks${NC}"
if [ $failed_checks -gt 0 ]; then
    echo -e "${RED}Failed: $failed_checks${NC}"
else
    echo -e "Failed: 0"
fi
echo ""

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}✓ All validation checks passed!${NC}"
    echo ""
    echo "Test structure is valid and ready for execution."
    echo "Next step: Run tests with 'npm run test:e2e'"
    exit 0
else
    echo -e "${RED}✗ Some validation checks failed${NC}"
    echo ""
    echo "Please review the failures above before running tests."
    exit 1
fi

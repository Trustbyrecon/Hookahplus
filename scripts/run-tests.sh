#!/bin/bash

# Hookah+ Test Runner
# Runs all tests across all projects with proper error handling

set -e

echo "🧪 Starting Hookah+ Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests for a project
run_project_tests() {
    local project=$1
    local project_path="apps/$project"
    
    echo -e "\n${YELLOW}Testing $project...${NC}"
    echo "================================"
    
    if [ ! -d "$project_path" ]; then
        echo -e "${RED}❌ Project directory $project_path not found${NC}"
        return 1
    fi
    
    cd "$project_path"
    
    # Run unit tests if they exist
    if [ -f "vitest.config.ts" ] || [ -f "vitest.config.js" ]; then
        echo "Running unit tests..."
        if npm run test -- --run --reporter=verbose; then
            echo -e "${GREEN}✅ Unit tests passed${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}❌ Unit tests failed${NC}"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    fi
    
    # Run E2E tests if they exist
    if [ -f "playwright.config.ts" ] || [ -f "playwright.config.js" ]; then
        echo "Running E2E tests..."
        if npm run test:e2e; then
            echo -e "${GREEN}✅ E2E tests passed${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}❌ E2E tests failed${NC}"
            ((FAILED_TESTS++))
        fi
        ((TOTAL_TESTS++))
    fi
    
    cd - > /dev/null
}

# Run tests for each project
run_project_tests "app"
run_project_tests "guest"
run_project_tests "site"

# Summary
echo -e "\n${YELLOW}Test Summary${NC}"
echo "================================"
echo "Total test suites: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi

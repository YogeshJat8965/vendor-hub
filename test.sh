#!/bin/bash

echo "🧪 Marketplace Application Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Check Node.js
echo "Testing Node.js installation..."
node --version > /dev/null 2>&1
test_result $? "Node.js is installed"

# Test 2: Check Java
echo "Testing Java installation..."
java --version > /dev/null 2>&1
test_result $? "Java is installed"

# Test 3: Check Maven
echo "Testing Maven installation..."
mvn --version > /dev/null 2>&1
test_result $? "Maven is installed"

# Test 4: Check MongoDB
echo "Testing MongoDB connection..."
if command -v mongosh > /dev/null 2>&1; then
    mongosh --eval "db.adminCommand('ping')" mongodb://localhost:27017/marketplace --quiet > /dev/null 2>&1
    test_result $? "MongoDB is running and accessible"
elif docker ps | grep marketplace-mongodb > /dev/null 2>&1; then
    docker exec marketplace-mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1
    test_result $? "MongoDB is running in Docker"
else
    echo -e "${YELLOW}⚠ SKIPPED${NC}: MongoDB not running - Install Docker and run 'docker-compose up -d'"
    echo ""
fi

# Test 5: Frontend build
echo "Testing frontend build..."
cd marketplace-frontend
npm run build > /dev/null 2>&1
test_result $? "Frontend builds successfully"
cd ..

# Test 6: Backend compile
echo "Testing backend compile..."
cd marketplace-backend
mvn clean compile -q > /dev/null 2>&1
test_result $? "Backend compiles successfully"
cd ..

# Test 7: Check for common files
echo "Testing project structure..."
[ -f "docker-compose.yml" ] && [ -f "SETUP.md" ] && [ -f "marketplace-frontend/package.json" ] && [ -f "marketplace-backend/pom.xml" ]
test_result $? "All required project files exist"

# Summary
echo "======================================"
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your application is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start MongoDB: docker-compose up -d (or install MongoDB natively)"
    echo "2. Start backend: cd marketplace-backend && mvn spring-boot:run"
    echo "3. Start frontend: cd marketplace-frontend && npm run dev"
    echo "4. Visit http://localhost:3000"
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    exit 1
fi

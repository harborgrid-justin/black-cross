#!/bin/bash
# Structure Verification Script for Black-Cross

echo "🔍 Verifying Black-Cross Project Structure..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check directories
echo "📁 Checking directory structure..."
dirs=("frontend" "backend" "prisma" "docs")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir/ exists"
    else
        echo -e "${RED}✗${NC} $dir/ missing"
        exit 1
    fi
done
echo ""

# Check key files
echo "📄 Checking key files..."
files=(
    "package.json"
    "README.md"
    "ARCHITECTURE_NEW.md"
    "GETTING_STARTED.md"
    "MIGRATION_GUIDE.md"
    "backend/package.json"
    "backend/README.md"
    "backend/index.js"
    "backend/.env.example"
    "backend/Dockerfile"
    "frontend/package.json"
    "frontend/README.md"
    "frontend/vite.config.ts"
    "frontend/.env.example"
    "frontend/Dockerfile"
    "prisma/schema.prisma"
    "prisma/README.md"
    "docker-compose.yml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        exit 1
    fi
done
echo ""

# Check that old directories are removed
echo "🗑️  Checking old directories removed..."
old_dirs=("client" "src")
for dir in "${old_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${RED}✗${NC} Old directory $dir/ still exists (should be removed)"
        exit 1
    else
        echo -e "${GREEN}✓${NC} Old directory $dir/ properly removed"
    fi
done
echo ""

# Verify package.json structure
echo "📦 Verifying package.json structure..."
if grep -q '"workspaces"' package.json; then
    echo -e "${GREEN}✓${NC} Root package.json has workspaces"
else
    echo -e "${RED}✗${NC} Root package.json missing workspaces"
    exit 1
fi

if grep -q '"frontend"' package.json && grep -q '"backend"' package.json; then
    echo -e "${GREEN}✓${NC} Workspaces include frontend and backend"
else
    echo -e "${RED}✗${NC} Workspaces configuration incomplete"
    exit 1
fi
echo ""

# Check backend structure
echo "🔧 Checking backend structure..."
backend_dirs=("modules" "modules/threat-intelligence" "modules/automation" "modules/risk-assessment")
for dir in "${backend_dirs[@]}"; do
    if [ -d "backend/$dir" ]; then
        echo -e "${GREEN}✓${NC} backend/$dir/ exists"
    else
        echo -e "${RED}✗${NC} backend/$dir/ missing"
        exit 1
    fi
done
echo ""

# Check frontend structure
echo "⚛️  Checking frontend structure..."
frontend_dirs=("src" "src/components" "src/pages" "src/services" "src/store")
for dir in "${frontend_dirs[@]}"; do
    if [ -d "frontend/$dir" ]; then
        echo -e "${GREEN}✓${NC} frontend/$dir/ exists"
    else
        echo -e "${RED}✗${NC} frontend/$dir/ missing"
        exit 1
    fi
done
echo ""

# Check Prisma schema
echo "🗄️  Checking Prisma schema..."
if grep -q "datasource db" prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} Prisma schema has datasource"
else
    echo -e "${RED}✗${NC} Prisma schema missing datasource"
    exit 1
fi

if grep -q "generator client" prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} Prisma schema has generator"
else
    echo -e "${RED}✗${NC} Prisma schema missing generator"
    exit 1
fi

# Count models
model_count=$(grep -c "^model " prisma/schema.prisma)
echo -e "${GREEN}✓${NC} Prisma schema has $model_count models"
echo ""

# Check Docker configuration
echo "🐳 Checking Docker configuration..."
if grep -q "backend:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.yml has backend service"
else
    echo -e "${RED}✗${NC} docker-compose.yml missing backend service"
    exit 1
fi

if grep -q "frontend:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.yml has frontend service"
else
    echo -e "${RED}✗${NC} docker-compose.yml missing frontend service"
    exit 1
fi

if grep -q "DATABASE_URL" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.yml includes DATABASE_URL"
else
    echo -e "${YELLOW}⚠${NC}  docker-compose.yml might be missing DATABASE_URL"
fi
echo ""

# Check .env.example
echo "⚙️  Checking environment configuration..."
if grep -q "DATABASE_URL" .env.example; then
    echo -e "${GREEN}✓${NC} Root .env.example has DATABASE_URL"
else
    echo -e "${RED}✗${NC} Root .env.example missing DATABASE_URL"
    exit 1
fi

if [ -f "backend/.env.example" ]; then
    if grep -q "DATABASE_URL" backend/.env.example; then
        echo -e "${GREEN}✓${NC} Backend .env.example has DATABASE_URL"
    else
        echo -e "${RED}✗${NC} Backend .env.example missing DATABASE_URL"
        exit 1
    fi
fi
echo ""

# Check package.json scripts
echo "📜 Checking npm scripts..."
scripts=("dev" "dev:backend" "dev:frontend" "prisma:generate" "prisma:migrate")
for script in "${scripts[@]}"; do
    if grep -q "\"$script\"" package.json; then
        echo -e "${GREEN}✓${NC} Script '$script' exists in root package.json"
    else
        echo -e "${RED}✗${NC} Script '$script' missing in root package.json"
        exit 1
    fi
done
echo ""

# Summary
echo "════════════════════════════════════════════"
echo -e "${GREEN}✅ All structure verification checks passed!${NC}"
echo "════════════════════════════════════════════"
echo ""
echo "✨ Project structure follows Google engineering best practices:"
echo "   - frontend/  (React + TypeScript)"
echo "   - backend/   (Node.js + Express)"
echo "   - prisma/    (Database schema + ORM)"
echo ""
echo "🚀 Next steps:"
echo "   1. npm run install:all"
echo "   2. npm run prisma:generate"
echo "   3. npm run prisma:migrate"
echo "   4. npm run dev"
echo ""

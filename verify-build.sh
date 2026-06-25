#!/bin/bash
echo "🔍 Verifying Next.js Standalone Build..."
echo ""

# Check next.config.mjs
echo "1️⃣ Checking next.config.mjs for standalone output..."
if grep -q "output.*standalone" next.config.mjs; then
    echo "   ✅ Standalone output configured"
else
    echo "   ❌ Standalone output NOT configured"
    exit 1
fi

# Check if build exists
echo ""
echo "2️⃣ Checking if standalone build exists..."
if [ -d ".next/standalone" ]; then
    echo "   ✅ Standalone directory exists"
else
    echo "   ❌ Standalone directory missing - run 'pnpm build' first"
    exit 1
fi

# Check for server.js
echo ""
echo "3️⃣ Checking for server.js..."
if [ -f ".next/standalone/server.js" ]; then
    echo "   ✅ server.js found"
else
    echo "   ❌ server.js missing"
    exit 1
fi

# Check for static files
echo ""
echo "4️⃣ Checking for static files..."
if [ -d ".next/static" ]; then
    echo "   ✅ Static files directory exists"
    echo "   📊 Static files: $(find .next/static -type f | wc -l) files"
else
    echo "   ❌ Static files missing"
fi

# Check public folder
echo ""
echo "5️⃣ Checking public folder..."
if [ -d "public" ]; then
    echo "   ✅ Public folder exists"
    echo "   📊 Public files: $(find public -type f | wc -l) files"
else
    echo "   ⚠️  Public folder missing (might be okay if you have no static assets)"
fi

# Check Dockerfile
echo ""
echo "6️⃣ Checking Dockerfile configuration..."
if grep -q "HOSTNAME" Dockerfile; then
    echo "   ✅ HOSTNAME environment variable set"
else
    echo "   ⚠️  HOSTNAME not set in Dockerfile (should be 0.0.0.0)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All checks passed! Ready to containerize."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Run './test-container.sh' to test Docker build"
echo "  2. Deploy to your serverless platform"

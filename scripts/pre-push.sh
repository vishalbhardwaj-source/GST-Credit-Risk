#!/bin/sh
# Read and discard git push standard input (<local ref> <local sha> <remote ref> <remote sha>)
cat > /dev/null

echo "🔍 Running comprehensive pre-push test suite..."

# 1. Frontend Vitest unit tests
echo "▶ [1/3] Running Vitest unit test suite..."
cmd.exe /c "npm --prefix vite-app test" </dev/null || {
    echo "❌ Vitest tests failed! Push aborted."
    exit 1
}

# 2. TypeScript and Vite build verification
echo "▶ [2/3] Verifying TypeScript and Vite production build..."
cmd.exe /c "npm --prefix vite-app run build" </dev/null || {
    echo "❌ Production build failed! Push aborted."
    exit 1
}

# 3. Python backend test suite
echo "▶ [3/3] Running Pytest backend test suite..."
python -m pytest tests/ </dev/null || {
    echo "❌ Python tests failed! Push aborted."
    exit 1
}

echo "✅ All tests and builds passed! Proceeding with push."
exit 0

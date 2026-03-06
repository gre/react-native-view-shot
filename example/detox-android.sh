#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo "📦 Checking package.json..."
ls -la package.json

echo "🚀 Starting Metro bundler..."
npm start &
METRO_PID=$!

echo "⏳ Waiting for Metro to start..."
sleep 45

echo "🧪 Running Detox E2E tests..."
export ANDROID_AVD_NAME=test
npm run test:e2e:android
TEST_EXIT_CODE=$?

echo "🛑 Stopping Metro bundler..."
kill $METRO_PID || true
sleep 5

exit $TEST_EXIT_CODE


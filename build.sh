#!/bin/bash
set -e

echo "Building Everspeak Backend for production..."

# Create dist directory
echo "Creating dist directory..."
mkdir -p dist/public

# Copy the working frontend from public/ to dist/public/
echo "Copying frontend files from public/..."
cp -r public/* dist/public/

# Build the backend server
echo "Building backend server..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build complete!"
echo "   - Frontend: dist/public/"
echo "   - Backend: dist/index.js"

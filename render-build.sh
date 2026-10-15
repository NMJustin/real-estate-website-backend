#!/bin/bash

# Render build script for backend
# This script runs migrations during the build process

echo "Starting build process..."

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run database migrations (only in production)
if [ "$NODE_ENV" = "production" ]; then
  echo "Running database migrations..."
  npm run migration:run
fi

echo "Build completed successfully!"

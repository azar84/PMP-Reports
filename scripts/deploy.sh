#!/bin/bash

echo "🚀 Starting deployment process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Deployment process completed!" 
#!/bin/bash
# setup.sh - Environment Initialization Script for Aptitude Platform

echo "🚀 Initializing Aptitude Platform Development Environment..."

# 1. Node Version Check
REQUIRED_NODE_VERSION=18
CURRENT_NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)

if (( CURRENT_NODE_VERSION < REQUIRED_NODE_VERSION )); then
    echo "❌ Error: Node.js version $REQUIRED_NODE_VERSION or higher is required. You have v$CURRENT_NODE_VERSION."
    exit 1
fi
echo "✅ Node.js version compliant (v$CURRENT_NODE_VERSION)."

# 2. Install Dependencies
echo "📦 Installing npm dependencies..."
npm install

# 3. Environment Variables Strategy
if [ ! -f .env ]; then
    echo "🔒 Generating local .env based on template..."
    cat <<EOT > .env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Upstash Redis
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Add secret keys below. DO NOT COMMIT!
EOT
    echo "⚠️  Action Required: Open .env and fill in the secure keys provided by the Backend Lead."
else
    echo "✅ .env file already exists."
fi

echo "🎉 Setup Complete. Run 'npm run dev' to start the development server!"

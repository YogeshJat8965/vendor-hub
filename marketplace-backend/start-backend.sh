#!/bin/bash

cd "$(dirname "$0")"

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
    echo "✅ Loaded environment from .env file"
else
    # Fallback to hardcoded values
    export MONGODB_URI="mongodb+srv://yogeshjat8965_db_user:rSqxEps5KTz7o2Qp@vendorhub.whs5yyc.mongodb.net/marketplace?retryWrites=true&w=majority"
    export JWT_SECRET="ThisIsAVeryLongSecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678"
    export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8085"
fi

echo "🚀 Starting Marketplace Backend..."
echo "📡 MongoDB: Atlas Cloud"
echo "🔑 JWT: Configured"
echo "🌐 CORS: localhost:3000, localhost:8085"
echo ""

# Run the application
mvn spring-boot:run

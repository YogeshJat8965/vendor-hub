#!/bin/bash

# Kill any existing instance
pkill -f marketplace-backend 2>/dev/null
sleep 2

# Set environment variables
export MONGODB_URI='mongodb+srv://yogeshjat8965_db_user:rSqxEps5KTz7o2Qp@vendorhub.whs5yyc.mongodb.net/marketplace?retryWrites=true&w=majority'
export JWT_SECRET='ThisIsAVeryLongSecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong12345678'
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Start server
cd "$(dirname "$0")"
echo "Starting Marketplace Backend..."
echo "MongoDB: Connected to Atlas"
echo "Server: http://localhost:8080"
echo ""

$JAVA_HOME/bin/java -jar target/marketplace-backend-1.0.0.jar

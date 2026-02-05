#!/bin/bash
cd /home/yogesh/Desktop/freelance_Project/marketPlace/marketplace-backend
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Starting Marketplace Backend..."
echo "MongoDB URI: $MONGODB_URI"
echo "Server will run on http://localhost:8080"
echo ""

$JAVA_HOME/bin/java -jar target/marketplace-backend-1.0.0.jar

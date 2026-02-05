#!/bin/bash
export MONGODB_URI="mongodb+srv://yogeshjat8965_db_user:rSqxEps5KTz7o2Qp@vendorhub.whs5yyc.mongodb.net/marketplace"
export JWT_SECRET="your-secret-key-should-be-at-least-256-bits-long-for-hs512-algorithm-security"
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 java -jar target/marketplace-backend-1.0.0.jar

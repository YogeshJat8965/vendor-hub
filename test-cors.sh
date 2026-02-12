#!/bin/bash

echo "🔍 CORS Diagnostic Test"
echo "======================"
echo ""

echo "1️⃣ Testing Backend Health..."
curl -s https://vendor-hub-production-31dd.up.railway.app/api/explore | jq -r 'if type == "array" then "✅ Backend returning data (\(length) vendors)" else "❌ Backend error" end'

echo ""
echo "2️⃣ Testing CORS Headers..."
CORS_RESPONSE=$(curl -I -s https://vendor-hub-production-31dd.up.railway.app/api/explore \
  -H "Origin: https://vendor-hub-f1.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  2>&1)

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    ALLOWED_ORIGIN=$(echo "$CORS_RESPONSE" | grep "Access-Control-Allow-Origin" | cut -d: -f2- | tr -d '\r' | xargs)
    echo "✅ CORS Header Found: Access-Control-Allow-Origin: $ALLOWED_ORIGIN"
else
    echo "❌ CORS Header NOT Found!"
    echo "Response headers:"
    echo "$CORS_RESPONSE"
fi

echo ""
echo "3️⃣ Testing Preflight (OPTIONS)..."
OPTIONS_RESPONSE=$(curl -I -s -X OPTIONS https://vendor-hub-production-31dd.up.railway.app/api/explore \
  -H "Origin: https://vendor-hub-f1.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>&1)

if echo "$OPTIONS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ Preflight working!"
else
    echo "❌ Preflight failing!"
    echo "$OPTIONS_RESPONSE"
fi

echo ""
echo "4️⃣ Railway Environment Check..."
echo "Expected: ALLOWED_ORIGINS=https://vendor-hub-f1.vercel.app"
echo "Verify in Railway Dashboard → Variables tab"

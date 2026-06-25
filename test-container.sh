#!/bin/bash

# Container Testing Script for Next.js Deployment
# This script builds and tests your Docker container locally

set -e

CONTAINER_NAME="nextjs-test-container"
IMAGE_NAME="nextjs-test"
PORT=3000

echo "🧹 Cleaning up old containers and images..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo ""
echo "🏗️  Building Docker image..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Starting container..."
docker run -d --name $CONTAINER_NAME -p $PORT:$PORT $IMAGE_NAME

echo ""
echo "⏳ Waiting for container to start (10 seconds)..."
sleep 10

echo ""
echo "🔍 Checking container status..."
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Container is not running!"
    echo ""
    echo "📋 Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo "✅ Container is running!"
echo ""

echo "🧪 Testing home page (/)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Home page returned 200 OK"
else
    echo "❌ Home page returned $HTTP_STATUS (expected 200)"
    echo ""
    echo "📋 Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo ""
echo "🧪 Testing API health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health)

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health endpoint returned 200 OK"
else
    echo "⚠️  Health endpoint returned $HEALTH_STATUS (this might be expected if you don't have a health endpoint)"
fi

echo ""
echo "📋 Recent container logs:"
echo "----------------------------------------"
docker logs --tail 50 $CONTAINER_NAME
echo "----------------------------------------"

echo ""
echo "✅ Container test completed successfully!"
echo ""
echo "🌐 Your application is running at: http://localhost:$PORT"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker logs -f $CONTAINER_NAME"
echo "   Stop container:   docker stop $CONTAINER_NAME"
echo "   Remove container: docker rm $CONTAINER_NAME"
echo "   Shell access:     docker exec -it $CONTAINER_NAME sh"
echo ""
echo "Press Ctrl+C to stop monitoring, or run 'docker stop $CONTAINER_NAME' to stop the container"

# Optional: Keep script running to show live logs
# Uncomment the next line if you want to follow logs automatically
# docker logs -f $CONTAINER_NAME
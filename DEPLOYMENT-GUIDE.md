# Deployment Troubleshooting Guide - 404 Error Fix

## Problem Summary
Your Next.js application works locally but returns 404 errors on the home page (`/`) when deployed in a containerized serverless environment.

## Root Causes Identified

### 1. **Dockerfile Issues** ✅ FIXED
The original Dockerfile had improper copying of standalone build artifacts. This has been corrected.

### 2. **Missing Standalone Build**
The standalone build must be generated during the Docker build process. Ensure `output: 'standalone'` is in `next.config.mjs` (already configured).

### 3. **Static Files Not Being Served**
Static files from `.next/static` and `public` must be explicitly copied to the correct locations.

## Solution Steps

### Step 1: Verify Your Build Configuration

Ensure `next.config.mjs` has the standalone output:

```javascript
const nextConfig = {
  output: 'standalone', // This is crucial
  // ... other config
}
```

### Step 2: Use the Updated Dockerfile

The Dockerfile has been updated with these critical fixes:

1. Proper user permissions (non-root user)
2. Correct copying of standalone artifacts
3. Proper HOSTNAME environment variable for containerized deployment

### Step 3: Build and Test Locally

```bash
# Clean build
rm -rf .next

# Build the application
pnpm build

# Verify standalone exists
ls -la .next/standalone/

# Test locally with Docker
docker build -t nextjs-app .
docker run -p 3000:3000 nextjs-app
```

Then visit http://localhost:3000

### Step 4: Common Deployment Issues

#### Issue A: ENV Variables Missing
If you use environment variables, ensure they're available at build time OR runtime:

**Build-time variables** (embedded in code):
```dockerfile
# In Dockerfile, before RUN pnpm build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

**Runtime variables**:
```bash
docker run -e DATABASE_URL=xxx -e API_KEY=yyy -p 3000:3000 nextjs-app
```

#### Issue B: Port Binding in Serverless/Container Services
Many serverless platforms require binding to `0.0.0.0` instead of `localhost`:

```dockerfile
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
```

This is already in your updated Dockerfile.

#### Issue C: Health Check Endpoints
If your platform uses health checks, ensure they work:

```bash
curl http://localhost:3000/api/health
```

#### Issue D: Static Asset Paths
If using a CDN or asset prefix, update `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'standalone',
  assetPrefix: process.env.CDN_URL || '',
  // ...
}
```

### Step 5: Platform-Specific Fixes

#### AWS Lambda / AWS App Runner / ECS:
- Ensure health check path is configured (use `/api/health` or create one)
- Verify PORT environment variable matches your service configuration
- Check IAM roles have necessary permissions

#### Google Cloud Run:
- Must listen on `0.0.0.0` (already configured)
- Must listen on port specified by PORT env var (Cloud Run injects this)
- Container must start within 4 minutes

#### Azure Container Apps:
- Similar to Cloud Run - ensure PORT is configurable
- Check ingress configuration matches your exposed port

#### Railway / Render / Fly.io:
- These usually auto-detect Next.js and work out of the box
- Verify build command is `pnpm build` or `npm run build`
- Start command should be `node server.js` (for standalone mode)

## Debugging Commands

### Inside the Container:
```bash
# Get shell access to running container
docker exec -it <container-id> sh

# Check if files exist
ls -la /app
ls -la /app/.next/static
ls -la /app/public

# Check if server is running
ps aux | grep node

# Test the server
wget -O- http://localhost:3000
```

### Check Logs:
```bash
docker logs <container-id>
```

Look for errors like:
- `ENOENT: no such file or directory` - missing files
- `EADDRINUSE` - port already in use
- `Cannot find module` - missing dependencies

## Testing the Container Locally

Create a `test-container.sh` script:

```bash
#!/bin/bash
echo "Building container..."
docker build -t nextjs-test .

echo "Stopping any existing containers..."
docker stop nextjs-test-container 2>/dev/null || true
docker rm nextjs-test-container 2>/dev/null || true

echo "Starting container..."
docker run -d --name nextjs-test-container -p 3000:3000 nextjs-test

echo "Waiting for container to start..."
sleep 5

echo "Testing home page..."
curl -I http://localhost:3000

echo "\nTesting API health..."
curl http://localhost:3000/api/health

echo "\n\nContainer logs:"
docker logs nextjs-test-container

echo "\n\nContainer is running. Visit http://localhost:3000"
echo "To stop: docker stop nextjs-test-container"
```

## Verification Checklist

- [ ] `next.config.mjs` has `output: 'standalone'`
- [ ] Dockerfile uses the updated version with proper COPY commands
- [ ] Build completes without errors (`pnpm build`)
- [ ] `.next/standalone` directory exists after build
- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Home page returns 200 status code
- [ ] Static assets load correctly (check browser dev tools)
- [ ] API routes work (if any)

## Still Having Issues?

### Quick Diagnostic:
```bash
# Build and run, then test
docker build -t debug-next .
docker run -p 3000:3000 debug-next &
sleep 5
curl -v http://localhost:3000
```

If you get:
- **Connection refused**: Container isn't listening on the right port/host
- **404**: Routing issue or missing files
- **500**: Application error (check logs)
- **Empty response**: Server crashed (check logs)

### Advanced Debugging - Multi-stage Verification:

Add to Dockerfile temporarily to verify build artifacts:
```dockerfile
# After the builder stage, before runner stage:
RUN ls -laR /app/.next/standalone
RUN ls -laR /app/.next/static
RUN ls -laR /app/public
```

## Additional Resources

- [Next.js Standalone Output Docs](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Standalone Mode GitHub Discussion](https://github.com/vercel/next.js/discussions/16995)

## Summary

The main fix was updating the Dockerfile to:
1. Properly copy standalone build artifacts
2. Set HOSTNAME to 0.0.0.0 for container networking
3. Use non-root user for security
4. Ensure static files are in the correct locations

Your application should now deploy successfully. If you still experience issues, run through the debugging commands above and check your platform-specific logs.
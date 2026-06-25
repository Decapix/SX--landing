# Quick Fix for 404 Error on Deployment

## TL;DR - What Was Fixed

Your Next.js app was returning 404 on the home page (`/`) when deployed because the Docker container wasn't properly configured for Next.js standalone mode.

## The Fix

Your `Dockerfile` has been updated with these critical changes:

### Before (BROKEN):
```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

### After (FIXED):
```dockerfile
# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy with proper permissions
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"  # ← THIS IS CRITICAL!
EXPOSE 3000
CMD ["node", "server.js"]
```

## Why This Matters

1. **HOSTNAME="0.0.0.0"** - This makes Next.js listen on all network interfaces, not just localhost. In containers, localhost doesn't work properly for external connections.

2. **Proper file permissions** - Using a non-root user is a security best practice and prevents permission issues.

3. **Correct standalone structure** - The files must be copied in the exact order to preserve the standalone build structure.

## Test It Now

```bash
# Make the test script executable
chmod +x test-container.sh

# Run the test
./test-container.sh
```

This will:
- ✅ Build your Docker image
- ✅ Start a container
- ✅ Test the home page
- ✅ Show you the logs

## Deploy It

Now you can deploy with confidence:

```bash
# Build for your platform
docker build -t your-registry/app-name:latest .

# Push to your registry
docker push your-registry/app-name:latest

# Deploy to your serverless platform
# (AWS ECS, Google Cloud Run, Azure Container Apps, etc.)
```

## Key Takeaways

✅ `output: 'standalone'` is already in your `next.config.mjs` (correct)
✅ Dockerfile now properly configured for containerized deployment
✅ `HOSTNAME="0.0.0.0"` is the critical fix for container networking
✅ All static files are copied to correct locations

## Still Getting 404?

If you still see 404 after deploying, check:

1. **Platform health check** - Make sure it's checking `/api/health` or `/`
2. **Port mapping** - Ensure your platform maps to port 3000
3. **Build logs** - Check if the build completed successfully
4. **Container logs** - Look for error messages about missing files

Run `./test-container.sh` locally first to verify everything works before deploying.

## Need More Help?

See `DEPLOYMENT-GUIDE.md` for comprehensive troubleshooting steps.
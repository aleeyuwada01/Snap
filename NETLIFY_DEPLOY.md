# Netlify Deployment Guide

## Quick Deploy

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Supabase integration and Netlify config"
   git push origin main
   ```

2. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select repository: `aleeyuwada01/Snap`
   - Netlify will auto-detect the settings from `netlify.toml`

3. **Configure Environment Variables**
   - In Netlify: Site settings → Environment variables
   - Add the following:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your_anon_key_here
     ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Your site will be live!

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod
```

## Configuration Files Created

### `netlify.toml`
Main configuration file with:
- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ SPA redirect rules (/* → /index.html)
- ✅ Security headers
- ✅ Cache headers for static assets

### `_redirects`
Backup redirect rules (in case netlify.toml redirects don't work)

## Build Settings

**Build command:** `npm run build`
**Publish directory:** `dist`
**Node version:** 18+ (auto-detected)

## Environment Variables

You MUST set these in Netlify Dashboard:

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard → Settings → API |

**Important:** 
- Use the **anon (publishable) key**, NOT the service role key
- Service role keys should never be in client-side code in production

## Post-Deployment

After deployment:

1. **Test the site**
   - Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
   - Complete a login flow
   - Check dashboard at `https://your-site.netlify.app/?dashboard=true`

2. **Verify Supabase connection**
   - Check browser console for errors
   - Verify data appears in Supabase Table Editor

3. **Custom domain (optional)**
   - Netlify Dashboard → Domain settings
   - Add your custom domain

## Automatic Deployments

Once connected to GitHub:
- ✅ Every push to `main` branch triggers auto-deployment
- ✅ Preview deployments for pull requests
- ✅ Rollback capability

## Troubleshooting

### Build fails
- Check environment variables are set
- Verify `package.json` scripts
- Check build logs in Netlify Dashboard

### Site shows blank page
- Check browser console for errors
- Verify redirect rules are working
- Check that `dist` folder contains built files

### Supabase connection errors
- Verify environment variables are correct
- Check CORS settings in Supabase (should auto-allow Netlify domains)
- Ensure you're using the anon key, not service role key

### 404 errors on refresh
- Verify `netlify.toml` redirects are configured
- Check `_redirects` file exists in project root
- Ensure publish directory is set to `dist`

## Performance Optimization

The current setup includes:
- ✅ Long-term caching for static assets (1 year)
- ✅ Security headers
- ✅ Compressed assets (automatic)
- ✅ CDN delivery (automatic)

## Monitoring

Access your site analytics:
- Netlify Dashboard → Site overview
- Analytics tab (if enabled)
- Function logs (if using functions)

## Security Notes

⚠️ **Important for Production:**

1. **Use Anon Key Only**
   - Never use service role key in client-side code
   - Service role bypasses all RLS policies

2. **Implement Proper RLS**
   - Update Supabase RLS policies
   - Don't leave tables wide open (current testing setup)

3. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Use Netlify Edge Functions if needed

4. **Environment Variables**
   - Keep them secure in Netlify Dashboard
   - Never commit them to Git

## Useful Commands

```bash
# Build locally to test
npm run build

# Preview build locally
npm run preview

# Check build output
ls dist/

# Deploy to Netlify (if using CLI)
netlify deploy --prod
```

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase CORS Setup](https://supabase.com/docs/guides/api/cors)

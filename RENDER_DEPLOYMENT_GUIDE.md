# Complete Render Deployment Guide

This guide will walk you through deploying your Merchant Onboarding application on Render. The application consists of three components:
1. **PostgreSQL Database** (managed database)
2. **Backend API** (Node.js/Express server)
3. **Frontend** (React application)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create a Render Account](#step-1-create-a-render-account)
3. [Step 2: Prepare Your Repository](#step-2-prepare-your-repository)
4. [Step 3: Deploy PostgreSQL Database](#step-3-deploy-postgresql-database)
5. [Step 4: Deploy Backend API](#step-4-deploy-backend-api)
6. [Step 5: Deploy Frontend](#step-5-deploy-frontend)
7. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
8. [Step 7: Test Your Deployment](#step-7-test-your-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ A GitHub/GitLab/Bitbucket account with your code pushed to a repository
- ✅ A Stripe account with API keys (test or live keys)
- ✅ Basic knowledge of environment variables
- ✅ Your code is committed and pushed to your remote repository

---

## Step 1: Create a Render Account

### 1.1 Sign Up
1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up using one of these options:
   - GitHub (Recommended - makes repository connection easier)
   - GitLab
   - Email

### 1.2 Verify Your Account
1. Check your email for a verification link
2. Click the link to verify your account
3. Complete your profile setup

### 1.3 Connect Your Repository
1. After signing in, Render will ask to connect to your Git provider
2. Click **"Connect GitHub"** (or your chosen provider)
3. Authorize Render to access your repositories
4. You can choose to grant access to:
   - All repositories
   - Only selected repositories (recommended for security)

---

## Step 2: Prepare Your Repository

### 2.1 Ensure All Files Are Committed
```bash
# Navigate to your project root
cd "/Users/neosoft/Documents/STRIPE-SIMPLY-Pay/Merchant-onboarding /merchant-onboarding"

# Check git status
git status

# Add any uncommitted files
git add .

# Commit changes
git commit -m "Prepare for Render deployment"

# Push to your remote repository
git push origin ssn-fix
```

### 2.2 Create Required Configuration Files

You need to create a few configuration files for Render deployment. These are already set up in your project, but let's verify:

#### Backend Build Script (already configured in server/package.json)
Your server/package.json already has the correct scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## Step 3: Deploy PostgreSQL Database

### 3.1 Create Database Service
1. Log in to your Render Dashboard: [https://dashboard.render.com](https://dashboard.render.com)
2. Click the **"New +"** button in the top right
3. Select **"PostgreSQL"**

### 3.2 Configure Database Settings
Fill in the following information:

| Field | Value | Description |
|-------|-------|-------------|
| **Name** | `merchant-onboarding-db` | Name for your database instance |
| **Database** | `merchant_onboarding` | Database name (default is fine) |
| **User** | `merchant_user` | Database username (or use default) |
| **Region** | Choose closest to you | Select the region nearest to your users |
| **PostgreSQL Version** | 15 or latest | Use the latest stable version |
| **Plan** | Free (or Starter $7/month) | Free plan has limitations but good for testing |

### 3.3 Create Database
1. Click **"Create Database"**
2. Wait 2-3 minutes for the database to be provisioned
3. **IMPORTANT**: Keep this page open - you'll need the connection details

### 3.4 Save Database Credentials
Once the database is created, you'll see connection details. **Save these securely**:

- **Internal Database URL**: `postgresql://...` (used by backend on Render)
- **External Database URL**: `postgresql://...` (for external connections)
- **PSQL Command**: For connecting via terminal

Example connection string format:
```
postgresql://merchant_user:password@dpg-xxxxx-a.oregon-postgres.render.com/merchant_onboarding
```

You'll need:
- `DB_USER`: The username (e.g., `merchant_user`)
- `DB_PASSWORD`: The password (in the connection string)
- `DB_HOST`: The host (e.g., `dpg-xxxxx-a.oregon-postgres.render.com`)
- `DB_NAME`: The database name (e.g., `merchant_onboarding`)
- `DB_PORT`: Usually `5432`

---

## Step 4: Deploy Backend API

### 4.1 Create Web Service for Backend
1. From the Render Dashboard, click **"New +"**
2. Select **"Web Service"**

### 4.2 Connect Your Repository
1. Click **"Connect a repository"**
2. Find and select your repository: `Merchant-onboarding`
3. Click **"Connect"**

### 4.3 Configure Backend Service
Fill in the following settings:

| Field | Value | Description |
|-------|-------|-------------|
| **Name** | `merchant-onboarding-api` | Unique name for your backend |
| **Region** | Same as database | Must match your database region |
| **Branch** | `ssn-fix` (or `main`) | The branch you want to deploy |
| **Root Directory** | `server` | Important: This tells Render where your backend code is |
| **Environment** | `Node` | Render will auto-detect this |
| **Build Command** | `npm install` | Install dependencies |
| **Start Command** | `npm start` | Starts your server with `node server.js` |
| **Plan** | Free (or Starter $7/month) | Free plan sleeps after inactivity |

### 4.4 Add Environment Variables for Backend
Click **"Advanced"** and then **"Add Environment Variable"**. Add these variables:

#### Required Environment Variables:

1. **Database Connection Variables** (from Step 3.4):
   ```
   DB_USER=merchant_user
   DB_PASSWORD=<your_database_password>
   DB_HOST=<your_render_database_host>
   DB_NAME=merchant_onboarding
   DB_PORT=5432
   ```

   Or use the full connection string:
   ```
   DATABASE_URL=<your_internal_database_url>
   ```

2. **Stripe API Keys**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```
   
   ⚠️ **IMPORTANT**: Use test keys for testing, live keys for production

3. **Encryption Key** (for secure data encryption):
   ```
   ENCRYPTION_KEY=<generate_a_32_character_random_string>
   ```
   
   Generate using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Server Configuration**:
   ```
   NODE_ENV=production
   PORT=10000
   ```
   
   Note: Render automatically uses port 10000 for web services

5. **CORS Configuration** (will be updated after frontend deployment):
   ```
   FRONTEND_URL=https://merchant-onboarding-frontend.onrender.com
   ```
   
   ⚠️ You'll update this URL after deploying the frontend

6. **Stripe URLs** (will be updated after frontend deployment):
   ```
   REFRESH_URL=https://merchant-onboarding-frontend.onrender.com/reauth
   RETURN_URL=https://merchant-onboarding-frontend.onrender.com/return
   ```

### 4.5 Create Backend Service
1. Review all settings
2. Click **"Create Web Service"**
3. Render will start building and deploying your backend
4. This process takes 3-5 minutes

### 4.6 Monitor Backend Deployment
1. You'll see real-time logs in the dashboard
2. Look for these success messages:
   ```
   Database connected successfully
   Database tables initialized successfully
   Server is running on port 10000
   ```

3. Once deployed, you'll see a URL like:
   ```
   https://merchant-onboarding-api.onrender.com
   ```

### 4.7 Test Backend API
1. Copy your backend URL
2. Test the health endpoint in your browser:
   ```
   https://merchant-onboarding-api.onrender.com/api/health
   ```
3. You should see:
   ```json
   {
     "status": "OK",
     "timestamp": "2025-10-13T..."
   }
   ```

---

## Step 5: Deploy Frontend

### 5.1 Create Static Site for Frontend
1. From the Render Dashboard, click **"New +"**
2. Select **"Static Site"**

### 5.2 Connect Repository
1. Select your same repository: `Merchant-onboarding`
2. Click **"Connect"**

### 5.3 Configure Frontend Service
Fill in the following settings:

| Field | Value | Description |
|-------|-------|-------------|
| **Name** | `merchant-onboarding-frontend` | Unique name for your frontend |
| **Branch** | `ssn-fix` (or `main`) | Same branch as backend |
| **Root Directory** | `client` | Important: Where your React app is located |
| **Build Command** | `npm install && npm run build` | Install deps and build React app |
| **Publish Directory** | `client/build` | Where the built files are located |

### 5.4 Add Environment Variables for Frontend
Click **"Advanced"** and add these environment variables:

```
REACT_APP_API_BASE_URL=https://merchant-onboarding-api.onrender.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=Merchant Onboarding
REACT_APP_VERSION=1.0.0
```

Replace `https://merchant-onboarding-api.onrender.com` with your actual backend URL from Step 4.6.

### 5.5 Create Frontend Service
1. Review all settings
2. Click **"Create Static Site"**
3. Render will build and deploy your frontend
4. This takes 3-5 minutes

### 5.6 Get Frontend URL
Once deployed, you'll get a URL like:
```
https://merchant-onboarding-frontend.onrender.com
```

---

## Step 6: Configure Environment Variables

### 6.1 Update Backend Environment Variables
Now that you have the frontend URL, go back to your backend service and update the CORS settings:

1. Go to your backend service in Render Dashboard
2. Click **"Environment"** in the left sidebar
3. Update these variables:
   ```
   FRONTEND_URL=https://merchant-onboarding-frontend.onrender.com
   REFRESH_URL=https://merchant-onboarding-frontend.onrender.com/reauth
   RETURN_URL=https://merchant-onboarding-frontend.onrender.com/return
   ```
4. Click **"Save Changes"**
5. Your backend will automatically redeploy with the new settings

### 6.2 Verify All Environment Variables

#### Backend Environment Variables Checklist:
- ✅ `DB_USER` - Database username
- ✅ `DB_PASSWORD` - Database password
- ✅ `DB_HOST` - Database host
- ✅ `DB_NAME` - Database name
- ✅ `DB_PORT` - Database port (5432)
- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key
- ✅ `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- ✅ `ENCRYPTION_KEY` - 32-character random string
- ✅ `NODE_ENV` - production
- ✅ `PORT` - 10000
- ✅ `FRONTEND_URL` - Your frontend URL
- ✅ `REFRESH_URL` - Frontend reauth URL
- ✅ `RETURN_URL` - Frontend return URL

#### Frontend Environment Variables Checklist:
- ✅ `REACT_APP_API_BASE_URL` - Your backend API URL
- ✅ `REACT_APP_ENVIRONMENT` - production
- ✅ `REACT_APP_APP_NAME` - Merchant Onboarding
- ✅ `REACT_APP_VERSION` - 1.0.0

---

## Step 7: Test Your Deployment

### 7.1 Test Backend API
1. Open your backend URL: `https://merchant-onboarding-api.onrender.com/api/health`
2. Verify you get a successful response

### 7.2 Test Frontend
1. Open your frontend URL: `https://merchant-onboarding-frontend.onrender.com`
2. Verify the application loads correctly
3. Check browser console for any errors (F12 → Console)

### 7.3 Test Full Application Flow
1. Navigate to the Stripe Keys Form
2. Try to save Stripe keys (they should save to the database)
3. Navigate to Merchant Onboarding
4. Try creating a test merchant account
5. Verify the account is created in Stripe
6. Test generating an onboarding link

### 7.4 Check Logs
If anything doesn't work:

**Backend Logs:**
1. Go to Render Dashboard → Your backend service
2. Click **"Logs"** tab
3. Look for errors or warnings

**Frontend Build Logs:**
1. Go to Render Dashboard → Your frontend service
2. Click **"Logs"** tab
3. Check for build errors

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Backend Service Fails to Start
**Symptom**: Backend shows "Deploy failed" or crashes immediately

**Solutions**:
1. Check logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure `ROOT_DIRECTORY` is set to `server`
4. Verify `START_COMMAND` is `npm start`
5. Check database connection:
   ```
   Database connection failed
   ```
   → Verify database credentials are correct

#### Issue 2: Frontend Build Fails
**Symptom**: Frontend build shows errors

**Solutions**:
1. Check build logs for specific errors
2. Verify `ROOT_DIRECTORY` is set to `client`
3. Verify `BUILD_COMMAND` is `npm install && npm run build`
4. Ensure `PUBLISH_DIRECTORY` is `client/build`
5. Check for TypeScript errors in logs

#### Issue 3: CORS Errors
**Symptom**: Browser console shows CORS errors like:
```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy
```

**Solutions**:
1. Verify `FRONTEND_URL` in backend matches your actual frontend URL
2. Ensure there are no trailing slashes in URLs
3. Check backend logs to see if requests are reaching the server
4. Redeploy backend after updating CORS settings

#### Issue 4: Database Connection Timeouts
**Symptom**: 
```
Database connection failed: timeout
```

**Solutions**:
1. Ensure backend and database are in the same region
2. Use the **Internal Database URL** (not external) for backend connection
3. Verify database is running (check database service status)
4. Check if database is on free plan (may have connection limits)

#### Issue 5: Free Plan Sleep Issues
**Symptom**: First request takes 30+ seconds

**Explanation**: Render's free plan services sleep after 15 minutes of inactivity

**Solutions**:
1. Upgrade to paid plan ($7/month for always-on service)
2. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes
3. Display a loading message to users on first load

#### Issue 6: Environment Variables Not Working
**Symptom**: App can't connect to database or Stripe

**Solutions**:
1. Go to service → Environment tab
2. Click "Add Environment Variable" for any missing vars
3. After adding/updating variables, click "Manual Deploy" → "Deploy latest commit"
4. Check logs to see if new variables are being used

#### Issue 7: File Upload Issues
**Symptom**: File uploads fail or return 413 errors

**Solutions**:
1. Render has a 100MB request limit for free tier
2. Check your multer configuration in backend
3. Consider using cloud storage (AWS S3, Cloudinary) for files
4. Current code uses base64 encoding which may exceed limits

---

## Post-Deployment

### Custom Domain (Optional)
If you want to use your own domain:

#### For Frontend:
1. Go to your frontend service → Settings
2. Click **"Custom Domain"**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Follow Render's DNS configuration instructions
5. Add DNS records at your domain provider:
   ```
   Type: CNAME
   Name: app (or @)
   Value: merchant-onboarding-frontend.onrender.com
   ```

#### For Backend:
1. Go to your backend service → Settings
2. Click **"Custom Domain"**
3. Add your API domain (e.g., `api.yourdomain.com`)
4. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: merchant-onboarding-api.onrender.com
   ```

5. Update environment variables:
   - Update `REACT_APP_API_BASE_URL` in frontend
   - Update `FRONTEND_URL` in backend
   - Redeploy both services

### SSL/HTTPS
✅ Render automatically provides free SSL certificates for all services
✅ Your app will be accessible via HTTPS

### Auto-Deploy on Git Push
✅ By default, Render auto-deploys when you push to the connected branch

To disable auto-deploy:
1. Go to service → Settings
2. Scroll to **"Auto-Deploy"**
3. Toggle off
4. You'll need to manually click "Deploy" for new changes

### Monitoring and Logs

#### View Real-Time Logs:
1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. See real-time server logs

#### Set Up Alerts:
1. Go to service → Settings
2. Scroll to **"Notifications"**
3. Enable email notifications for:
   - Deploy failures
   - Service crashes
   - Health check failures

### Database Backups

#### Free Plan:
- No automatic backups
- Manual backup: Use `pg_dump` command from connection string

#### Paid Plans ($7+/month):
- Daily automatic backups
- Point-in-time recovery
- Backup retention based on plan

#### Manual Backup Command:
```bash
pg_dump "postgresql://user:pass@host/database" > backup.sql
```

### Performance Optimization

#### 1. Enable Database Connection Pooling
Already configured in your `server/config/database.js`:
```javascript
max: 20, // Maximum connections
idleTimeoutMillis: 30000,
```

#### 2. Add Caching
Consider adding Redis for caching:
1. Render Dashboard → New + → Redis
2. Update backend to use Redis for session storage

#### 3. Optimize Frontend Build
Your React app is already optimized with production build

#### 4. CDN for Static Assets
Render automatically serves static files via CDN

### Scaling

#### Scale Backend:
1. Go to backend service → Settings
2. Under **"Plan"**, upgrade to:
   - Starter: $7/month (512MB RAM, always on)
   - Standard: $25/month (2GB RAM)
   - Pro: $85/month (4GB RAM)

#### Scale Database:
1. Go to database → Settings
2. Upgrade plan for:
   - More storage
   - More connections
   - Better performance
   - Automatic backups

### Security Best Practices

✅ **Use Environment Variables**: Never commit secrets to Git
✅ **Enable 2FA**: On your Render account
✅ **Rotate Keys**: Regularly rotate Stripe API keys and database passwords
✅ **Monitor Logs**: Check for suspicious activity
✅ **Use HTTPS**: Already enabled by default
✅ **Rate Limiting**: Already implemented in your backend
✅ **Input Validation**: Ensure all user inputs are validated

### Updating Your Application

When you need to deploy updates:

#### For Code Changes:
```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin ssn-fix
```

Render will automatically detect the push and redeploy (if auto-deploy is on).

#### For Environment Variable Changes:
1. Update variables in Render Dashboard
2. Click "Save Changes"
3. Service automatically redeploys

#### Manual Deploy:
1. Go to service in Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

---

## Cost Breakdown

### Free Plan:
- ✅ Backend Web Service: Free (sleeps after 15 min inactivity)
- ✅ Frontend Static Site: Free
- ✅ PostgreSQL Database: Free (expires after 90 days)
- **Total: $0/month**
- **Limitations**: Services sleep, no backups, limited resources

### Starter Plan (Recommended):
- Backend Web Service: $7/month
- Frontend Static Site: Free
- PostgreSQL Database: $7/month
- **Total: $14/month**
- **Benefits**: Always on, automatic backups, better performance

### Important Notes:
- Free PostgreSQL expires after 90 days
- Free services sleep after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds to wake up
- Paid plans are always on and have better performance

---

## Quick Reference

### Your Deployed URLs:
- **Frontend**: `https://merchant-onboarding-frontend.onrender.com`
- **Backend**: `https://merchant-onboarding-api.onrender.com`
- **Database**: Internal connection only

### Important Endpoints:
- Health Check: `https://your-backend.onrender.com/api/health`
- Stripe Keys: `https://your-backend.onrender.com/api/stripe/keys`
- Create Account: `https://your-backend.onrender.com/api/stripe/create-account`

### Dashboard Links:
- **Render Dashboard**: https://dashboard.render.com
- **Database Console**: Dashboard → Your database → Connect
- **Logs**: Dashboard → Your service → Logs tab
- **Environment**: Dashboard → Your service → Environment tab

---

## Support and Resources

### Render Documentation:
- **Getting Started**: https://render.com/docs
- **Deploy Node.js**: https://render.com/docs/deploy-node-express-app
- **Deploy React**: https://render.com/docs/deploy-create-react-app
- **Databases**: https://render.com/docs/databases

### Stripe Documentation:
- **Connect Docs**: https://stripe.com/docs/connect
- **API Reference**: https://stripe.com/docs/api

### Get Help:
- **Render Community**: https://community.render.com
- **Render Support**: support@render.com
- **Stripe Support**: https://support.stripe.com

---

## Conclusion

Congratulations! 🎉 You've successfully deployed your Merchant Onboarding application on Render.

### What You've Accomplished:
✅ Deployed a PostgreSQL database
✅ Deployed a Node.js/Express backend API
✅ Deployed a React frontend application
✅ Configured environment variables and CORS
✅ Connected all services together
✅ Secured your application with HTTPS

### Next Steps:
1. Test your application thoroughly
2. Set up monitoring and alerts
3. Consider upgrading to paid plans for production use
4. Add a custom domain (optional)
5. Set up regular database backups
6. Monitor logs for any issues

### Need Help?
If you encounter any issues during deployment, refer to the Troubleshooting section or check the Render documentation. You can also reach out to Render support for assistance.

Happy deploying! 🚀


# Render Deployment Guide - Intern Hub Backend

This guide walks you through deploying the Intern Hub Backend to Render's free tier as a professional developer would.

## 📋 Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] MongoDB Atlas account created (free tier)
- [ ] Render account created (free tier)
- [ ] Cloudinary account created (for image uploads)
- [ ] Gmail app password generated (for email functionality)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Free Tier)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create Cluster**
   - Click "Create a Free Cluster"
   - Choose AWS provider
   - Select a region closest to your users
   - Cluster Tier: M0 Sandbox (Free Forever)
   - Cluster Name: `intern-hub-cluster`

3. **Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Authentication Method: Password
   - Create username and strong password
   - Database User Privileges: Read and write to any database
   - Click "Add User"

4. **Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is necessary for Render to connect
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Databases" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `intern_hub`)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intern_hub?retryWrites=true&w=majority`

---

## 📧 Step 2: Set Up Gmail App Password

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security → 2-Step Verification → Enable it

2. **Generate App Password**
   - Go to Security → 2-Step Verification → App passwords
   - Select app: Mail
   - Select device: Other (Custom name) → "Intern Hub Backend"
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

---

## ☁️ Step 3: Set Up Cloudinary

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy these values:
     - Cloud name
     - API Key
     - API Secret

---

## 🚀 Step 4: Deploy to Render

### Option A: Using Blueprint (Recommended)

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy with Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Grant Render access to your repository
   - Render will automatically detect `Server/render.yaml`
   - Click "Apply"
   - Service name will be: `intern-hub-backend`

### Option B: Manual Web Service Creation

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** intern-hub-backend
     - **Root Directory:** Server
     - **Environment:** Node
     - **Region:** Oregon (Free)
     - **Branch:** main
     - **Build Command:** `npm ci --only=production`
     - **Start Command:** `node server.js`
     - **Plan:** Free

---

## 🔐 Step 5: Configure Environment Variables

In the Render dashboard, go to your service → "Environment" → "Add Environment Variable"

Add the following variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Already set in render.yaml |
| `PORT` | `10000` | Already set in render.yaml |
| `REMOTE_MONGO_URI` | Your MongoDB connection string | From Step 1 |
| `JWT_SECRET` | Random 32+ character string | Generate: `openssl rand -base64 32` |
| `EMAIL_USERNAME` | Your Gmail address | your.email@gmail.com |
| `EMAIL_PASSWORD` | Gmail app password | From Step 2 (16 characters) |
| `CLOUD_NAME` | Cloudinary cloud name | From Step 3 |
| `CLOUD_API_KEY` | Cloudinary API key | From Step 3 |
| `CLOUD_API_SECRET` | Cloudinary API secret | From Step 3 |

**To generate a secure JWT_SECRET on Linux/Mac:**
```bash
openssl rand -base64 32
```

**Or use Node.js:**
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## ✅ Step 6: Verify Deployment

1. **Wait for Build**
   - First deployment takes 2-5 minutes
   - Watch logs in Render dashboard
   - Look for "Build succeeded" message

2. **Get Your Service URL**
   - Found at top of your service page
   - Format: `https://intern-hub-backend.onrender.com`
   - Or: `https://intern-hub-backend-xxxx.onrender.com`

3. **Test Health Endpoint**
   ```bash
   curl https://your-service-name.onrender.com/api/v1/health
   ```
   
   Expected response:
   ```json
   {
     "status": "success",
     "message": "Server is running",
     "timestamp": "2025-10-29T13:02:00.000Z",
     "environment": "production"
   }
   ```

4. **Test Other Endpoints**
   - Use Postman or curl to test your API endpoints
   - Replace `localhost:3000` with your Render URL

---

## 🔄 Step 7: Enable Auto-Deploy (Optional)

1. Go to your service → "Settings"
2. Scroll to "Build & Deploy"
3. Enable "Auto-Deploy" (enabled by default)
4. Now every push to your main branch will auto-deploy

---

## 📊 Monitoring and Maintenance

### View Logs
- Go to your service → "Logs" tab
- Real-time logs show all server activity
- Use for debugging issues

### Free Tier Limitations
- **Sleep after 15 minutes of inactivity**
  - First request after sleep takes ~30 seconds
  - Subsequent requests are fast
- **750 hours/month** of runtime
  - Enough for most projects
  - Service restarts monthly
- **512 MB RAM**
  - Sufficient for most Node.js apps
  - Monitor memory usage in logs

### Keep Service Awake (Optional)
To prevent sleep, you can:
- Use a cron job service (e.g., cron-job.org)
- Ping your health endpoint every 10 minutes
- **Note:** This uses more of your 750 free hours

Example cron-job.org setup:
- URL: `https://your-service.onrender.com/api/v1/health`
- Interval: Every 10 minutes
- HTTP Method: GET

---

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

### Service Won't Start
- Verify environment variables are set correctly
- Check MongoDB connection string format
- Ensure MongoDB Atlas allows connections from 0.0.0.0/0

### Database Connection Errors
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check database username and password in connection string
- Ensure cluster is not paused (free tier auto-pauses after inactivity)

### Email Not Sending
- Verify Gmail app password is correct (no spaces)
- Ensure 2FA is enabled on Gmail account
- Check EMAIL_USERNAME and EMAIL_PASSWORD variables

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Environment variables for secrets (not in code)
- XSS protection middleware
- MongoDB sanitization
- Rate limiting ready (commented in code)
- Production NODE_ENV
- Health check endpoint

🔄 **Consider Adding:**
- Enable rate limiting for production
- Set up CORS whitelist for specific domains
- Implement API key authentication for public endpoints
- Set up monitoring alerts (e.g., Sentry)

---

## 📈 Scaling Beyond Free Tier

When ready to upgrade:
- **Starter Plan ($7/month):** No sleep, custom domains, more resources
- **Standard Plan:** Better performance, more RAM/CPU
- **Professional:** Autoscaling, priority support

---

## 🎉 Success!

Your Intern Hub Backend is now deployed professionally on Render's free tier!

**Next Steps:**
1. Update your frontend to use the new Render URL
2. Test all API endpoints thoroughly
3. Monitor logs for any issues
4. Share your API URL with team members

**Your Live API:** `https://your-service-name.onrender.com`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Happy Deploying! 🚀**

# 🚀 Quick Deploy to Render - TL;DR

## Prerequisites Setup (15 minutes)

### 1. MongoDB Atlas
- Create account: https://www.mongodb.com/cloud/atlas
- Create free cluster → Get connection string
- Format: `mongodb+srv://user:pass@cluster.net/dbname`

### 2. Gmail App Password
- Enable 2FA on Gmail
- Generate app password: Google Account → Security → App passwords
- Save the 16-character password

### 3. Cloudinary
- Create account: https://cloudinary.com
- Copy: Cloud name, API Key, API Secret

---

## Deploy in 3 Steps (5 minutes)

### Step 1: Push to GitHub
```bash
cd /home/abdi/Desktop/projects/Intern_Hub_Backend
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Step 2: Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Select your GitHub repo
4. Click **"Apply"**

### Step 3: Add Environment Variables
In Render dashboard, add these variables:

```
REMOTE_MONGO_URI=mongodb+srv://user:pass@cluster.net/dbname
JWT_SECRET=[generate with: openssl rand -base64 32]
EMAIL_USERNAME=youremail@gmail.com
EMAIL_PASSWORD=[16-char gmail app password]
CLOUD_NAME=[from cloudinary]
CLOUD_API_KEY=[from cloudinary]
CLOUD_API_SECRET=[from cloudinary]
```

---

## Test Deployment

```bash
# Replace with your actual Render URL
curl https://your-service-name.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "environment": "production"
}
```

---

## Done! 🎉

Your API is live at: `https://intern-hub-backend.onrender.com`

**Free Tier Notes:**
- Sleeps after 15 min inactivity (30s wake time)
- 750 hours/month free runtime
- Perfect for development and small projects

**Need help?** See `DEPLOYMENT.md` for detailed guide.

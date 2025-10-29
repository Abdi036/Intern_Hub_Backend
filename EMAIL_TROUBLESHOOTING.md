# Email Configuration Troubleshooting for Render

## The Problem

You're getting `ETIMEDOUT` errors when trying to send emails, even though users are being created. This is because Gmail's SMTP connection is timing out on Render.

---

## ✅ What I've Fixed

1. **Updated `utils/email.js`:**
   - Added explicit SMTP settings (host, port, TLS)
   - Increased timeout values
   - Better connection configuration

2. **Updated `controllers/userController.js`:**
   - Added error handling to signup flow
   - Added error handling to resendOTP flow
   - Users can now signup even if email fails
   - Clear error messages for email issues

---

## 🔍 Root Cause: Gmail SMTP Issues

Gmail's SMTP server is strict and can be blocked by hosting providers. Here's how to fix it:

### Step 1: Verify Gmail App Password

In your Render dashboard, check these environment variables:

1. **EMAIL_USERNAME** - Your full Gmail address (e.g., `youremail@gmail.com`)
2. **EMAIL_PASSWORD** - Your 16-character Gmail app password (NO SPACES!)

**How to generate Gmail App Password:**
```
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already)
3. Go to: https://myaccount.google.com/apppasswords
4. Generate new app password
5. Copy the 16-character password (remove spaces)
6. Update EMAIL_PASSWORD in Render
```

### Step 2: Verify Environment Variables in Render

Go to your Render service → **Environment** tab:

```
EMAIL_USERNAME=your.email@gmail.com    ✓ Full email address
EMAIL_PASSWORD=abcdabcdabcdabcd        ✓ 16 chars, no spaces
```

**Common mistakes:**
- ❌ Using your regular Gmail password (won't work!)
- ❌ Including spaces in app password
- ❌ Wrong email format (needs @gmail.com)

### Step 3: Test Email Configuration

After updating environment variables, **redeploy** your service:
- Click "Manual Deploy" → "Deploy latest commit"
- Wait for deployment to complete (~2 mins)

---

## 🧪 Testing the Fix

### Test 1: Signup with Email
```bash
POST https://your-service.onrender.com/api/v1/user/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "intern"
}
```

**Expected responses:**

**Success (email sent):**
```json
{
  "status": "success",
  "token": "...",
  "message": "OTP sent to your email. Please verify to continue."
}
```

**Success (email failed but account created):**
```json
{
  "status": "success",
  "token": "...",
  "message": "Account created successfully! However, we couldn't send the OTP email. Please use the 'Resend OTP' option.",
  "emailError": true
}
```

### Test 2: Resend OTP
```bash
POST https://your-service.onrender.com/api/v1/user/resend-otp
Content-Type: application/json

{
  "email": "test@example.com"
}
```

---

## 🔧 Alternative: Use a Different Email Service

If Gmail continues to have issues on Render, consider these alternatives:

### Option A: SendGrid (Recommended for Production)
**Free Tier:** 100 emails/day

1. Sign up at https://sendgrid.com
2. Get API key
3. Update `utils/email.js`:

```javascript
const nodemailer = require("nodemailer");
const sgTransport = require('nodemailer-sendgrid-transport');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport(sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  }));

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};
```

4. Add to Render environment:
```
SENDGRID_API_KEY=your_sendgrid_api_key
```

5. Install package:
```bash
npm install nodemailer-sendgrid-transport
```

### Option B: Mailgun
**Free Tier:** 5,000 emails/month

Similar setup, different provider.

### Option C: AWS SES
**Free Tier:** 62,000 emails/month (if on EC2, or 3,000/month otherwise)

More complex but very reliable.

---

## 🐛 Debugging Steps

### 1. Check Render Logs
Go to your service → **Logs** tab and look for:

```
Email sending failed: Error: connect ETIMEDOUT
```

This confirms it's a connection timeout.

### 2. Test Email Credentials Locally

Create a test file `test-email.js`:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready');
  }
});
```

Run locally:
```bash
cd Server
node test-email.js
```

### 3. Check Gmail "Less Secure Apps"

Gmail sometimes blocks connections even with app passwords:
1. Go to https://myaccount.google.com/lesssecureapps
2. If available, turn it ON
3. Note: This is being phased out, app passwords are preferred

---

## 📊 Current Behavior After Fix

| Scenario | Result | User Experience |
|----------|--------|-----------------|
| Email sends successfully | 201 success | ✅ User gets OTP in email |
| Email fails | 201 success | ⚠️ User notified, can use "Resend OTP" |
| Signup fails | 400/500 error | ❌ User not created |

---

## ✨ Immediate Next Steps

1. **Verify Gmail credentials in Render dashboard**
2. **Redeploy your service** (Manual Deploy button)
3. **Test signup endpoint**
4. **Check Render logs** for detailed error messages

If Gmail continues to fail, switch to SendGrid (recommended).

---

## 📞 Still Having Issues?

Common fixes:
1. Regenerate Gmail app password
2. Remove all spaces from app password
3. Use SendGrid instead of Gmail
4. Check Render logs for specific error messages
5. Verify 2FA is enabled on Gmail

---

## 🎯 Quick Checklist

- [ ] 2FA enabled on Gmail
- [ ] App password generated (16 characters)
- [ ] EMAIL_USERNAME in Render (full email)
- [ ] EMAIL_PASSWORD in Render (no spaces)
- [ ] Service redeployed after adding variables
- [ ] Tested signup endpoint
- [ ] Checked Render logs for errors

---

**Remember:** The code now handles email failures gracefully, so users can still sign up even if email doesn't work!

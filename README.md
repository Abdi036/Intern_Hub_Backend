# Intern_Hub Backend

A backend service for the Intern_Hub application, designed to connect interns and companies, manage internship opportunities, and streamline the internship experience.

---

## Project Overview

The Intern_Hub backend is built with modern technologies:

- **Backend:** Node.js with Express  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Containerization:** Docker

---

## Setup Instructions

### Prerequisites

- Docker & Docker Compose installed  
- (Optional) Node.js (v14 or higher) & npm (if running locally without Docker)  
- MongoDB instance (local or cloud, e.g. MongoDB Atlas)

---

### Running with Docker

1. Clone the repository:

    ```bash
    git clone https://github.com/Abdi036/Intern_Hub_Backend.git
    cd Intern_Hub_Backend
    ```

2. Create a `.env` file inside the `Server/` directory with your environment variables.

    Example `.env` file:

    ```env
    PORT=XXXX
    NODE_ENV=XXXXXXXX
    REMOTE_MONGO_URI=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    # Email Configuration (Gmail)
    EMAIL_USERNAME=XXXXXXXXXXXXXXXXXX
    EMAIL_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXX

    # Cloudinary
    CLOUD_NAME=XXXXXXXXXXXXXXXXXXXX
    CLOUD_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
    CLOUD_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXX
    ```

3. Build and start the containers:

    ```bash
    docker-compose up --build
    ```

4. The backend server will be running at:

    ```
    http://localhost:XXXXX
    ```

---

### Running Locally (Without Docker)

1. Navigate to the Server directory:

    ```bash
    cd Server
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file with your environment variables.

4. Start the server:

    ```bash
    npm start
    ```

---

## Features

- User authentication and authorization  
- Profile management  
- Internship posting and application system  
- File upload functionality  
- Search and filter capabilities  

---

## Deployment to Render (Free Tier)

### Prerequisites for Deployment

- GitHub account with this repository pushed  
- Render account (sign up at [render.com](https://render.com))  
- MongoDB Atlas account for cloud database

### Step-by-Step Deployment Guide

1. **Prepare MongoDB Database**

   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database`)
   - Whitelist all IPs (0.0.0.0/0) for Render to connect

2. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

3. **Deploy on Render**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file
   - Click **"Apply"**

4. **Set Environment Variables**

   In the Render dashboard, go to your service and add these environment variables:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `REMOTE_MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.net/db` |
   | `JWT_SECRET` | Secret key for JWT tokens | Generate a random 32+ character string |
   | `EMAIL_USERNAME` | Gmail address for sending emails | `youremail@gmail.com` |
   | `EMAIL_PASSWORD` | Gmail app password | Get from Google Account settings |
   | `CLOUD_NAME` | Cloudinary cloud name | From Cloudinary dashboard |
   | `CLOUD_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
   | `CLOUD_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |

5. **Verify Deployment**

   - Wait for the build to complete (~2-5 minutes)
   - Your service will be available at: `https://intern-hub-backend.onrender.com`
   - Test health endpoint: `https://your-service.onrender.com/api/v1/health`

### Important Notes for Free Tier

- **Spin-down after inactivity:** Free tier services sleep after 15 minutes of inactivity and take ~30 seconds to wake up on the first request
- **750 hours/month:** Free tier includes 750 hours of runtime per month
- **Database:** Use MongoDB Atlas free tier (512MB storage)
- **Environment:** Automatically set to `production` via `render.yaml`

### Monitoring Your Deployment

- **Logs:** View real-time logs in Render dashboard
- **Health Check:** Endpoint at `/api/v1/health` monitors service status
- **Metrics:** Basic metrics available in Render dashboard

---

## Technologies Used

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  
- JWT Authentication  
- Docker  

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

## 📞 Contact

For any questions or concerns, please open an issue in the repository.

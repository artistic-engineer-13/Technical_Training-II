# FreshCart Production Deployment Guide

This guide describes how to deploy the FreshCart backend API server and React frontend client to cloud hosting environments (such as Render, Vercel, and MongoDB Atlas).

---

## 🗄 Step 1: Provision MongoDB Atlas Cluster

1.  Sign in or register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Database Shared Cluster (Free Tier) and select your cloud provider and region.
3.  Under **Network Access**, add a whitelist entry for IP address `0.0.0.0/0` to allow connections from any hosting provider.
4.  Under **Database Access**, create a user account with read/write privileges.
5.  Retrieve your cluster MongoDB connection URL:
    *   Click **Connect** -> **Connect your application**.
    *   Copy the URI string (e.g., `mongodb+srv://<db_username>:<password>@cluster0.xxx.mongodb.net/freshcart?retryWrites=true&w=majority`).

---

## ☁ Step 2: Deploy Backend API Server to Render

Render is an excellent, developer-friendly hosting choice for Express/Node servers.

1.  Connect your GitHub repository to [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Configure Web Service Settings:
    *   **Name**: `freshcart-api`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Region**: Select the closest region to your customers.
4.  Configure **Environment Variables**:
    *   `NODE_ENV` = `production`
    *   `MONGO_URI` = *(your MongoDB Atlas URI)*
    *   `JWT_SECRET` = *(generate a secure 32-character key string)*
    *   `JWT_EXPIRE` = `30d`
    *   `JWT_COOKIE_EXPIRE` = `7`
    *   `FRONTEND_URL` = *(the URL where you will host your React frontend client, e.g., `https://freshcart.vercel.app`)*
    *   *Add email configs (`SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`)*
    *   *Add Cloudinary keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)*
    *   *Add gateway keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY`)*
5.  Deploy the service. Copy the URL (e.g., `https://freshcart-api.onrender.com`).

---

## 💳 Step 3: Register Stripe Webhooks

Stripe requires webhooks to capture checkout sessions asynchronously.

1.  In your Stripe Developer Dashboard, navigate to **Webhooks** -> **Add endpoint**.
2.  Configure Endpoint Details:
    *   **Endpoint URL**: `https://your-backend-url.onrender.com/api/payments/webhook`
    *   **Events to send**: Select `checkout.session.completed`.
3.  Retrieve your **Webhook Signing Secret** (e.g., `whsec_xxx`).
4.  Add this secret value as `STRIPE_WEBHOOK_SECRET` in your backend Render Web Service environment configurations and re-deploy.

---

## 💻 Step 4: Deploy Frontend Client to Vercel

Vercel provides performance optimization and edge routing for Vite-based React client applications.

1.  Sign in or register at [Vercel](https://vercel.com).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  Configure Build Settings:
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Configure **Environment Variables**:
    *   `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
6.  Deploy the client. Vercel will build the React bundles and host them under an SSL-enabled domain name (e.g., `https://freshcart.vercel.app`).
7.  Update your backend environment configuration `FRONTEND_URL` on Render to match your Vercel client domain name.

---

## 🔒 Step 5: CORS and SSL Post-Deployment Auditing

1.  Ensure all API communication uses HTTPS (`https://`).
2.  Confirm that credentials support (`withCredentials: true`) functions properly. Since the frontend and backend are hosted on separate domains, JWT cookies require the following cookie configuration adjustments in `backend/controllers/authController.js` for production:
    ```javascript
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: true,   // Required for cross-site cookie transfers
      sameSite: 'none' // Required for cross-site cookies
    };
    ```
    This ensures that modern browser security blocks do not interrupt user logins.

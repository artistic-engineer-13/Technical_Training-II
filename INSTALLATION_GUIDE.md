# FreshCart Installation Guide

This guide details the steps required to set up, seed, and run the FreshCart MERN Stack application locally.

---

## 📋 Prerequisites

Before proceeding, ensure you have the following installed on your system:
1.  **Node.js** (v18.x or v20.x recommended)
2.  **npm** (v9.x or later)
3.  **MongoDB** (Local Community Server instance running on port `27017` or a MongoDB Atlas Database cluster URI)

---

## 🛠 Step 1: Configure Backend Environment

1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Duplicate the `.env.example` file and save it as `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Open the newly created `.env` file and replace the placeholder credentials with your configuration:
    *   Set `MONGO_URI` to your MongoDB database connection string.
    *   Provide app-specific passwords for `SMTP_EMAIL` and `SMTP_PASSWORD` if using Gmail SMTP services.
    *   Input API keys for `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
    *   Set payment credentials for Razorpay (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) and Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).

---

## 📦 Step 2: Install Backend Dependencies

Inside the `backend/` folder, run:
```bash
npm install
```
This installs the required runtime modules (Express, Mongoose, Socket.io, Multer, Cloudinary, Joi, bcrypt, jsonwebtoken, nodemailer, pdfkit, cors, helmet, express-rate-limit).

---

## 🗄 Step 3: Run Database Seeder

To prepopulate the database collections with mock categories, fresh grocery products, coupon codes, and role-based testing accounts:
```bash
node seeder.js
```
**Default Testing Accounts Seeded:**
*   **Admin Console**:
    *   Email: `admin@freshcart.com`
    *   Password: `password123`
*   **Customer Storefront**:
    *   Email: `customer@freshcart.com`
    *   Password: `password123`
*   **Delivery Rider Dashboard**:
    *   Email: `rider@freshcart.com`
    *   Password: `password123`

---

## 💻 Step 4: Install Frontend Dependencies

1.  Navigate to the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install client node packages:
    ```bash
    npm install
    ```
    This installs React 19, Redux Toolkit, React Router, Axios, Tailwind CSS v3, Framer Motion, Chart.js, and React Icons.
3.  (Optional) Create a `.env` configuration file in `frontend/` directory and append:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

---

## 🚀 Step 5: Start Local Development Runtimes

### 1. Launch Backend Server
Inside the `backend/` directory:
```bash
npm run dev
```
*(Uses nodemon to auto-reload upon code modifications)*
*   The server will start listening at `http://localhost:5000`.
*   Websockets listener will listen on the same server instance.

### 2. Launch Frontend Client
Inside the `frontend/` directory:
```bash
npm run dev
```
*   Vite will start the client server (default is `http://localhost:5173`).
*   Open the link in your browser to load the FreshCart storefront interface.

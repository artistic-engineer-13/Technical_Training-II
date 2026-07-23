# FreshCart Integration & Testing Guide

This guide outlines step-by-step validation procedures to test every module of the FreshCart grocery system.

---

## 🔒 Test 1: User Account & Onboarding Lifecycle

### 1. Account Creation (Sign Up)
1.  Open the register interface `/register`.
2.  Input details, select role `Customer`, and click **Sign Up**.
3.  Verify:
    *   The request successfully registers the user and logs them in automatically (cookie/JWT session issued).
    *   The frontend immediately redirects you to the storefront homepage `/`.
    *   The Navbar updates to show your user profile avatar icon.

### 2. Login & Session Creation
1.  Open the login screen `/login`.
2.  Input the credentials of the registered customer account.
3.  Verify:
    *   The response redirects you to the storefront homepage `/`.
    *   Verify developer tool cookie records: check that a JWT token cookie is successfully issued.
    *   The Navbar displays your logged-in session profile.

---

## 🛒 Test 2: Shopping Cart & Coupon Deductions

1.  Open the storefront homepage.
2.  Search for items (e.g., input "Fresh Tomato").
3.  Click the **ADD** button on a card. Verify the card updates to show increment/decrement `+`/`-` controls.
4.  Increase the quantity to 3. Verify the cart badge on the Navbar updates to show `3` items.
5.  Click the Cart icon on the Navbar to open `/cart`.
6.  Verify the billing section correctly aggregates the subtotal, GST (5%), and delivery fees (Rs. 40 if subtotal < Rs. 500).
7.  Click **Proceed to Checkout**.
8.  Input a mock promo coupon code `WELCOME50` (or select from seed configurations).
9.  Click **Apply**. Verify the bill total decreases dynamically.

---

## 💳 Test 3: Checkout Transactions Verification

### 1. Cash On Delivery (COD) Flow
1.  On the checkout screen `/checkout`, select your delivery address and choose payment option **COD**.
2.  Click **Place Order**.
3.  Verify:
    *   The client is redirected to `/order-success?orderId=...`.
    *   The page displays a green tick, billing details, and a **Secure Handover OTP** (6-digit passcode).

### 2. Stripe Payment Redirect
1.  Add items to the cart, navigate to `/checkout`, and choose **Stripe**.
2.  Click **Place Order**.
3.  Verify:
    *   The browser redirects you to the secure Stripe Checkout Hosted payment page.
    *   Complete transaction with a Stripe test card (e.g., input `4242 4242 4242 4242` with any expiry date and CVV code).
    *   Upon successful payment, Stripe redirects you back to Vercel/localhost `/order-success?orderId=...`.

---

## 📊 Test 4: Admin Management Console

1.  Log in as the administrator using the seed account (`admin@freshcart.com` / `password123`).
2.  Verify:
    *   You are redirected to `/admin/dashboard`.
    *   Chart.js renders monthly sales trend graphs.
    *   Recent orders and low stock warning lists are displayed.
3.  Navigate to **Products Inventory** on the sidebar.
4.  Click **Add Product**. Fill in details, select a category, and upload a test image.
5.  Click **Save Product**. Verify the product is immediately added to the data table.
6.  Navigate to **Customer Orders** on the sidebar.
7.  Verify that your test order is listed. Click **Assign Rider** icon. Choose an available delivery partner (`rider@freshcart.com`) and click assign.

---

## 🚴 Test 5: Delivery Partner Tracking & GPS Simulator

1.  Log in using the seed delivery partner account (`rider@freshcart.com` / `password123`).
2.  Verify:
    *   You are redirected to `/delivery/dashboard`.
    *   Toggle your status to **🟢 Online (Available)**.
    *   The active order assigned by the admin is displayed under active tasks.
3.  Click **Start Delivery Route**. Verify the status transitions to `Out for Delivery`.
4.  Under the **GPS Location Simulator** section:
    *   Click **North (↑)** or **East (→)** multiple times.
    *   Verify that simulated coordinate coordinates adjust in the emulator panel.
5.  Simultaneously, open the customer page `/order-success?orderId=...` in a separate browser window.
6.  Verify that the customer storefront tracking timeline updates to `Out for Delivery`, and the live GPS tracking panel displays the coordinates updating in real time.
7.  On the rider dashboard, click **Arrived - Verify OTP**.
8.  Input the 6-digit OTP code shown on the customer's `/order-success` screen.
9.  Click **Confirm Delivery**.
    *   Verify:
        *   Rider dashboard displays: "Order successfully delivered".
        *   Customer storefront updates order status to `Delivered`.

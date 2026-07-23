# FreshCart API Documentation

All request URLs start with the base path `/api`. Authentication tokens are carried securely in HttpOnly cookies named `token`, or via Authorization bearer headers (`Authorization: Bearer <token>`).

---

## 🔒 Authentication & Account Directory

### 1. Register User Profile
*   **Endpoint**: `POST /api/auth/register`
*   **Access**: Public
*   **Request Payload**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "9876543210",
      "password": "password123",
      "role": "Customer" // "Customer" or "DeliveryPartner"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOi...",
      "user": {
        "id": "65b9c...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "9876543210",
        "role": "Customer",
        "isVerified": true
      }
    }
    ```

### 2. Log In (Session Creation)
*   **Endpoint**: `POST /api/auth/login`
*   **Access**: Public
*   **Request Payload**:
    ```json
    {
      "email": "jane@example.com",
      "password": "password123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOi...",
      "user": {
        "id": "65b9c...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "9876543210",
        "role": "Customer",
        "isVerified": true
      }
    }
    ```

### 4. Forgot Password Recovery
*   **Endpoint**: `POST /api/auth/forgot-password`
*   **Access**: Public
*   **Request Payload**:
    ```json
    {
      "email": "jane@example.com"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": "Email sent successfully"
    }
    ```

### 5. Reset Password
*   **Endpoint**: `PUT /api/auth/reset-password/:token`
*   **Access**: Public
*   **Request Payload**:
    ```json
    {
      "password": "newpassword123"
    }
    ```
*   **Response (200 OK)**: Matches Log In response shape.

### 6. Address Book Directory Management
*   **Endpoints**:
    *   `GET /api/auth/addresses` — List saved addresses (Private)
    *   `POST /api/auth/addresses` — Save new address (Private)
    *   `DELETE /api/auth/addresses/:id` — Delete address (Private)
*   **Post Payload**:
    ```json
    {
      "name": "Home Address",
      "phone": "9876543210",
      "streetAddress": "123 Green Valley Apt",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "country": "India",
      "isDefault": true
    }
    ```

---

## 🍎 Catalog Inventory

### 1. Retrieve Active Categories
*   **Endpoint**: `GET /api/categories`
*   **Access**: Public
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "count": 4,
      "data": [
        {
          "_id": "65b9c...",
          "name": "Fruits & Vegetables",
          "slug": "fruits-vegetables",
          "description": "Fresh organic farm produce",
          "image": "https://cloudinary.com/..."
        }
      ]
    }
    ```

### 2. Search & Filter Products Catalog
*   **Endpoint**: `GET /api/products`
*   **Access**: Public
*   **Query Parameters**:
    *   `search`: Text keyword search
    *   `category`: Category slug filter
    *   `isVeg`: filter `true` for Veg items only
    *   `priceMin`: Minimum price bound
    *   `priceMax`: Maximum price bound
    *   `sort`: `priceAsc`, `priceDesc`, `rating`, or `newest`
    *   `page`: Page offset index
    *   `limit`: Items count per page
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "count": 1,
      "totalCount": 15,
      "pagination": { "next": { "page": 2, "limit": 10 } },
      "data": [
        {
          "_id": "65b9d...",
          "name": "Fresh Organic Apple",
          "brand": "FreshFarm",
          "price": 180,
          "discountPrice": 150,
          "stock": 45,
          "unit": "1 kg",
          "isVeg": true,
          "images": ["https://cloudinary.com/..."]
        }
      ]
    }
    ```

---

## 🛒 Shopping Basket & Wishlists

### 1. Fetch Cart Items
*   **Endpoint**: `GET /api/cart`
*   **Access**: Private (Customer)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "65b9c...",
        "items": [
          {
            "productId": { "_id": "65b9d...", "name": "Fresh Organic Apple", "images": [...] },
            "quantity": 2,
            "price": 150
          }
        ],
        "totalQuantity": 2,
        "subtotal": 300
      }
    }
    ```

### 2. Add / Update Cart Item
*   **Endpoint**: `POST /api/cart`
*   **Access**: Private (Customer)
*   **Request Payload**:
    ```json
    {
      "productId": "65b9d...",
      "quantity": 3
    }
    ```

---

## 📋 Checkouts & Payments

### 1. Place Order
*   **Endpoint**: `POST /api/orders`
*   **Access**: Private (Customer)
*   **Request Payload**:
    ```json
    {
      "items": [
        { "productId": "65b9d...", "quantity": 2 }
      ],
      "shippingAddress": {
        "name": "John Doe",
        "phone": "9876543210",
        "streetAddress": "123 Lane",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560001",
        "country": "India"
      },
      "paymentMethod": "COD", // "COD", "Razorpay", or "Stripe"
      "couponCode": "WELCOME50" // Optional
    }
    ```

### 2. Stream Sales PDF Receipt
*   **Endpoint**: `GET /api/orders/:id/invoice`
*   **Access**: Private (Customer / Admin)
*   **Response**: Binary PDFKit stream data.

### 3. Stripe Checkout Session Creation
*   **Endpoint**: `POST /api/payments/stripe/checkout`
*   **Access**: Private (Customer)
*   **Request Payload**: `{ "orderId": "65b9f..." }`
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "sessionUrl": "https://checkout.stripe.com/c/pay/cs_test...",
        "sessionId": "cs_test..."
      }
    }
    ```

---

## 📊 Administration Control Panel

### 1. Analytics & Metrics Dashboard
*   **Endpoint**: `GET /api/admin/dashboard`
*   **Access**: Private (Admin)
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "kpis": { "totalRevenue": 245000, "totalOrders": 120, "totalCustomers": 95, "totalPartners": 12 },
        "recentOrders": [...],
        "lowStockProducts": [...],
        "topProducts": [...],
        "monthlySales": [ { "month": "July 2026", "revenue": 14000 } ]
      }
    }
    ```

### 2. Download CSV Business Ledger Statement
*   **Endpoint**: `GET /api/admin/reports?startDate=2026-07-01&endDate=2026-07-31`
*   **Access**: Private (Admin)
*   **Response**: Text CSV ledger stream.

---

## 🚴 Delivery Partner Console

### 1. Active Task Sheet list
*   **Endpoint**: `GET /api/delivery/tasks`
*   **Access**: Private (Delivery Partner)
*   **Response (200 OK)**: Returns assigned task lists.

### 2. Update Delivery Status or Verify Customer OTP
*   **Endpoint**: `PUT /api/delivery/tasks/:orderId`
*   **Access**: Private (Delivery Partner)
*   **Request Payload (State Updates)**:
    ```json
    {
      "status": "Out for Delivery"
    }
    ```
*   **Request Payload (Delivery Finalization)**:
    ```json
    {
      "status": "Delivered",
      "otp": "123456"
    }
    ```

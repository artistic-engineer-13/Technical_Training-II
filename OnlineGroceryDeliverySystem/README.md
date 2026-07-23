# FreshCart - MERN E-Grocery Delivery System

FreshCart is a production-ready, hyper-local MERN stack (MongoDB, Express, React, Node.js) grocery delivery system. It features JWT-based role authorizations (Customer, Admin, and Delivery Partner), persistent checkout baskets, dual payment gateway integrations (Razorpay and Stripe), real-time WebSockets order tracking, sales chart aggregations, and secure delivery OTP handshakes.

---

## 🚀 Key Features

*   **Role-Based Security (JWT)**: Fully isolated layouts, actions, and guards for Admins, Customers, and Delivery Partners.
*   **Storefront Catalog**: Full-text keyword searches, diet filters (Veg/Non-Veg), price ranges, and category carousels.
*   **Shopping Cart & Wishlist**: Persistent client cart with auto-calculating subtotals, GST, and delivery charges.
*   **Checkout Gateway**: Promo coupon campaigns validations, Razorpay checkout overlay, Stripe card checkout sessions, and Cash on Delivery (COD).
*   **Real-time GPS Tracking**: Socket.io event-based coordinates streaming, permitting customers to track delivery partners on their route.
*   **Admin Console**: KPI dashboards, monthly sales charts via ChartJS, inventory warning levels, category and product CRUD portals with image uploads, and ledger statement exports (CSV format).
*   **Delivery Rider Panel**: Availability status triggers, assigned task sheets, and customer OTP handshakes.

---

## 🛠 Tech Specification Stack

*   **Database**: MongoDB Atlas (Mongoose Object Modeling)
*   **Server Engine**: Node.js & Express (ES Modules)
*   **Client interface**: React 19, Vite, Redux Toolkit, Tailwind CSS v3, and React Router v6
*   **Visualizations**: Chart.js & React-Chartjs-2
*   **Websockets**: Socket.io & Socket.io-client
*   **Cloud CDN Storage**: Cloudinary SDK (via Multer file parser)
*   **Email Relay**: Nodemailer SMTP Client
*   **Document Generator**: PDFKit

---

## 📁 System Folder Structure

```text
OnlineGroceryDeliverySystem/
├── backend/
│   ├── config/          # Database, Cloudinary, and payment gateway configurations
│   ├── controllers/     # Controller handlers (Business Logic)
│   ├── middlewares/     # Auth checks, error boundaries, rate limits, Joi validators
│   ├── models/          # Mongoose Schemas (12 collections)
│   ├── routes/          # Express route paths definitions
│   ├── services/        # WebSockets, emails, PDFs, and checkout helper instances
│   ├── utils/           # Global exceptions handling (ErrorHandler.js)
│   ├── validators/      # Joi validate schema declarations
│   ├── server.js        # Server entry point
│   └── seeder.js        # Database mock populator utility
├── frontend/
│   ├── public/          # Favicon and static files
│   ├── src/
│   │   ├── components/  # Layouts (Navbar, Sidebar, Footer)
│   │   ├── context/     # SocketContext.jsx websockets handler
│   │   ├── layouts/     # Protected Route layouts (Auth, Customer, Admin, Delivery)
│   │   ├── pages/       # Frontend page views (Home, Cart, Dashboards, etc.)
│   │   ├── redux/       # Store configurations and slices (auth, cart, products)
│   │   ├── services/    # Axios client connection instances (api.js)
│   │   ├── App.jsx      # Routes routing registry
│   │   └── main.jsx     # DOM entrypoint
│   ├── tailwind.config.js # Tailwind CSS directives config
│   └── vite.config.js   # Vite client compiler config
├── DEVELOPMENT_PROGRESS.md # Phase milestones tracker
└── README.md
```

---

## 📂 Database Collections

The MongoDB Database design features 12 collections mapping entity boundaries:
1.  `Users`: Customer, Admin, and Delivery Partner accounts with hashed password schemas.
2.  `Addresses`: User address records catalog.
3.  `Categories`: Product group details.
4.  `Products`: Items details, stock, pricing, and diet parameters.
5.  `Carts`: Customer active shopping items basket.
6.  `Wishlists`: Customer favorited products.
7.  `Orders`: Billing, shipping details, order status, and verification OTPs.
8.  `Payments`: Gateway transaction capture records (Razorpay/Stripe metadata).
9.  `Coupons`: Discount campaigns constraints.
10. `Reviews`: Product ratings and feedback messages.
11. `Notifications`: Alerts logged history.
12. `DeliveryPartners`: Vehicle and availability parameters for delivery riders.

---

## 🔗 Endpoint Summary

### Customers & Auth
*   `POST /api/auth/register` — Create User account
*   `POST /api/auth/login` — Sign In (HttpOnly cookie JWT issue)
*   `POST /api/auth/forgot-password` — Email password reset token
*   `PUT /api/auth/reset-password/:token` — Set new password
*   `GET /api/auth/profile` — Fetch account profile
*   `GET /api/auth/addresses` — Fetch saved shipping address directory

### Shop & Cart
*   `GET /api/categories` — Browse active categories
*   `GET /api/products` — Retrieve product grid catalog
*   `GET /api/cart` — Retrieve items in cart
*   `POST /api/cart` — Update items in cart
*   `GET /api/wishlist` — Retrieve customer wishlist

### Checkouts & Tracking
*   `POST /api/orders` — Check out and place order
*   `GET /api/orders` — Customer orders history
*   `GET /api/orders/:id/invoice` — Download sales PDF receipt
*   `POST /api/payments/razorpay/order` — Create Razorpay Transaction
*   `POST /api/payments/stripe/checkout` — Launch Stripe Session checkout

### Administration
*   `GET /api/admin/dashboard` — Analytical KPIs and monthly sales data
*   `POST /api/products` — Add product (with images upload)
*   `PUT /api/products/:id` — Edit product & update stock
*   `GET /api/admin/orders` — List order history (Rider allocation)
*   `GET /api/admin/reports` — Download CSV Sales ledger statement

### Deliveries
*   `GET /api/delivery/tasks` — Assigned task sheets
*   `PUT /api/delivery/tasks/:id` — Update status or input OTP confirmation code

---

## 📜 Guides References
For setup, deployments, and validation tests, review:
*   [INSTALLATION_GUIDE.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/INSTALLATION_GUIDE.md)
*   [DEPLOYMENT_GUIDE.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/DEPLOYMENT_GUIDE.md)
*   [TESTING_GUIDE.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/TESTING_GUIDE.md)
*   [API_DOCUMENTATION.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/API_DOCUMENTATION.md)
*   [DATABASE_DOCUMENTATION.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/DATABASE_DOCUMENTATION.md)
*   [PROJECT_REPORT.md](file:///d:/Technical_Traning_II/OnlineGroceryDeliverySystem/PROJECT_REPORT.md)

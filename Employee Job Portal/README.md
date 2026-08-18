# 💼 Employee Job Portal (Cnear)

Cnear is a premium, feature-rich MERN (MongoDB, Express, React, Node.js) Employee Job Portal. It is equipped with advanced features like resume PDF parsing, on-the-fly ATS-friendly PDF/Word resume generation, applicant pipelines, notification hubs, and multi-role dashboards (Employee, Recruiter, Admin).   
    
---  

## 🚀 Key Features  

### 1. Unified Employee Onboarding Flow
* **Resume Upload & Parsing**: Uses `pdf-parse` on Node.js to scan resume text, and custom regex segmentation to automatically pre-fill personal data, education history, work experience, skills, and certifications.
* **Form Editor**: Interactive draft review fields enable candidates to confirm details before saving to MongoDB.
* **Profile Completion Tracker**: Computes profile completion strength. Reaching 100% unlocks application submissions and resume builders.

### 2. Double-Ended Document Generators
* **Word Resume (.docx)**: Uses the `docx` library on Node.js to compile structured, table-aligned resumes programmatically from profile data.
* **PDF Resume (.pdf)**: Uses `pdfkit` to compile pixel-perfect modern resumes in 3 professional templates:
  * **Classic**: Traditional ATS-friendly layout.
  * **Modern**: Split double-column layout with sidebar and contact badges.
  * **Creative**: Layout containing bold teal borders.

### 3. Complete Recruitment Pipeline
* **Job Boards**: Fuzzy text searching and multi-select filtering for salaries, experience tags, and setting preferences.
* **Audit Timelines**: Tracks applicant status history (Applied, Under Review, Shortlisted, Interview, Selected, Rejected) with custom remarks.
* **Notifications Hub**: Dispatches real-time alert logs and polls for applicant status changes.

---

## 📂 Project Architecture

```text
Employee Job Portal/
├── README.md             # Project-specific Documentation
└── near/
    ├── client/           # React Frontend (Vite + Tailwind CSS v3)
    │   ├── public/
    │   └── src/
    │       ├── components/  # Shared layouts, Navbar, Alert panels
    │       ├── context/     # JWT Auth and Notification contexts
    │       ├── pages/       # Onboarding, Dashboard, Profile Editor, Search, Resume Selector
    │       ├── services/    # Axios instance
    │       └── index.css    # Tailwind directives and CSS definitions
    │
    └── server/           # Express API Server (Node.js ES Modules)
        ├── config/          # DB, Multer and configuration setups
        ├── controllers/     # Authentication, Profiles, Jobs, Admin controllers
        ├── middleware/      # JWT auth, role validation
        ├── models/          # Mongoose schemas (User, Profile, Company, Job, App)
        ├── routes/          # Express route definitions
        ├── services/        # pdf-parse, pdfkit, docx document compilers
        └── uploads/         # Candidate resume upload storage
```

---

## 🛠️ Tech Stack & Technologies Used

* **Frontend**: React.js, Vite, Tailwind CSS v3, Axios, Context API
* **Backend**: Node.js, Express.js, JWT Authentication, Multer, `pdf-parse`, `pdfkit`, `docx`
* **Database**: MongoDB (with Mongoose ODM)
* **API Architecture**: RESTful API design

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file inside the `near/server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/cnear
JWT_SECRET=cnear_secret_key_123456_change_me
NODE_ENV=development
```

* **PORT**: The port the backend server runs on (default: `5000`).
* **MONGODB_URI**: Connection string for your local or remote MongoDB instance.
* **JWT_SECRET**: Key used to sign JSON Web Tokens for authentication.
* **NODE_ENV**: Current running environment (e.g. `development`, `production`).

---

## 🏃 Getting Started & Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your local machine.

### 2. Install Dependencies

#### For Backend Server:
Navigate to the server directory and install packages:
```bash
cd "Employee Job Portal/near/server"
npm install
```

#### For Frontend Client:
Navigate to the client directory and install packages:
```bash
cd "Employee Job Portal/near/client"
npm install
```

---

### 3. Running the Applications

#### How to Run the Backend
From the `near/server` folder, start the backend server in development mode:
```bash
npm run dev
```
*The server will launch at `http://localhost:5000`.*

To seed the database with initial sample jobs and users, you can run:
```bash
node seed.js
```

#### How to Run the Frontend
From the `near/client` folder, start the frontend React application:
```bash
npm run dev
```
*The client will launch at `http://localhost:5173`.*

---

## 🧪 Testing Credentials

You can register new roles inside the portal directly, or log in with the following default seeded credentials:
1. Register a new user with name **Admin Mod**, role **Admin**, and password **admin123**.
2. Log in with those credentials to access the **Admin Console** dashboard.

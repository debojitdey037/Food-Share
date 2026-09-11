# FoodShare — Food Waste Donation & Redistribution System

FoodShare is a full-stack, server-side rendered (SSR) web application built to connect surplus-food donors (restaurants, hotels, hostels, event organizers) with verified NGOs and volunteers for fast pickup and community redistribution.

![FoodShare Platform](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MongoDB%20%7C%20EJS-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Key Features

### Role-Based Portals & Dashboards
1. **Donor Portal**:
   - Create donation posts with food description, quantity, unit, pickup location, pincode/area code, prep time, expiry time, and notes.
   - Real-time status tracking: `Available`, `Accepted`, `PickedUp`, `Completed`, `Cancelled`, `Expired`.
   - Edit or Cancel posts (only while status is `Available`).
   - View contact details of the NGO that accepted the donation.

2. **NGO / Volunteer Portal**:
   - Feed of all currently `Available` surplus food posts, sorted automatically by **soonest expiry first**.
   - **Pincode / Area Filter**: Simple text search match to find nearby food within your postal code or neighborhood.
   - One-click **Accept / Claim** to lock donations to your NGO.
   - Status transition workflow: `Accepted` &rarr; `Picked Up` &rarr; `Completed`.
   - Claimed food history tab with donor contact details.

3. **Admin Panel**:
   - Platform-wide donation monitoring table with dropdown filter by status.
   - **User Management**: View list of registered Donors and NGOs; deactivate/suspend or reactivate accounts.
   - **Analytics & Impact Dashboard**: Metrics for total posts, active posts, food redistributed quantity, status breakdown, and **area-wise/pincode performance table**.

4. **Automated Expiry Handling**:
   - Background service running via `node-cron` every minute and on-demand read middleware that automatically transitions `Available` posts past their `expiryTime` to `Expired`.

---

## Tech Stack

- **Backend**: Node.js, Express.js (MVC Architecture)
- **Frontend Engine**: EJS (Embedded JavaScript Templates) with Server-Side Rendering
- **Styling**: Vanilla CSS (Responsive Design, Modern Emerald/Slate Palette, Glassmorphism elements, FontAwesome icons)
- **Database**: MongoDB Atlas / Local MongoDB via Mongoose ODM
- **Authentication**: Session-based auth using `express-session` and `connect-mongo` session store
- **Password Hashing**: `bcryptjs`
- **Flash Alerts**: `connect-flash`
- **Scheduled Jobs**: `node-cron`

---

## Directory Structure

```
Food-Donation/
├── config/
│   └── db.js                 # MongoDB Mongoose connection
├── controllers/
│   ├── adminController.js    # Admin dashboard, users, & analytics
│   ├── authController.js     # User registration, login, logout
│   ├── donorController.js    # Create, edit, list, & cancel donor posts
│   ├── indexController.js    # Home landing page with impact metrics
│   └── ngoController.js      # Available feed, claim food, & pickup workflow
├── middleware/
│   ├── authMiddleware.js     # Session authentication & role authorization
│   └── expiryMiddleware.js   # Automated donation status expiry handler
├── models/
│   ├── Donation.js           # Mongoose schema for Food Donations
│   └── User.js               # Mongoose schema for Users (Donor/NGO/Admin)
├── public/
│   ├── css/
│   │   └── style.css         # Modern, responsive application stylesheet
│   └── js/
│       └── main.js           # Client confirmation dialogs & alert dismissals
├── routes/
│   ├── adminRoutes.js        # /admin endpoints
│   ├── authRoutes.js         # /auth endpoints
│   ├── donorRoutes.js        # /donor endpoints
│   ├── indexRoutes.js        # Home route
│   └── ngoRoutes.js          # /ngo endpoints
├── views/
│   ├── admin/                # Admin views (dashboard, users, stats)
│   ├── auth/                 # Auth views (login, signup)
│   ├── donor/                # Donor views (dashboard, create, edit)
│   ├── ngo/                  # NGO views (feed, history)
│   ├── partials/             # Shared partials (header, navbar, footer, flash)
│   ├── 404.ejs               # Error view
│   └── index.ejs             # Landing page
├── .env.example              # Environment variables template
├── .gitignore                # Git ignored patterns
├── app.js                    # Express application entry point
├── package.json              # Dependencies and scripts
├── README.md                 # Documentation
└── seed.js                   # Database seeding script
```

---

## Setup & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas connection string URI.

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Food-Donation
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/foodshare
SESSION_SECRET=foodshare_secret_key_change_in_production
```

### 3. Seed Demo Data
Run the database seed script to populate sample accounts, donors, NGOs, and food posts across various statuses and pincodes:
```bash
npm run seed
```

#### Demo Credentials Created by Seed Script:
| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foodshare.org` | `Admin@123` | FoodShare Operations |
| **Donor** | `bistro@foodshare.org` | `Donor@123` | Green Bistro Restaurant |
| **Donor** | `grandhotel@foodshare.org` | `Donor@123` | Grand Palace Hotel Banquet |
| **NGO** | `hopefoodbank@foodshare.org` | `Ngo@123` | Hope Food Relief Foundation |
| **NGO** | `cityshelter@foodshare.org` | `Ngo@123` | City Community Kitchen |

### 4. Start the Application
For development mode with auto-reload:
```bash
npm run dev
```
For production mode:
```bash
npm start
```

Visit the app in your browser at: `http://localhost:3000`

---

## Deployment Guide

### Deploying to Render
1. Push your code repository to GitHub/GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** &rarr; **Web Service**.
3. Connect your Git repository.
4. Configure service settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables under the **Environment** tab:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
   - `SESSION_SECRET`: A strong random secret key
   - `PORT`: `10000` (or leave default assigned by Render)
6. Click **Create Web Service**.

### Deploying to Vercel
1. Install Vercel CLI (`npm i -g vercel`) or connect repository on [Vercel Dashboard](https://vercel.com).
2. Ensure environment variables (`MONGODB_URI`, `SESSION_SECRET`) are configured in Vercel project settings.
3. Deploy with `vercel --prod`.

---

## License
Distributed under the MIT License. See `LICENSE` for more information.

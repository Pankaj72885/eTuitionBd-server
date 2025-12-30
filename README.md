# eTuitionBd - Server API

<div align="center">
  <h3>🚀 Backend API for eTuitionBd Tuition Management Platform</h3>
  <p>RESTful API built with Express.js, MongoDB, and Firebase Admin SDK</p>
  
  [![Client Repo](https://img.shields.io/badge/Client-Repository-blue?style=for-the-badge)](https://github.com/Pankaj72885/eTuitionBd-client)
  [![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://etuitionbd-client-production.up.railway.app/)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The **eTuitionBd Server** is a robust RESTful API that powers the eTuitionBd platform. It handles user authentication, tuition management, application processing, payment integration with Stripe, and provides comprehensive admin controls.

### Key Highlights

- 🔐 **Secure Authentication** - Firebase Admin SDK for token verification + JWT
- 💾 **MongoDB Database** - Efficient data storage with Mongoose ODM
- 💳 **Stripe Integration** - Secure payment processing
- 🛡️ **Role-Based Access Control** - Student, Tutor, and Admin roles
- ⚡ **Optimized Performance** - Indexed queries and efficient data retrieval
- 🔒 **Security First** - Helmet, CORS, rate limiting, and input validation

---

## ✨ Features

### Authentication & Authorization

- ✅ Firebase Authentication integration
- ✅ JWT-based session management
- ✅ Role-based access control (RBAC)
- ✅ Token verification middleware
- ✅ Secure password handling

### User Management

- ✅ User registration and profile management
- ✅ Role assignment (Student, Tutor, Admin)
- ✅ User verification system
- ✅ Profile updates and photo management

### Tuition Management

- ✅ Create, read, update, delete tuitions
- ✅ Admin approval workflow
- ✅ Advanced search and filtering
- ✅ Status management (Pending, Approved, Ongoing, etc.)
- ✅ Application tracking

### Application System

- ✅ Tutor applications to tuitions
- ✅ Application status management
- ✅ Student review and approval
- ✅ Automatic status updates

### Payment Processing

- ✅ Stripe payment intent creation
- ✅ Webhook handling for payment events
- ✅ Payment history and tracking
- ✅ Revenue analytics for tutors
- ✅ Transaction reports for admins

### Additional Features

- ✅ Review and rating system
- ✅ Bookmark functionality
- ✅ In-app messaging
- ✅ Notification system
- ✅ Calendar events

---

## 🛠 Tech Stack

### Core Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Bun** - Fast JavaScript runtime and package manager

### Authentication & Security

- **Firebase Admin SDK** - Token verification
- **JWT (jsonwebtoken)** - Session management
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

### Payment & External Services

- **Stripe** - Payment processing
- **Multer** - File upload handling

### Utilities

- **dotenv** - Environment variable management
- **morgan** - HTTP request logger
- **express-validator** - Input validation

---

## 🧩 Challenges & Technical Solutions

### 1. Hybrid Authentication System

**Challenge**: The frontend uses Firebase for ease of login, but the backend requires granular role-based access control (Student vs Tutor vs Admin) that Firebase's standard claims didn't fully satisfy for our complex schema.
**Solution**: We implemented a token exchange pattern. The client sends a Firebase ID token; the server validates it via `firebase-admin`, retrieves/creates the user in MongoDB, and signs a custom JWT containing the specific `role` and `_id`. This JWT is then used for all subsequent secure API calls.

### 2. High-Performance Analytics

**Challenge**: The Admin Dashboard needs to show real-time revenue and plotting data (e.g., "Last 6 Months Income"). Naively fetching all payments and filtering in code was O(n) and memory-intensive.
**Solution**: We utilized **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$project`) to perform the heavy lifting at the database level. For chart data, we group payments by month and year directly in the query, returning only the 6 datapoints needed by the frontend.

### 3. Secure Payment Webhooks

**Challenge**: Ensuring that tuition status updates only occur after a confirmed payment from Stripe, preventing fraudulent "free" approvals.
**Solution**: We implemented a robust Stripe Webhook handler. It verifies the Stripe signature to ensure authenticity, checks specifically for `payment_intent.succeeded`, and then performs an atomic DB transaction to update the `Payment` status to "Succeeded" and the `Tuition` status to "Ongoing".

---

## 🚀 Getting Started

### Prerequisites

- **Bun** (v1.3.5 or higher) - [Install Bun](https://bun.sh)
- **Node.js** (v18 or higher) - Alternative to Bun
- **MongoDB** - Local installation or MongoDB Atlas account
- **Firebase Project** - For authentication
- **Stripe Account** - For payment processing

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Pankaj72885/eTuitionBd-server.git
   cd eTuitionBd-server
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/etuitionbd
   # Or MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/etuitionbd

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

4. **Set up Firebase Admin SDK**

   - Download your Firebase service account key JSON file
   - Place it in the project root as `e-tuition-bd-firebase-adminsdk.json`
   - Or use environment variables (recommended for production)

5. **Start the development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Server will be running at**
   ```
   http://localhost:5000
   ```

---

## 📁 Project Structure

```
eTuitionBd-server/
├── config/                    # Configuration files
│   ├── db.js                 # MongoDB connection
│   ├── firebaseAdmin.js      # Firebase Admin SDK setup
│   └── stripe.js             # Stripe configuration
├── controllers/               # Route controllers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── tuition.controller.js
│   ├── application.controller.js
│   ├── payment.controller.js
│   ├── review.controller.js
│   ├── message.controller.js
│   ├── notification.controller.js
│   └── bookmark.controller.js
├── middleware/                # Custom middleware
│   ├── auth.js               # Authentication middleware
│   ├── role.js               # Role-based access control
│   └── errorHandler.js       # Global error handler
├── models/                    # Mongoose models
│   ├── User.model.js
│   ├── Tuition.model.js
│   ├── Application.model.js
│   ├── Payment.model.js
│   ├── Review.model.js
│   ├── Message.model.js
│   ├── Notification.model.js
│   ├── CalendarEvent.model.js
│   └── Bookmark.model.js
├── routes/                    # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── tuition.routes.js
│   ├── application.routes.js
│   ├── payment.routes.js
│   ├── review.routes.js
│   ├── message.routes.js
│   ├── notification.routes.js
│   └── bookmark.routes.js
├── scripts/                   # Utility scripts
│   ├── seed.js               # Database seeding
│   └── create-admin.js       # Create admin user
├── utils/                     # Utility functions
│   ├── validators.js         # Input validators
│   ├── helpers.js            # Helper functions
│   └── constants.js          # Constants
├── .env                       # Environment variables
├── .gitignore
├── app.js                     # Express app configuration
├── server.js                  # Server entry point
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

| Variable                | Description                          | Required | Default     |
| ----------------------- | ------------------------------------ | -------- | ----------- |
| `PORT`                  | Server port                          | No       | 5000        |
| `NODE_ENV`              | Environment (development/production) | No       | development |
| `MONGO_URI`             | MongoDB connection string            | Yes      | -           |
| `JWT_SECRET`            | Secret key for JWT signing           | Yes      | -           |
| `JWT_EXPIRE`            | JWT expiration time                  | No       | 7d          |
| `FIREBASE_PROJECT_ID`   | Firebase project ID                  | Yes      | -           |
| `FIREBASE_PRIVATE_KEY`  | Firebase private key                 | Yes      | -           |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email                | Yes      | -           |
| `STRIPE_SECRET_KEY`     | Stripe secret key                    | Yes      | -           |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret                | Yes      | -           |
| `CLIENT_URL`            | Frontend URL for CORS                | Yes      | -           |

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01712345678",
  "city": "Dhaka",
  "role": "student"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "firebaseToken": "firebase_id_token"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### User Endpoints

#### Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <jwt_token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <jwt_token>
```

#### Update User Profile

```http
PUT /api/users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "01712345678",
  "city": "Rajshahi"
}
```

#### Update User Role (Admin Only)

```http
PATCH /api/users/:id/role
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Tuition Endpoints

#### Get All Tuitions

```http
GET /api/tuitions?page=1&limit=10&subject=Math&location=Dhaka&sort=dateDesc
```

#### Get Tuition by ID

```http
GET /api/tuitions/:id
```

#### Create Tuition (Student Only)

```http
POST /api/tuitions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "classLevel": "Class 10",
  "location": "Dhaka",
  "budget": 5000,
  "schedule": "3 days/week, 2 hours/day",
  "mode": "offline",
  "description": "Need experienced tutor for SSC preparation"
}
```

#### Update Tuition

```http
PUT /api/tuitions/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "budget": 6000,
  "schedule": "4 days/week"
}
```

#### Delete Tuition

```http
DELETE /api/tuitions/:id
Authorization: Bearer <jwt_token>
```

#### Approve/Reject Tuition (Admin Only)

```http
PATCH /api/tuitions/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

### Application Endpoints

#### Create Application (Tutor Only)

```http
POST /api/applications
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tuitionId": "tuition_id_here",
  "qualifications": "BSc in Mathematics",
  "experience": "5 years teaching experience",
  "expectedSalary": 5500
}
```

#### Get Applications for Student's Tuitions

```http
GET /api/applications/student
Authorization: Bearer <jwt_token>
```

#### Get Tutor's Applications

```http
GET /api/applications/tutor
Authorization: Bearer <jwt_token>
```

#### Update Application Status

```http
PATCH /api/applications/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

### Payment Endpoints

#### Create Payment Intent

```http
POST /api/payments/create-intent
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "applicationId": "application_id_here",
  "amount": 5500
}
```

#### Stripe Webhook

```http
POST /api/payments/webhook
Stripe-Signature: <stripe_signature>
```

#### Get Student Payments

```http
GET /api/payments/student
Authorization: Bearer <jwt_token>
```

#### Get Tutor Payments

```http
GET /api/payments/tutor?fromDate=2025-01-01&toDate=2025-12-31
Authorization: Bearer <jwt_token>
```

#### Get All Payments (Admin Only)

```http
GET /api/payments/admin
Authorization: Bearer <jwt_token>
```

### Review Endpoints

#### Create Review

```http
POST /api/reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tutorId": "tutor_id_here",
  "tuitionId": "tuition_id_here",
  "rating": 5,
  "comment": "Excellent tutor!"
}
```

#### Get Reviews for Tutor

```http
GET /api/reviews/tutor/:tutorId
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

---

## 💾 Database Schema

### User Model

```javascript
{
  firebaseUid: String (unique),
  name: String (required),
  email: String (unique, required),
  role: String (enum: ['student', 'tutor', 'admin']),
  phone: String (required),
  photoUrl: String,
  city: String (required),

  // Tutor-specific fields
  qualifications: String,
  experienceYears: Number,
  subjects: [String],
  classLevels: [String],

  // Platform meta
  isVerified: Boolean,
  averageRating: Number,
  reviewCount: Number,
  isAvailable: Boolean,

  timestamps: true
}
```

### Tuition Model

```javascript
{
  studentId: ObjectId (ref: User),
  subject: String (required),
  classLevel: String (required),
  location: String (required),
  budget: Number (required, min: 500),
  schedule: String (required),
  mode: String (enum: ['online', 'offline', 'hybrid']),
  description: String,
  status: String (enum: ['Pending', 'Approved', 'Rejected', 'Open', 'Ongoing', 'Completed', 'Closed']),
  applicationCount: Number,

  timestamps: true
}
```

### Application Model

```javascript
{
  tuitionId: ObjectId (ref: Tuition),
  tutorId: ObjectId (ref: User),
  qualifications: String,
  experience: String,
  expectedSalary: Number,
  status: String (enum: ['Pending', 'Approved', 'Rejected']),

  timestamps: true
}
```

### Payment Model

```javascript
{
  studentId: ObjectId (ref: User),
  tutorId: ObjectId (ref: User),
  tuitionId: ObjectId (ref: Tuition),
  applicationId: ObjectId (ref: Application),
  amount: Number,
  stripePaymentIntentId: String,
  status: String (enum: ['Succeeded', 'Failed', 'Pending']),

  createdAt: Date
}
```

### Review Model

```javascript
{
  tutorId: ObjectId (ref: User),
  studentId: ObjectId (ref: User),
  tuitionId: ObjectId (ref: Tuition),
  rating: Number (1-5),
  comment: String,

  createdAt: Date
}
```

---

## 🔒 Authentication & Authorization

### Authentication Flow

1. **Client-side**: User authenticates with Firebase
2. **Client sends**: Firebase ID token to server
3. **Server verifies**: Token using Firebase Admin SDK
4. **Server issues**: JWT token for app-level authentication
5. **Subsequent requests**: Include JWT in Authorization header

### Middleware

#### Authentication Middleware (`auth.js`)

```javascript
// Verifies JWT token and attaches user to request
app.use("/api/protected-route", authenticate, controller);
```

#### Role-based Middleware (`role.js`)

```javascript
// Restricts access based on user role
app.use("/api/admin-route", authenticate, requireRole(["admin"]), controller);
```

### Protected Routes

- **Student Only**: Post tuitions, manage applications
- **Tutor Only**: Apply to tuitions, view revenue
- **Admin Only**: User management, tuition approval, analytics

---

## 📜 Available Scripts

```bash
# Development
bun run dev          # Start server with auto-reload
npm run dev          # Alternative with npm

# Production
bun run start        # Start production server
npm run start        # Alternative with npm

# Database
bun run seed         # Seed database with sample data
npm run seed         # Alternative with npm

# Admin
bun run create-admin # Create admin user
npm run create-admin # Alternative with npm
```

---

## 🚢 Deployment

### Environment Setup

1. Set all environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Configure Firebase Admin SDK credentials
4. Set up Stripe webhook endpoint

### Recommended Platforms

- **Railway** - Easy deployment with automatic HTTPS
- **Render** - Free tier available
- **Heroku** - Classic PaaS platform
- **DigitalOcean** - App Platform or Droplet
- **AWS** - EC2 or Elastic Beanstalk

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with production client URL
- [ ] Set up MongoDB Atlas or managed database
- [ ] Configure Stripe webhook URL
- [ ] Enable security headers (Helmet)
- [ ] Set up rate limiting
- [ ] Configure logging
- [ ] Set up monitoring (optional)

---

## 🔗 Related Links

- **Client Repository**: [https://github.com/Pankaj72885/eTuitionBd-client](https://github.com/Pankaj72885/eTuitionBd-client)
- **Live Application**: [https://etuitionbd-client-production.up.railway.app/](https://etuitionbd-client-production.up.railway.app/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Pankaj Bepari**

- GitHub: [@Pankaj72885](https://github.com/Pankaj72885)
- Email: contact@etuitionbd.com

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the powerful database
- Firebase team for authentication services
- Stripe for payment processing
- All open-source contributors

---

<div align="center">
  <p>Made with ❤️ for the education community in Bangladesh</p>
  <p>© 2025 eTuitionBd. All rights reserved.</p>
</div>

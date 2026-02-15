# Marketplace Platform

## Architecture Overview

This project is a full-stack marketplace platform with separate frontend and backend applications:

- Frontend: React (Vite) SPA, communicates with backend via REST API (`/api`).

- Backend: Node.js with Express, provides RESTful APIs for authentication, product management, payments, and admin/vendor operations.
- Database: MongoDB (cloud-hosted), stores users, vendors, products, payments, and wallets.



# Folder Structure
Agnito-task/
  backend/      # Express API server
  frontend/     # React client app


## Payment Flow & API List

# Payment Flow
1. Customer selects a product and initiates payment.
2. Frontend calls POST /api/payment/create-payment with the product ID with fetch CustomerId.

3. Backend creates a payment record and (optionally) integrates with a payment gateway.

4. Customer is redirected to payment gateway (if used) or payment is processed.


5. Backend updates payment status and vendor/customer wallets.


6. Frontend polls or receives status update via GET /api/payment/:id.



# Key API Endpoints

## Auth
- `POST   /api/auth/register`         — Register user
- `POST   /api/auth/login`            — Login user
- `GET    /api/auth/me`               — Get current user info

## Products (Public)
- `GET    /api/products`              — List all products
- `GET    /api/products/:id`          — Get product details

## Payment (Customer)
- `POST   /api/payment/create-payment` — Create a payment for a product
- `GET    /api/payment/:id`           — Get payment status/details

## Vendor
- `GET    /api/vendor/status`         — Get vendor onboarding status
- `POST   /api/vendor/onboard`        — Start vendor onboarding
- `POST   /api/vendor/complete-onboarding` — Complete onboarding
- `GET    /api/vendor/wallet`         — Vendor wallet info
- `GET    /api/vendor/products`       — Vendor's products
- `POST   /api/vendor/product`        — Create product
- `PATCH  /api/vendor/product/:id`    — Update product
- `GET    /api/vendor/payments`       — Vendor's payments

## Admin
- `GET    /api/admin/vendors`         — List all vendors
- `POST   /api/admin/vendor`          — Create vendor
- `PATCH  /api/admin/vendor/:id/status` — Update vendor status
- `GET    /api/admin/payments`        — All payments
- `GET    /api/admin/wallet`          — Admin wallet info

## Webhook (for payment gateway integration)
- `POST   /api/webhook/payment`       — Handle payment gateway webhook


## Database Schema (Simplified)

# User
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: 'admin' | 'vendor' | 'customer',
}

# Vendor
{
  _id: ObjectId,
  user: ObjectId (ref User),
  status: 'pending' | 'approved' | 'rejected',
  wallet: ObjectId (ref Wallet),
}

# Product
{
  _id: ObjectId,
  vendor: ObjectId (ref Vendor),
  name: String,
  price: Number,
  description: String,
}

# Payment
{
  _id: ObjectId,
  product: ObjectId (ref Product),
  customer: ObjectId (ref User),
  vendor: ObjectId (ref Vendor),
  amount: Number,
  status: 'pending' | 'completed' | 'failed',
}

# Wallet
{
  _id: ObjectId,
  owner: ObjectId (ref User or Vendor),
  balance: Number,
}




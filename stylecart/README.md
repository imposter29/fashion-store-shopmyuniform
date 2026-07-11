# StyleCart — Fashion E-Commerce Platform

A full-stack fashion e-commerce application built with the MERN stack.

## Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Axios, CSS
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Auth:** JWT with httpOnly cookies, bcryptjs

**Why MERN?** Fast prototyping with JavaScript across the stack, a flexible
document model for product variants (sizes, images, ratings), and a rich
ecosystem for rapid development.

## Features

- User registration and login with secure httpOnly-cookie authentication
- Product browsing with search, filters (category, price, size), sorting, and pagination
- Server-side persisted shopping cart
- Checkout flow with order creation and automatic stock management
- Order history with status tracking (placed → processing → shipped → delivered)
- Wishlist / save for later
- Product reviews and ratings (with aggregate recalculation)
- Admin panel: product & category CRUD, order management, dashboard stats
- Responsive design (mobile + desktop)
- Input validation on both client and server
- Toast notifications, loading states, empty states, and confirm dialogs throughout

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone the repo

```bash
git clone <repo-url>
cd stylecart
```

### 2. Install dependencies

```bash
npm run install-all
```

### 3. Environment setup

```bash
cp .env.example .env
```

Edit `.env` and set your `MONGO_URI` and `JWT_SECRET`.

### 4. Seed the database

```bash
npm run seed
```

This inserts 2 users, 5 categories, and 30 products. Run `npm run seed -- --destroy`
to wipe all collections.

### 5. Start development

```bash
npm run dev
```

This starts both the backend (port 5000) and the frontend (port 5173)
concurrently. Open http://localhost:5173.

## Demo Credentials

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Admin    | admin@stylecart.com | admin123    |
| Customer | john@example.com    | customer123 |

## Environment Variables

See `.env.example`:

- `NODE_ENV` — `development` or `production`
- `PORT` — backend port (default `5000`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used to sign JWTs

## Available Scripts (run from the repo root)

| Script                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Run server (nodemon) + client (Vite) concurrently |
| `npm run server`      | Start the API server                              |
| `npm run server:dev`  | Start the API server with nodemon                 |
| `npm run client`      | Start the Vite dev server                         |
| `npm run seed`        | Seed the database with sample data                |
| `npm run install-all` | Install root and client dependencies              |

## Project Structure

```
stylecart/
├── server/
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/             # auth, admin, errorHandler, validate
│   ├── models/                 # User, Product, Category, CartItem, Order, Review
│   ├── routes/                 # auth, products, categories, cart, orders, wishlist, reviews, admin
│   ├── controllers/            # business logic for every route
│   ├── utils/                  # generateToken, asyncHandler, slugify
│   ├── seed.js                 # database seeder
│   └── server.js               # Express entry point
├── client/
│   ├── src/
│   │   ├── api/axios.js         # axios instance (baseURL /api, cookies)
│   │   ├── context/             # Auth, Cart, Toast providers
│   │   ├── components/          # layout, common, product, admin
│   │   ├── pages/               # storefront + admin pages
│   │   ├── styles/global.css    # design system + utilities
│   │   ├── App.jsx              # route tree with guards
│   │   └── main.jsx             # providers + router
│   └── vite.config.js           # /api proxy → localhost:5000
├── .env.example
└── package.json                 # root scripts (concurrently)
```

## API Overview

| Base              | Endpoints                                                           |
| ----------------- | ------------------------------------------------------------------ |
| `/api/auth`       | `POST /register`, `POST /login`, `POST /logout`, `GET /profile`    |
| `/api/products`   | `GET /` (search/filter/sort/paginate), `GET /:id`                  |
| `/api/categories` | `GET /`                                                            |
| `/api/cart`       | `GET /`, `POST /`, `PUT /:itemId`, `DELETE /:itemId`, `DELETE /`   |
| `/api/orders`     | `POST /`, `GET /`, `GET /:id`                                      |
| `/api/wishlist`   | `POST /:productId`, `DELETE /:productId`                           |
| `/api/reviews`    | `POST /:productId`, `GET /:productId`, `DELETE /:reviewId`         |
| `/api/admin`      | stats, product/category CRUD, orders list, order status update     |

## AI Usage

This project was built with assistance from Claude (Anthropic). AI was used for:
scaffolding project architecture, generating boilerplate code, debugging, writing
seed data, and iterating on UI components. All code was reviewed and understood
before inclusion.

## Known Limitations / What I'd Do With More Time

- No real payment gateway (checkout is simulated, cash-on-delivery only)
- Image URLs are placeholders (via picsum.photos) — no cloud upload
- No email notifications for order status changes
- No unit/integration tests
- No Docker setup
- Search is basic case-insensitive regex — would use MongoDB Atlas Search or
  Elasticsearch for production
- No rate limiting on auth endpoints
- Single-server architecture — would add Redis for sessions/caching in production

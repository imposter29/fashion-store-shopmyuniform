# StyleCart

A MERN (MongoDB, Express, React, Node) fashion e-commerce application, organized as a monorepo.

## Structure

```
stylecart/
├── server/        # Express + Mongoose API
└── client/        # React (Vite) SPA
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a connection string)

## Setup

1. Install all dependencies (root + client):

   ```bash
   npm run install-all
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then fill in `MONGO_URI` and `JWT_SECRET`.

## Scripts (run from the repo root)

| Script                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run dev`         | Run server (nodemon) + client (Vite) concurrently    |
| `npm run server`      | Start the API server                                 |
| `npm run server:dev`  | Start the API server with nodemon                    |
| `npm run client`      | Start the Vite dev server                            |
| `npm run seed`        | Seed the database with sample data                   |
| `npm run install-all` | Install root and client dependencies                 |

- API: http://localhost:5000
- Client: http://localhost:5173 (proxies `/api` → `http://localhost:5000`)

## API Overview

| Base              | Resource   |
| ----------------- | ---------- |
| `/api/auth`       | Auth       |
| `/api/products`   | Products   |
| `/api/categories` | Categories |
| `/api/cart`       | Cart       |
| `/api/orders`     | Orders     |
| `/api/wishlist`   | Wishlist   |
| `/api/reviews`    | Reviews    |
| `/api/admin`      | Admin      |

## Status

Scaffold only — architecture is complete, models and middleware are fully
implemented, controllers are stubs returning `{ message: 'TODO' }`, and the
frontend pages are placeholders. The server starts, the client starts, the DB
connects, and every route is reachable.

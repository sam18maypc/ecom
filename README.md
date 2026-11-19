# ShopEasy – E-commerce Store

A simple full-stack e-commerce web application built with **Node.js, Express, MongoDB, HTML, CSS and JavaScript**.

---

## 📁 Project Structure

```
ecom/
├── server.js              ← Express app entry point
├── package.json
├── models/
│   ├── User.js            ← User schema (with cart)
│   ├── Product.js         ← Product schema
│   └── Order.js           ← Order schema
├── routes/
│   ├── auth.js            ← Register / Login / Logout
│   ├── products.js        ← Browse & search products
│   ├── cart.js            ← Add / update / remove cart items
│   └── orders.js          ← Place order & order history
└── public/
    ├── index.html         ← Product listing page
    ├── cart.html          ← Shopping cart page
    ├── orders.html        ← Order history page
    ├── login.html         ← Login & Register page
    ├── style.css          ← All styles
    └── app.js             ← Front-end JavaScript
```

---

## 🚀 Setup & Run

### Prerequisites
- [Node.js](https://nodejs.org) installed
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

### Steps

```bash
# 1. Install dependencies
cd ecom
npm install

# 2. Start MongoDB (if not running as a service)
mongod

# 3. Start the server
node server.js

# 4. Open in browser
http://localhost:3000
```

Sample products are **auto-seeded** on first run — no manual setup needed.

---

## 🔑 Key Features

| Feature | Details |
|---|---|
| **Product Catalog** | Browse all products with search & category filter |
| **Shopping Cart** | Add, remove, and update quantity — total updates instantly |
| **Checkout** | Enter delivery address and place order |
| **Order History** | View all past orders with status |
| **Registration** | Create a new account securely |
| **Login / Logout** | Session-based authentication |
| **Password Security** | bcryptjs hashing — plain-text passwords never stored |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Front-end | HTML5, CSS3, Vanilla JavaScript |
| Back-end | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | express-session + bcryptjs |

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET  | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products (supports `?search=` & `?category=`) |
| GET | `/api/products/:id` | Get single product |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET    | `/api/cart` | View cart |
| POST   | `/api/cart/add` | Add item |
| PUT    | `/api/cart/update` | Update quantity |
| DELETE | `/api/cart/remove/:productId` | Remove item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders/place` | Place order |
| GET  | `/api/orders/my` | View order history |

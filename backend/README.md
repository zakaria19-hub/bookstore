# BookStore – Backend

Express + TypeScript + MongoDB backend API for the BookStore application.

## Tech Stack

- **Node.js** – Runtime
- **Express 5** – Web framework
- **TypeScript** – Type safety
- **MongoDB / Mongoose** – Database
- **JWT** – Authentication
- **bcrypt** – Password hashing
- **CORS** – Cross-origin support

## Project Structure

```
app/
├── src/
│   ├── http/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, etc.
│   │   └── routes/        # API routes
│   ├── root/              # Composition, dependencies
│   └── server.ts          # Entry point
├── .env                   # Environment variables (MONGO_URL)
├── package.json
└── tsconfig.json
```

## API Endpoints

### Books
- `GET /api/books` – List all books
- `GET /api/books/:id` – Get book by ID
- `POST /api/books` – Create book (auth)
- `PUT /api/books/:id` – Update book (auth)
- `DELETE /api/books/:id` – Delete book (auth)

### Categories
- `GET /api/categories` – List all categories
- `GET /api/categories/:id` – Get category by ID
- `POST /api/categories` – Create category (auth)
- `PUT /api/categories/:id` – Update category (auth)
- `DELETE /api/categories/:id` – Delete category (auth)

### Auth
- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login (returns JWT)

### Orders
- `POST /api/orders` – Create order (auth)
- `GET /api/orders` – Get current user's orders (auth)
- `GET /api/orders/:id` – Get order by ID (auth)
- `GET /api/orders/admin/all` – Get all orders (auth)
- `PATCH /api/orders/:id/status` – Update order status (auth)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```
MONGO_URL=mongodb://localhost:27017/bookstore
```

3. Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:9000`.

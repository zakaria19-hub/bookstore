# BookStore – Frontend

React + TypeScript + Vite frontend for the BookStore application.

## Tech Stack

- **React 19** – UI library
- **TypeScript** – Type safety
- **Vite 7** – Build tool and dev server
- **React Router 7** – Client-side routing
- **Axios** – HTTP client
- **React Hot Toast** – Notifications

## Project Structure

```
ordring/
├── public/              # Static assets (served as-is)
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts (API, Auth)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── routes/          # Route configuration
│   ├── services/        # API services
│   └── types/           # TypeScript types
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Images

Images are organized by page under `src/assets/images/`:

- `home/` — Home. Hero image, banner, illustrations.
- `books/` — Books. Book cover placeholders, list graphics.
- `book-detail/` — Book Detail. Book cover, author image.
- `categories/` — Categories. Category icons, grid graphics.
- `category-detail/` — Category Detail. Category banner, thumbnails.
- `login/` — Login. Login page image, form illustration.
- `register/` — Register. Register page image, signup graphic.
- `orders/` — My Orders. Order list icons, empty state image.
- `order-detail/` — Order Detail. Order receipt graphic, status icons.
- `cart/` — Cart. Cart icon, empty cart image.
- `dashboard/` — Dashboard. Admin dashboard charts, icons.
- `shared/` — Shared. Logo, favicon, common icons.

Import in your components:



## Setup

```bash
npm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment

Ensure the backend API is running (default: `http://localhost:9000`). Configure the API base URL in `src/services/api.ts` if needed.

# Online Food Ordering System (MERN)

Full-stack Online Food Ordering System.

## Tech Stack
- **Frontend**: React + Tailwind CSS + React Router + Axios
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt (hashed passwords)

## Project Structure
```
FULL STACK PROJECT/
  backend/
  frontend/
```

## Prerequisites
- Node.js 18+ (recommended)
- MongoDB running locally **or** a MongoDB Atlas connection string

## 1) Backend Setup
```bash
cd backend
npm install
```

Create `.env` in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/food_ordering
JWT_SECRET=change_this_secret
CLIENT_ORIGIN=http://localhost:5173
```

Seed sample admin + menu:
```bash
npm run seed
```

Run backend:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

### Seeded credentials
- **Admin**: `admin@demo.com` / `Admin@123`
- **Customer**: `user@demo.com` / `User@123`

## 2) Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Notes
- Configure the API base URL via `VITE_API_URL` in `frontend/.env` if needed.
- This project includes:
  - auth (register/login/logout, JWT, roles)
  - menu with category filtering
  - cart (server-backed per user)
  - orders + order history
  - admin dashboard (manage food items, view/update orders)


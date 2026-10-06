# SoftSensor Task Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) task management application built for the SoftSensor engineering assignment.

> **Note on Database Selection:** The assignment prompt mentioned both "Postgres SQL" and "Persist data in MongoDB", alongside the title "MERN Candidate Assignment". I opted to strictly follow the MERN stack architecture using MongoDB/Mongoose.

## Tech Stack
- **Frontend:** React 19 (TypeScript), Vite, TailwindCSS (v4), Axios, Lucide React
- **Backend:** Node.js, Express, MongoDB (Mongoose), Joi (Validation)
- **Testing:** Jest, Supertest

## Features Included
- ✅ Create task (up to 100 char title, optional description, default status/priority)
- ✅ Display tasks in a clean, modern list (newest first)
- ✅ Status toggling (To Do -> In Progress -> Done)
- ✅ Priority levels (Low, Medium, High) with visual badges
- ✅ Soft/Hard filtering by status
- ✅ Delete with confirmation
- ✅ Loading, empty, and error states natively handled in UI
- ✅ Strict API validation with Joi ensuring graceful UI error toasts
- ✅ 2 Meaningful Backend API Tests 

## Setup & Running Locally

1. **Clone & Environment Setup:**
   - In `backend/`, copy the example env: `cp .env.example .env`
   - Ensure MongoDB is running locally on port 27017, or replace `MONGO_URI` in `.env` with a cloud Atlas string.

2. **Run Backend:**
   ```bash
   cd backend
   npm install
   npm run start   # Runs on localhost:5000
   ```

3. **Run Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev     # Runs on localhost:5173
   ```

## Testing
To run the automated backend tests:
```bash
cd backend
npm run test
```

## Technical Decisions
1. **Frontend State Management:** Kept entirely in React's local state (`useState`/`useEffect`). For an app this size, adding Redux/Zustand is over-engineering.
2. **Status Updates:** Clicking the status icon advances the task to the next logical state (`To Do` -> `In Progress` -> `Done`), allowing rapid interaction without modal dropdowns.
3. **Backend Validation:** Used `Joi` over manual validation to ensure strict type checking and sanitized strings before hitting the Mongoose schema.
4. **Tailwind v4:** Utilized the newest Vite-native Tailwind architecture to keep bundle sizes tiny and CSS compilation instantaneous.

## Production Authentication & Security (Future Improvements)
Since authentication was outside the assignment scope, here is how I would implement it for production:
1. **JWT & HttpOnly Cookies:** Implement an Auth service issuing JSON Web Tokens. Crucially, tokens would be stored in `HttpOnly`, `Secure` cookies to prevent XSS attacks, rather than `localStorage`.
2. **Access Restrictions:** 
   - Add a `userId` field to the `Task` Mongoose schema.
   - Introduce an `authMiddleware` in Express that verifies the JWT and attaches `req.user`.
   - Modify the controllers: `Task.find({ userId: req.user.id })` to ensure users only fetch, update, and delete their own tasks (Tenant Isolation).
3. **Rate Limiting & Helmet:** Apply `express-rate-limit` to prevent brute force attacks on endpoints, and use `helmet` for secure HTTP headers.

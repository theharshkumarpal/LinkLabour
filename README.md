# 🛠️ LinkLabour (LaborLink) Marketplace

LinkLabour is a modern, premium, and visually stunning digital marketplace designed for blue-collar jobs. It connects general contractors or homeowners (Posters) with skilled tradespeople and technicians (Workers). The platform supports posting jobs, submitting bids/proposals, messaging, secure escrow-style balance releases, and location-based matching.

---

## 🚀 Key Features

*   **Dual-Role Dashboard**: Users can act as **Posters** (to publish work, review bids, and manage escrow) or **Workers** (to search jobs, filter by distance, apply, and complete tasks).
*   **Location-Based Matching**: Visualizes job proximity by calculating the distance between the worker's coordinates and the job location.
*   **Proposals & Escrow**: Workers apply by placing bids. Posters accept bids, which moves funds into a simulated escrow, releasing them only upon verification of completed work.
*   **Real-time Messaging System**: Dynamic communication interface between posters and workers for active jobs.
*   **Review & Rating System**: Double-sided feedback loops where reviews affect user ratings, helping maintain service quality.
*   **Google OAuth Integration**: Built-in authentication support including mock and verification flows.
*   **Live Notifications**: Event-triggered alert system for bid approvals, messages, and project completions.

---

## 💻 Tech Stack

### Frontend
*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Styling**: Modern, responsive Vanilla CSS with glassmorphism and custom animation tokens.

### Backend
*   **Runtime**: Node.js + Express
*   **Database**: PostgreSQL
*   **ORM**: [Prisma ORM](https://www.prisma.io/)
*   **Middleware**: CORS, global error handling, and token-based authorization.

---

## 📂 Project Structure

```bash
LinkLabour/
├── backend/
│   ├── config/             # Prisma client configuration
│   ├── controllers/        # Core business logic for authentication, jobs, proposals, etc.
│   ├── middleware/         # Auth verification and custom error handlers
│   ├── prisma/             # Schema definitions and seeding scripts
│   ├── routes/             # API routing endpoints
│   ├── server.js           # Server startup script
│   └── package.json
├── src/
│   ├── components/         # Shared React components (JobCard, Navbar, AuthPage, etc.)
│   ├── services/           # API integration and client helper scripts
│   ├── types/              # TypeScript global definitions
│   └── App.tsx             # Main entry-point
├── package.json
└── README.md
```

---

## ⚙️ Local Setup & Configuration

### Prerequisites
*   Node.js (v18 or higher recommended)
*   PostgreSQL database (local instance or cloud database such as Neon/Supabase)

### 1. Database Setup (Backend)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dbname?schema=public"
   PORT=5050
   GOOGLE_CLIENT_ID="your-google-oauth-client-id" # (Optional)
   ```
4. Generate the Prisma client and push your schema to the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Seed the database with sample jobs, workers, and reviews:
   ```bash
   npm run seed
   ```

### 2. Frontend Setup
1. Return to the root directory and install dependencies:
   ```bash
   cd ..
   npm install
   ```
2. Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   VITE_API_BASE_URL="http://localhost:5050/api" # Fallback is automatic if left blank
   ```

---

## 🏃 Running the Application

For a fully functioning marketplace, you must run both the backend server and frontend server simultaneously.

### Start the Backend
```bash
cd backend
npm run dev
```
*Runs the Express server on [http://localhost:5050](http://localhost:5050)*

### Start the Frontend
```bash
# In a new terminal tab/window in the root directory
npm run dev
```
*Runs the Vite development server on [http://localhost:5173](http://localhost:5173)*

---

## 🌐 Deploying to Production & Custom Domains

To deploy this application to a custom domain:

1. **Deploy your PostgreSQL Database** using a managed service like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
2. **Deploy the Express Backend** to a cloud runner like [Render](https://render.com/) or [Railway](https://railway.app/). Ensure your database URL is supplied to the environment variables.
3. **Deploy the React Frontend** to a platform like [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
4. **Point Custom Domains**:
   * Set your main domain (e.g. `yourdomain.com`) to point to your Vercel/Netlify frontend.
   * Create a DNS subdomain `api.yourdomain.com` pointing to your Render/Railway backend address.
5. Make sure to update the environment variables:
   * Frontend: `VITE_API_BASE_URL=https://api.yourdomain.com/api`
   * Backend: `FRONTEND_URL=https://yourdomain.com`

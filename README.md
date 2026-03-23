# Split App - Full Stack Migration

This project has been migrated from a local `json-server` setup to a proper Full-Stack architecture using **Node.js/Express** and **MongoDB Atlas**.

## Project Structure
- `/` - Frontend (React + Vite)
- `/backend` - Backend (Express + Mongoose)

## Prerequisite: Setup MongoDB Atlas
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster and a Database User.
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`).
4. Get your **Connection String** (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/splitapp`).

## Local Development
1. Create a `.env` file in the root directory (or in `backend/`) with:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
2. Run the full stack:
   ```bash
   npm run dev-full
   ```
   This will start both the frontend (Vite) and the backend (Express).

## Data Migration (Optional)
If you want to move your existing data from `db.json` to MongoDB:
1. Ensure your `.env` is set up.
2. Run:
   ```bash
   node backend/migrate.js
   ```

## Deployment Instructions

### 1. Deploy the Backend (Recommended: Render)
- Connect your GitHub repo to [Render](https://render.com/).
- Create a new **Web Service**.
- **Build Command**: `npm install`
- **Start Command**: `npm start` (This runs `node backend/index.js`).
- Add Environment Variable: `MONGODB_URI`.
- Note down your backend URL (e.g., `https://split-app-backend.onrender.com`).

### 2. Update Frontend on Vercel
- Go to your Vercel Project Settings.
- Add an Environment Variable:
  - **Key**: `VITE_API_URL`
  - **Value**: Your backend URL (from step 1).
- Redeploy your frontend.

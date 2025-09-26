# Server README — Real-Time Chat App

This file documents the minimal steps required to build and run the backend on Render and locally.

## Purpose
Keep these instructions near the server code so deploys to Render are consistent and future contributors know which env vars and commands are required.

## Recommended Render service configuration
- Root Directory: `server` (recommended)
- Build Command: `npm install`
- Start Command: `npm start`

If you instead create the Render service at the repository root, set:
- Build Command: `npm install --prefix server`
- Start Command: `npm start --prefix server` (or configure the service to run `cd server && npm start`)

## Required environment variables (set in Render → Environment)
- `MONGO_URI` — your MongoDB connection string (required)
- `FRONTEND_URL` — the frontend URL to allow CORS and socket connections (e.g. `https://your-frontend.vercel.app`)
- `JWT_SECRET` — (if used by your auth logic)
- Any other secrets your server needs (e.g. OAuth keys)

Note: Render automatically provides the `PORT` environment variable; the server is already configured to use `process.env.PORT`.

## Why these settings
- The server binds to `process.env.PORT` so Render can detect the open port. If the server doesn't listen on that port, Render reports "No open ports detected".
- Using `FRONTEND_URL` avoids hard-coding origin values and lets you change the frontend origin without editing code.

## Local development (PowerShell)
From the project root or the `server` folder:

```powershell
# From repository root
cd "d:\Real-Time Chat Project\server"

# Install deps
npm install

# Set env vars for the session (PowerShell)
$env:MONGO_URI = "your_mongo_connection_string"
$env:FRONTEND_URL = "http://localhost:5173" # or your frontend dev URL
$env:JWT_SECRET = "some-secret"

# Start the server
npm run dev    # uses nodemon
# or
npm start
```

Verify:
- Console should show `MongoDB connected...` (if MONGO_URI valid)
- Console should show `Server listening on port 5000` (or whatever PORT you set)

## Commit & Deploy
After you make changes to the server files, commit and push to your branch so Render can deploy the new version.

Example (PowerShell):

```powershell
cd "d:\Real-Time Chat Project"

# Stage and commit
git add server/README.md server/index.js
git commit -m "Add Render instructions and bind server to process.env.PORT"

# Push
git push origin main
```

Then in Render:
- If Auto Deploy is enabled, a new deploy will start automatically.
- Or open the service and click "Manual Deploy" → "Deploy latest commit".

## Troubleshooting
- "No open ports detected": ensure `server/index.js` calls `server.listen(process.env.PORT || 5000)` and the process does not exit early due to missing env vars.
- Mongo connection failures: double-check `MONGO_URI` and that your DB allows connections from Render's IP ranges or is accessible publicly.
- CORS/socket issues: set `FRONTEND_URL` to your exact frontend origin including scheme (`https://...`).

If you want, I can also create a short script or GitHub Action to run basic checks before pushing.

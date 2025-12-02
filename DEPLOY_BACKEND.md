# LektorView Backend Deployment Guide

This guide explains how to deploy the LektorView backend to **Render.com** (a popular and easy-to-use cloud hosting provider).

## Prerequisites

1.  A GitHub account (or GitLab/Bitbucket).
2.  A [Render.com](https://render.com) account (you can sign up with GitHub).

## Step 1: Push Your Code to GitHub

If you haven't already, push your entire project to a new repository on GitHub.

```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy on Render

1.  Log in to your Render dashboard.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub account and select the repository you just pushed.
4.  Configure the service:
    *   **Name:** `lektorview-api` (or similar)
    *   **Region:** Choose one close to you (e.g., Frankfurt, Oregon).
    *   **Branch:** `main`
    *   **Root Directory:** `server` (Important! This tells Render the app is in the server folder)
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
    *   **Plan:** Free (for hobby projects)
5.  **Environment Variables:**
    *   Scroll down to "Environment Variables".
    *   Add `ADMIN_SECRET` with your secure password (e.g., `SuperSecretPassword123`).
    *   (Optional) Add `PORT` = `3001` (though Render usually assigns one automatically and injects it).

6.  Click **Create Web Service**.

## Step 3: Update Frontend Configuration

Once the deployment finishes, Render will give you a URL (e.g., `https://lektorview-api.onrender.com`).

1.  Go back to your code editor.
2.  Open `services/api.ts`.
3.  Update the `API_BASE_URL` constant:

```typescript
// services/api.ts
const API_BASE_URL = 'https://lektorview-api.onrender.com'; // Replace with your actual Render URL
```

## Step 4: Redeploy Frontend

Now that the frontend knows where the *real* backend is:

1.  Build the frontend:
    ```bash
    npm run build
    ```
2.  Deploy to Firebase (or wherever you host the frontend):
    ```bash
    firebase deploy
    ```

## Step 5: Verify

1.  Go to your deployed frontend URL (e.g., `https://your-app.web.app`).
2.  Enter the `ADMIN_SECRET` you set in Step 2.5 to generate an API Key.
3.  Use the API Key with your AI assistant.

**Note:** The Free tier on Render spins down after 15 minutes of inactivity. The first request after a while might take 30-60 seconds to respond.

# One-Click Free Deployment Guide

This guide explains how to deploy your **JARVIS AI Operating System** to the cloud using Vercel (for the Next.js frontend) and Render (for the FastAPI backend + PostgreSQL database), completely free.

---

## Step 1: Push Code to GitHub

First, you need to push your local repository codebase to a private or public GitHub repository.

1. Open a PowerShell/Terminal window in the project root: `C:\Users\Sriraj\.gemini\antigravity-ide\scratch\jarvis-ai\`
2. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: deploy autonomous jarvis os"
   ```
3. Create a new repository on your GitHub account (private is recommended).
4. Link and push the code:
   ```bash
   git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend & Postgres on Render

Render will read the [render.yaml](file:///C:/Users/Sriraj/.gemini/antigravity-ide/scratch/jarvis-ai/render.yaml) file to spin up both the database and the server automatically in one click.

1. Go to [Render.com](https://render.com/) and log in (sign up for a free account if you don't have one).
2. Click **New +** (top right) -> **Blueprint**.
3. Link your GitHub account and select your `jarvis-ai` repository.
4. Render will read the `render.yaml` file. Click **Apply**.
5. Render will now automatically create:
   - A **PostgreSQL Database** (`jarvis-db` on the Free plan).
   - A **FastAPI Web Service** (`jarvis-backend` on the Free plan, compiling the backend Dockerfile).
6. Once the build completes, copy your live backend URL from the top of the Render dashboard (e.g., `https://jarvis-backend.onrender.com`).

---

## Step 3: Deploy Frontend on Vercel

Vercel natively compiles and hosts Next.js applications for free.

1. Go to [Vercel.com](https://vercel.com/) and log in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Under **Project Settings**:
   - **Root Directory:** Click **Edit** and select the **`frontend`** directory (crucial!).
   - **Framework Preset:** Select **Next.js** (detected automatically).
5. Open the **Environment Variables** section and add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://jarvis-backend.onrender.com` (Your Render web service URL from Step 2).
6. Click **Deploy**. Vercel will compile the assets and provide a public URL (e.g., `https://jarvis-ai.vercel.app`).

---

## Step 4: Update Google Developer Console Authorized URIs

Since your backend redirect URI is now hosted publicly, you must register it in the Google Cloud Console.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Click edit on your OAuth 2.0 Client ID: `898826998745-gvf4ip55erq6ruua0kic7ah1f6shvp8e.apps.googleusercontent.com`
3. Under **Authorized redirect URIs**, add your new public Render callback URI:
   `https://jarvis-backend.onrender.com/api/auth/google/callback`
4. Click **Save**.

Your live public operating system dashboard is now ready for operations! Open your public Vercel URL, log in with `admin@jarvis.ai` / `jarvispass`, and enjoy!

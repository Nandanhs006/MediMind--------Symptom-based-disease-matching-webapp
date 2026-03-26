# Render Environment Variables Setup Guide

## Problem Identified

Your Render deployment is getting 500 errors because **environment variables are not being properly passed to the application**. Render doesn't automatically read `.env` files - you must set each variable in the Render Dashboard.

## Solution: Set Environment Variables in Render Dashboard

### Step 1: Go to Your Render Service

1. Open Render: https://dashboard.render.com
2. Click on your service: `medimind-webapp` (or similar name)
3. Go to the **Environment** tab on the left sidebar

### Step 2: Add Each Environment Variable

You need to add the following variables. Copy the values from your `.env` file locally:

| Variable Name | Value | Source |
|---|---|---|
| `DB_USER` | `neondb_owner` | From your `.env` file |
| `DB_HOST` | `ep-twilight-tree-a12gq7g4-pooler.ap-southeast-1.aws.neon.tech` | From your `.env` file |
| `DB_NAME` | `neondb` | From your `.env` file |
| `DB_PASSWORD` | `npg_l50GMpoyKnca` | From your `.env` file |
| `DB_PORT` | `5432` | From your `.env` file |
| `DB_SSL` | `require` | Already in render.yaml |
| `NODE_ENV` | `production` | Already set in render.yaml |

### Step 3: Add Variables One by One

For each variable:
1. Click **"Add Environment Variable"** (if first time) or **"Edit"** (existing)
2. Enter the **Key** (e.g., `DB_USER`)
3. Enter the **Value** (e.g., `neondb_owner`)
4. Click **Save**

⚠️ **IMPORTANT**: Do NOT put quotes around values. Enter raw values only.

Example for DB_PASSWORD:
```
❌ Wrong: DB_PASSWORD = "npg_l50GMpoyKnca"
✅ Right: DB_PASSWORD = npg_l50GMpoyKnca
```

### Step 4: Redeploy

After adding all environment variables:
1. Go back to your service page
2. Click the **"..."** menu (top right)
3. Select **"Clear build cache & redeploy"**
4. Wait 2-3 minutes for the redeploy to complete

### Step 5: Test

After redeploy:

**Test symptom search:**
```
https://medimind-1-ejio.onrender.com/api/symptoms?q=fever
```

Expected response: `["fever"]`

**Test disease prediction:**
```
POST https://medimind-1-ejio.onrender.com/api/predict
Content-Type: application/json

{"symptoms": ["fever", "cough"]}
```

Expected response: Disease list with match percentages

## Why This Happens

- **Local development**: Uses `.env` file (safe for development)
- **Render deployment**: Only uses Dashboard environment variables (secure, doesn't expose secrets in code)

Render's `.gitignore` correctly excludes `.env` files from being deployed, so the variables must be set separately.

## Troubleshooting

### Still getting 500 errors?
1. Check Render logs: Service → Logs tab
2. Verify exact variable names (case-sensitive)
3. Ensure no extra spaces in values
4. Confirm all 7 variables are set

### "Connection refused" error?
- Verify Neon database is still active
- Check that DB_HOST, DB_USER, DB_PASSWORD are exactly correct

### "Database not found" error?
- Verify DB_NAME is `neondb`
- Verify DB_PORT is `5432`

## Quick Checklist

- [ ] Opened Render Dashboard
- [ ] Found medimind-webapp service
- [ ] Opened Environment tab
- [ ] Added DB_USER
- [ ] Added DB_HOST
- [ ] Added DB_NAME
- [ ] Added DB_PASSWORD
- [ ] Added DB_PORT
- [ ] Clicked "Clear build cache & redeploy"
- [ ] Waited 2-3 minutes
- [ ] Tested API endpoints

Need help? Check the Render logs for detailed error messages that will guide next steps.

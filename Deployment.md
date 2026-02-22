# Deployment (Netlify)

This document describes how to deploy the Insurance Platform to **Netlify** using **three separate sites**: one for the container (host) and one for each remote MFE (Policy Details, Pay Premium). The container loads the remotes from their deploy URLs; remotes use their deploy URL as `publicPath`.

**Note:** Pay Premium runs cross-origin when loaded by the container, so payment validation uses the existing main-thread fallback (the Web Worker is only used when opening Pay Premium standalone).

---

## Overview

| Site            | Build command                          | Publish directory          | Key env vars                         |
|-----------------|----------------------------------------|----------------------------|--------------------------------------|
| Container       | `npm run build -w container`            | `container/dist`           | `MFE_POLICY_URL`, `MFE_PREMIUM_URL`  |
| Policy Details  | `npm run build -w mfe-policy-details`   | `mfe-policy-details/dist`  | `MFE_POLICY_PUBLIC_PATH`             |
| Pay Premium     | `npm run build -w mfe-pay-premium`      | `mfe-pay-premium/dist`     | `MFE_PREMIUM_PUBLIC_PATH`            |

**Build order:** Deploy the two remotes (Policy Details and Pay Premium) first, then the container, so the container’s environment variables point at the live remote URLs.

---

## 1. Code changes required

### 1.1 Container — env-based remotes

**File:** `container/webpack.config.js`

- Read `process.env.MFE_POLICY_URL` and `process.env.MFE_PREMIUM_URL`.
- If both are set (e.g. on Netlify), set Module Federation `remotes` to:
  - `policyDetails@${MFE_POLICY_URL}remoteEntry.js`
  - `payPremium@${MFE_PREMIUM_URL}remoteEntry.js`
- URLs must **end with `/`** (e.g. `https://insurance-policy.netlify.app/`).
- When either env var is unset, keep the current localhost URLs for local development.

### 1.2 Policy Details MFE — env-based publicPath

**File:** `mfe-policy-details/webpack.config.js`

- Set `output.publicPath` to:
  - `process.env.MFE_POLICY_PUBLIC_PATH` if set, or
  - In production, the deployed origin (e.g. `https://insurance-policy.netlify.app/`), or
  - `http://localhost:3001/` for development.
- On Netlify you can set `MFE_POLICY_PUBLIC_PATH` to the site’s deploy URL, or use Netlify’s `DEPLOY_PRIME_URL` in the build.

### 1.3 Pay Premium MFE — env-based publicPath

**File:** `mfe-pay-premium/webpack.config.js`

- Same as Policy Details: set `output.publicPath` from `process.env.MFE_PREMIUM_PUBLIC_PATH` or the production deploy URL; otherwise `http://localhost:3002/` for development.

---

## 2. Netlify configuration

Create **three Netlify sites** (same repo; each site has its own build command and publish directory).

### 2.1 Container site

- **Build command:** `npm run build -w container`
- **Publish directory:** `container/dist`
- **Base directory:** (repo root)
- **Environment variables (required):**
  - `MFE_POLICY_URL` = `https://<your-policy-site>.netlify.app/`
  - `MFE_PREMIUM_URL` = `https://<your-premium-site>.netlify.app/`
- **Redirects (SPA):** `/* /index.html 200`  
  Configure in Netlify UI (Redirects) or via `netlify.toml`, or add `container/public/_redirects` with that line and ensure it is copied into `container/dist` during the build.

### 2.2 Policy Details site

- **Build command:** `npm run build -w mfe-policy-details`
- **Publish directory:** `mfe-policy-details/dist`
- **Base directory:** (repo root)
- **Environment variable:** `MFE_POLICY_PUBLIC_PATH` = the site’s deploy URL (e.g. `https://insurance-policy.netlify.app/`), or use `DEPLOY_PRIME_URL` in the build to set it automatically.
- **CORS:** Add a `_headers` file so the container can load the remote. For example, in `mfe-policy-details/public/_headers` (and ensure it is copied to the publish directory):
  ```
  /*
    Access-Control-Allow-Origin: *
  ```

### 2.3 Pay Premium site

- **Build command:** `npm run build -w mfe-pay-premium`
- **Publish directory:** `mfe-pay-premium/dist`
- **Base directory:** (repo root)
- **Environment variable:** `MFE_PREMIUM_PUBLIC_PATH` = the site’s deploy URL (e.g. `https://insurance-premium.netlify.app/`), or use `DEPLOY_PRIME_URL`.
- **CORS:** Same as Policy Details — add `_headers` with `Access-Control-Allow-Origin: *` (or restrict to your container origin if you prefer).

---

## 3. netlify.toml (optional)

You can use a single `netlify.toml` at the repo root for the **container** site (build command, publish, redirects). For the Policy Details and Pay Premium sites, configure build command, publish directory, and env vars in the Netlify dashboard, since each of the three sites needs different values. Document the three setups in the README.

Example for the container only:

```toml
[build]
  command = "npm run build -w container"
  publish = "container/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 4. Deploy order

1. Deploy **Policy Details** and **Pay Premium** first (so they have stable URLs).
2. Note their deploy URLs (e.g. `https://insurance-policy.netlify.app/`, `https://insurance-premium.netlify.app/`).
3. In the **Container** site, set `MFE_POLICY_URL` and `MFE_PREMIUM_URL` to those URLs (with trailing `/`).
4. Deploy the **Container** site.

After that, any change to a remote only requires redeploying that site; container redeploys are needed when you change the container app or when you want to point at new remote URLs.

# Deployment Guide (Netlify)

This document describes how to deploy the **Insurance Platform** using **Netlify**.
The system is deployed as **three independent sites**:

1. **Container (Host Application)**
2. **Policy Details Micro Frontend**
3. **Pay Premium Micro Frontend**

The container dynamically loads the remote MFEs using **Webpack Module Federation**.

Remotes are deployed independently and expose their `remoteEntry.js` files, which the container loads using environment variables.

---

## Live Deployment

| Service                                   | Status                                                                                                                                                                          | Live URL                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Insurance Platform – Container (Host)** | [![Netlify Status](https://api.netlify.com/api/v1/badges/f8c3dc5c-7eb0-4d75-9111-c1dee6f342d8/deploy-status)](https://app.netlify.com/projects/insurance-platform/deploys)      | https://insurance-platform.prasunguchhait.com |
| **Policy Details – Micro Frontend**       | [![Netlify Status](https://api.netlify.com/api/v1/badges/14690904-43f5-4ae6-a227-1af140aed214/deploy-status)](https://app.netlify.com/projects/mfe1-insurance-platform/deploys) | https://mfe-policy-detail.prasunguchhait.com  |
| **Pay Premium – Micro Frontend**          | [![Netlify Status](https://api.netlify.com/api/v1/badges/cfd011c2-aeb6-4544-b35d-6d3e08335759/deploy-status)](https://app.netlify.com/projects/mfe2-insurance-platform/deploys) | https://mfe-pay-premium.prasunguchhait.com    |

---

# Deployment Architecture

```
                    Netlify
                       │
                       │
               ┌───────────────┐
               │  Container    │
               │ (Host App)    │
               │               │
               │ Loads Remotes │
               └───────┬───────┘
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
     ┌──────────────┐   ┌──────────────┐
     │ Policy MFE   │   │ Premium MFE  │
     │ Netlify Site │   │ Netlify Site │
     └──────────────┘   └──────────────┘
```

---

# Deployment Overview

| Site           | Build Command                         | Publish Directory         | Environment Variables               |
| -------------- | ------------------------------------- | ------------------------- | ----------------------------------- |
| Container      | `npm run build -w container`          | `container/dist`          | `MFE_POLICY_URL`, `MFE_PREMIUM_URL` |
| Policy Details | `npm run build -w mfe-policy-details` | `mfe-policy-details/dist` | `MFE_POLICY_PUBLIC_PATH`            |
| Pay Premium    | `npm run build -w mfe-pay-premium`    | `mfe-pay-premium/dist`    | `MFE_PREMIUM_PUBLIC_PATH`           |

---

# Shared Library

The **shared-storage** workspace package is **not deployed separately**.

It is bundled during the build process into:

* Container
* Policy Details MFE
* Pay Premium MFE

No separate Netlify site is required.

---

# Step 1 — Container Configuration

## File

```
container/webpack.config.js
```

The container loads remotes dynamically using environment variables.

### Required Environment Variables

```
MFE_POLICY_URL
MFE_PREMIUM_URL
```

Example:

```
MFE_POLICY_URL=https://insurance-policy.netlify.app/
MFE_PREMIUM_URL=https://insurance-premium.netlify.app/
```

Important:

* URLs **must end with `/`**
* The container resolves:

```
policyDetails@${MFE_POLICY_URL}remoteEntry.js
payPremium@${MFE_PREMIUM_URL}remoteEntry.js
```

For local development, the container falls back to:

```
http://localhost:3001/
http://localhost:3002/
```

---

# Step 2 — Policy Details MFE Configuration

## File

```
mfe-policy-details/webpack.config.js
```

Set the `publicPath` dynamically:

```
output: {
  publicPath: process.env.MFE_POLICY_PUBLIC_PATH || "http://localhost:3001/"
}
```

### Netlify Environment Variable

```
MFE_POLICY_PUBLIC_PATH=https://insurance-policy.netlify.app/
```

Alternatively, you can use Netlify’s built-in variable:

```
DEPLOY_PRIME_URL
```

---

# Step 3 — Pay Premium MFE Configuration

## File

```
mfe-pay-premium/webpack.config.js
```

```
output: {
  publicPath: process.env.MFE_PREMIUM_PUBLIC_PATH || "http://localhost:3002/"
}
```

### Netlify Environment Variable

```
MFE_PREMIUM_PUBLIC_PATH=https://insurance-premium.netlify.app/
```

---

# Step 4 — Configure Netlify Sites

Create **three Netlify sites** using the same repository.

---

# Container Site

### Base Directory

```
container
```

### Build

Handled via:

```
container/netlify.toml
```

### Example

```
[build]
command = "cd .. && npm run build -w container"
publish = "dist"
```

### Environment Variables

```
MFE_POLICY_URL
MFE_PREMIUM_URL
```

### SPA Redirect

Add:

```
/* /index.html 200
```

This can be configured in:

* Netlify UI (Redirects)
* `netlify.toml`
* `public/_redirects`

---

# Policy Details Site

### Build Command

```
npm run build -w mfe-policy-details
```

### Publish Directory

```
mfe-policy-details/dist
```

### Environment Variable

```
MFE_POLICY_PUBLIC_PATH
```

### CORS Configuration

Create file:

```
mfe-policy-details/public/_headers
```

```
/*
Access-Control-Allow-Origin: *
```

This allows the container to load the remote module.

---

# Pay Premium Site

### Build Command

```
npm run build -w mfe-pay-premium
```

### Publish Directory

```
mfe-pay-premium/dist
```

### Environment Variable

```
MFE_PREMIUM_PUBLIC_PATH
```

### CORS Configuration

Create file:

```
mfe-pay-premium/public/_headers
```

```
/*
Access-Control-Allow-Origin: *
```

---

# Web Worker Behavior

The **Pay Premium MFE** uses a Web Worker for payment validation when running **standalone**.

When loaded through the container:

```
container domain ≠ premium MFE domain
```

the application runs **cross-origin**, which prevents the worker from loading due to browser security restrictions.

In this scenario, the application automatically **falls back to main-thread validation**.

---

# Deployment Order

Deploy the applications in the following order:

1. **Policy Details MFE**
2. **Pay Premium MFE**
3. **Container**

After deploying the two remotes, configure the container environment variables using their live URLs and deploy the container.

---

# Updating Deployments

| Change                   | Required Deployment  |
| ------------------------ | -------------------- |
| Policy UI change         | Redeploy Policy MFE  |
| Premium UI change        | Redeploy Premium MFE |
| Container routing change | Redeploy Container   |
| Remote URL change        | Redeploy Container   |

---

# Summary

The Insurance Platform demonstrates a **fully distributed frontend deployment model**.

Key benefits:

* Independent deployments
* Runtime composition using Module Federation
* Shared storage for cross-MFE data
* Event-based communication between MFEs

This architecture allows frontend teams to **develop and release features independently while maintaining a unified user experience**.

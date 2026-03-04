# Insurance Platform
![React](https://img.shields.io/badge/React-18-blue)
![Webpack](https://img.shields.io/badge/Webpack-5-blue)
![Module Federation](https://img.shields.io/badge/Module%20Federation-Micro%20Frontends-orange)
![MUI](https://img.shields.io/badge/MUI-5-purple)
![Netlify](https://img.shields.io/badge/Deployment-Netlify-green)

A **Micro Frontend (MFE) proof-of-concept insurance client platform** built using **React, Webpack Module Federation, and Material UI**.

The application demonstrates a **scalable frontend architecture** where independent frontend applications are deployed separately and composed dynamically at runtime.

The system consists of:

* **Container (Host Application)**
* **Policy Details Micro Frontend**
* **Pay Premium Micro Frontend**
* **Shared Storage Library**

The container dynamically loads the MFEs using **Webpack Module Federation**.

---

## Live Deployment

| Service                                   | Status                                                                                                                                                                          | Live URL                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Insurance Platform – Container (Host)** | [![Netlify Status](https://api.netlify.com/api/v1/badges/f8c3dc5c-7eb0-4d75-9111-c1dee6f342d8/deploy-status)](https://app.netlify.com/projects/insurance-platform/deploys)      | https://insurance-platform.prasunguchhait.com |
| **Policy Details – Micro Frontend**       | [![Netlify Status](https://api.netlify.com/api/v1/badges/14690904-43f5-4ae6-a227-1af140aed214/deploy-status)](https://app.netlify.com/projects/mfe1-insurance-platform/deploys) | https://mfe-policy-detail.prasunguchhait.com  |
| **Pay Premium – Micro Frontend**          | [![Netlify Status](https://api.netlify.com/api/v1/badges/cfd011c2-aeb6-4544-b35d-6d3e08335759/deploy-status)](https://app.netlify.com/projects/mfe2-insurance-platform/deploys) | https://mfe-pay-premium.prasunguchhait.com    |

---

## Features
### My Policies

* View list of insurance policies
* Policy cards display:

  * Policy type
  * Policy status
  * Premium amount
  * Due date
  * Sum assured
* Shows **Recently Paid badge** when payment is completed

### Pay Premium

Users can:

* Select a policy
* Enter premium amount
* Choose payment method
* Submit payment (simulation)

⚠️ No real payment processing is implemented.

---

## Architecture Overview

```
Container (Host)
Port: 5000
│
├── Policy Details MFE (Port 3001)
│     Displays policies and payment status
│
├── Pay Premium MFE (Port 3002)
│     Handles premium payment workflow
│
└── shared-storage
      Shared data layer + event bus
```

The **Container application** loads the MFEs dynamically using **Webpack Module Federation**.

---
## High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                    Container (Host) – port 5000                    │
│  • Shell: MUI theme, AppBar, “Insurance Platform” logo, nav        │
│  • Routes: / → Policy Details MFE, /pay-premium → Pay Premium MFE  │
│  • Module Federation: loads policyDetails + payPremium remotes     │
│  • RemoteErrorBoundary wraps remotes                               │
|                                                                    |
|  Loads Remote MFEs using Module Federation                         |
└───────────────────────────┬────────────────────────────────────────┘
                            │
        ┌───────────────────|────────────────────┐
        ▼                   ▼                    ▼ 
┌───────────────┐   ┌───────────────┐   ┌──────────────────┐
│ Policy Details│   │ Pay Premium   │   │ shared-storage   │
│ MFE (3001)    │   │ MFE (3002)    │   │ (workspace lib)  │
│               │   │               │   │                  │
│ • Policy list │   │ • Policy pick │   │ • getUser        │
│ • Policy cards│   │ • Payment form│   │ • getPolicies    │
│ • Recently    │   │       │       │   │ • getPolicyById  │
│   paid badge  │   │       ▼       │   │ • getPayments    │
│               │   │ ┌───────────┐ │   │ • addPayment     │
└───────┬───────┘   │ │  WORKER   │ │   │ • eventBus       │
        │           │ │ validation│ │   └────────┬─────────┘
        │           │ └───────────┘ │            │
        │           └───────┬───────┘            │
        │    Event Bus      │                    │
        └───────────────────┴────────────────────┘
                (payment-complete → Policy Details)
```

**Web Worker (Pay Premium MFE)**  
Payment validation runs off the main thread when the MFE is same-origin with the page. The worker (`payment.worker.js`) receives policyId, amount, method; validates; returns either errors or a validated payload with `validatedAt`. Main thread submits the result and updates UI. When cross-origin (e.g. MFE on 3002, page on 5000), the worker is not used and validation runs on the main thread to avoid `SecurityError`.

- **Container**: Host app; provides theme, layout, and routing. Entry uses bootstrap pattern (`index.jsx` → `import('./bootstrap')`) to avoid shared-module eager consumption.
- **Policy Details MFE**: Remote app; shows policies and subscribes to `payment-complete` to show “Recently paid.”
- **Pay Premium MFE**: Remote app; payment form; **Web Worker** runs payment validation off the main thread when same-origin (see Worker callout above); otherwise validates on main thread.
- **shared-storage**: Shared workspace package; in-memory read/write backed by `localStorage`; exports `eventBus` (subscribe/publish) for cross-MFE events.

## Tech Stack

| Area           | Choice                          |
|----------------|---------------------------------|
| UI             | React 18, MUI 5                 |
| Routing        | React Router v6                 |
| Bundling       | Webpack 5                       |
| Federation     | Module Federation               |
| Styles         | Sass (SCSS), MUI + Emotion      |
| State / Data   | shared-storage + localStorage   |
| Concurrency    | Web Worker (Pay Premium)        |

## Cross-Cutting Concerns

- **Web Worker** – Pay Premium runs payment validation in a worker when the app is same-origin; otherwise falls back to main-thread validation.
- **Sass** – Used in container and both MFEs; `sass-loader` configured with `silenceDeprecations: ['legacy-js-api']` for Dart Sass.
- **Event bus** – `shared-storage` exposes `eventBus.subscribe` / `eventBus.publish`. Pay Premium publishes `payment-complete`; Policy Details subscribes and shows “Recently paid.”
- **Bootstrap pattern** – Container and both MFEs use an entry that only `import('./bootstrap')` so shared modules are not loaded eagerly; real app mounts in `bootstrap.jsx`.
- **Module Federation** - Container dynamically loads remote application

## Project Structure

```
insurance-platform/
├── package.json              # Workspaces + dev/build scripts
├── container/                # Host (port 5000)
│   ├── src/
│   │   ├── index.jsx         # Entry → bootstrap
│   │   ├── bootstrap.jsx     # ThemeProvider, App, Router
│   │   ├── App.jsx           # AppBar, routes, remotes
│   │   ├── theme.js          # MUI theme
│   │   └── RemoteErrorBoundary.jsx
│   └── webpack.config.js     # Module Federation host
├── mfe-policy-details/       # Remote (port 3001)
│   ├── src/
│   │   ├── index.jsx         # Entry → bootstrap
│   │   ├── bootstrap.jsx
│   │   ├── App.jsx
│   │   └── PolicyCard.jsx
│   └── webpack.config.js     # exposes PolicyDetailsApp
├── mfe-pay-premium/          # Remote (port 3002)
│   ├── src/
│   │   ├── index.jsx         # Entry → bootstrap
│   │   ├── bootstrap.jsx
│   │   ├── App.jsx
│   │   ├── PaymentForm.jsx
│   │   └── payment.worker.js
│   └── webpack.config.js     # exposes PayPremiumApp
└── shared-storage/           # Shared library (no server)
    └── src/index.js          # Storage API + eventBus
```

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v7+ for workspaces)

## Getting Started

1. **Install dependencies** (from repo root):

   ```bash
   npm install
   ```

2. **Run all apps** (container + both MFEs):

   ```bash
   npm run dev
   ```

   Then open **http://localhost:5000**. Use “My Policies” and “Pay Premium” in the nav.

3. **Build for production**:

   ```bash
   npm run build
   ```

   Then run the container:

   ```bash
   npm run start
   ```

   (Remotes must be built and served from their expected URLs, or host them and update container remotes in `webpack.config.js`.)

## Scripts

| Script                      | Description                                      |
|-----------------------------|--------------------------------------------------|
| `npm run dev`               | Start container + both MFEs (5000, 3001, 3002)   |
| `npm run build`             | Build all workspaces                             |
| `npm run build:container`   | Build container only                             |
| `npm run build:policy`      | Build Policy Details MFE                         |
| `npm run build:premium`     | Build Pay Premium MFE                            |
| `npm run start`             | Serve container only (after build)               |
| `npm run start:container`   | Same as `start`                                  |
| `npm run start:policy`      | Serve Policy Details on 3001                     |
| `npm run start:premium`     | Serve Pay Premium on 3002                        |

## Ports

| App              | Port |
|------------------|------|
| Container (host) | 5000 |
| Policy Details   | 3001 |
| Pay Premium      | 3002 |

## Shared Storage API

- `getUser()` – Current user
- `getPolicies()` – List of policies
- `getPolicyById(id)` – Single policy
- `getPayments()` – List of payments
- `addPayment(payment)` – Add payment (returns saved payment)
- `eventBus.subscribe(event, handler)` – Subscribe to events (e.g. `'payment-complete'`)
- `eventBus.publish(event, detail)` – Publish event

Data key in `localStorage`: `insurance_platform_data`.

## Deploying to Netlify

The app deploys as **three Netlify sites** (container + Policy Details + Pay Premium). See [Deployment.md](Deployment.md) for the full guide. Summary:

- **Container:** Set Netlify **Base directory** to `container` so it uses [container/netlify.toml](container/netlify.toml) (build, publish, redirects). Set env vars `MFE_POLICY_URL` and `MFE_PREMIUM_URL` to the two remote deploy URLs (with trailing `/`).
- **Policy Details:** Build `npm run build -w mfe-policy-details`, publish `mfe-policy-details/dist`. Set `MFE_POLICY_PUBLIC_PATH` (or Netlify’s `DEPLOY_PRIME_URL` is used). CORS `_headers` are copied into dist.
- **Pay Premium:** Build `npm run build -w mfe-pay-premium`, publish `mfe-pay-premium/dist`. Set `MFE_PREMIUM_PUBLIC_PATH` (or `DEPLOY_PRIME_URL`). CORS `_headers` are copied into dist.

**Deploy order:** 
>- 1️⃣ Deploy **Policy Details MFE**
>- 2️⃣ Deploy **Pay Premium MFE**
>- 3️⃣ Deploy **Container**

## License

MIT

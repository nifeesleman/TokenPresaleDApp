# TokenPresaleDApp – Dependency & Web3 Fix

## Overview
This repository documents stabilizing and fixing a **Token Presale DApp** built with **Vite + React + Web3**.  
Work focused on resolving dependency conflicts, aligning tooling with Vite, and fixing a critical **MetaMask wallet connection UI state** issue that can block presale flows.

---

## Issues Identified
- Dependency conflicts and unused packages causing install/build failures
- Jest configured in a Vite-based project (mismatched toolchain)
- MetaMask connection could succeed, but the UI state did not reliably reflect the connected wallet
- “Connect Wallet” remained enabled when it should be disabled
- Presale flow blocked due to incorrect/unsynchronized wallet state handling

---

## Dependency Updates

### Removed Dependencies
The following packages were removed to eliminate conflicts and unused tooling:

- `mdbreact`
- `@testing-library/jest-dom`
- `@testing-library/react`
- `@testing-library/user-event`
- `vite-plugin-node-polyfills`
- `yarn`
- Unused `prepare` script

---

### Updated / Aligned Dependencies
The following dependencies were updated/aligned to ensure compatibility and a stable build:

- `react` → aligned to a Vite-compatible version
- `react-dom` → aligned with the React version
- `@vitejs/plugin-react` → aligned for stable Vite integration
- `test` script → changed from `jest` to `vitest`

```json
"test": "vitest"
```

---

##  Show That It Works

Run the commands below on Linux to confirm the project installs, builds, and tests successfully:

```sh
npm install
npm run smoke
```

`npm run start` performs a minimal “proof run” by executing:
- `vite build` (confirms the app builds)
- `vitest` (confirms the test runner works)

---

## What to Submit

1. **Fixed `package.json`**
2. **Small codebase** (only files required to run the proof)
3. **Proof script** (the smoke test) and the command used to run it

---

## Goal
Demonstrate the ability to:
- Spot dependency issues quickly
- Fix version/tooling conflicts
- Restore a broken Node.js/Vite project to a working state


# Bitcoin Staking dApp

The Bitcoin Staking dApp is a web application integrating with extension
wallets that allows a user to stake their Bitcoin. It is hosted by Babylon and
serves as a reference implementation for entities that want to set up their own
staking website.

## Develop

To set up a development environment, first specify the required environment
variables in the `.env.local` file in the root directory:

```
cp .env.example .env.local
```

where,

- `VITE_MEMPOOL_API` specifies the mempool.space host to use for Bitcoin
  node queries
- `VITE_API_URL` specifies the back-end API to use for the staking
  system queries
- `VITE_NETWORK` specifies the BTC network environment
- `VITE_DISPLAY_TESTING_MESSAGES` boolean value to indicate whether display
testing network related message. Default to true
- `VITE_FIXED_STAKING_TERM` boolean value to indicate whether the staking term is fixed. Default to false
- `VITE_STAKING_DISABLED` boolean value to disable staking on the dashboard
- `VITE_BBN_GAS_PRICE` specifies the gas price for BABY. Default to 0.002
- `VITE_SENTRY_DSN` specifies the Sentry DSN for error reporting
- `VITE_SIDECAR_API_URL` specifies the base URL for the sidecar API service
- `VITE_BABY_RPC_URL` specifies the RPC to override the default values
- `VITE_BABY_LCD_URL` specifies the LCD to override the default values
- `VITE_COMMIT_HASH` (Optional) The git commit hash, usually injected during CI build for reference.
- `VITE_BABYLON_EXPLORER` (Optional) specifies the URL for the Babylon block explorer.
- `VITE_REPLAYS_RATE` (Optional) specifies the sample rate for Sentry Session Replays (0.0 to 1.0).
- `SENTRY_ORG` (Optional) The Sentry organization slug, needed for source map uploads during build.
- `SENTRY_PROJECT` (Optional) The Sentry project slug, needed for source map uploads during build.
- `SENTRY_URL` (Optional) The URL to your self-hosted Sentry instance, needed for source map uploads during build.

Then, to start a development server:

```bash
npm run dev
```

## Wallet Integration

Instructions for wallet integration can be found in the
[bbn-wallet-connect documentation](https://github.com/babylonlabs-io/bbn-wallet-connect).

## E2E Tests

To build the E2E tests, run:
```bash
npm run build:e2e
```

To run the E2E tests, run:
```bash
npm run test:e2e
```

Note that the E2E tests use the environment variables specified in the `.env.test` file.

The E2E tests are located in the `e2e/specs` directory.


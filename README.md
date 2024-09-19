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

- `NEXT_PUBLIC_MEMPOOL_API` specifies the mempool.space host to use for Bitcoin
  node queries
- `NEXT_PUBLIC_API_URL` specifies the back-end API to use for the staking
  system queries
- `NEXT_PUBLIC_POINTS_API_URL` specifies the Points API to use for the points
  system
- `NEXT_PUBLIC_NETWORK` specifies the BTC network environment
- `NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES` boolean value to indicate whether display
testing network related message. Default to true

Then, to start a development server:

```bash
npm run dev
```

## Wallet Integration

Instructions for wallet integration can be found in this
[document](./docs/WalletIntegration.md).

## E2E
The end-to-end (E2E) tests are implemented using Playwright. These tests simulate user interactions with the application to ensure that all functionalities work as expected across different Bitcoin network environments (`mainnet` and `signet`). The tests utilize *some* mocked data to prevent interactions with real Bitcoin networks, ensuring safe and reliable testing.

### Prerequisites
Before running the E2E tests, ensure that you have completed the following steps:

- Environment Configuration: Set up the necessary environment variables.
- Install Dependencies: Ensure all dependencies are installed.

### Environment Configuration
The E2E tests can be run using either the .env.local file or the specific environment files .env.mainnet and .env.signet. These files should contain the following environment variables:

- `NEXT_PUBLIC_NETWORK`: Specifies the BTC network environment (mainnet or signet).
- `NEXT_PUBLIC_MEMPOOL_API`: Specifies the mempool.space host to use for Bitcoin node queries.
- `NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES`: Boolean value to indicate whether to display testing network-related messages.
- `NEXT_PUBLIC_API_URL`: Specifies the back-end API to use for staking system queries.

### Commands to run E2E
- `npx playwright install` to install playwright. This is *required* to do after the `npm install`
- Stop the current `dev` server in case you ran it with `npm run dev`
- `npm run test:e2e` to run the test using the network in `.env.local`
- `npm run test:e2e:full` to run the test using the networks in `.env.mainnet` and `.env.signet`

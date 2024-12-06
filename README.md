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

```bash
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_MEMPOOL_API=https://babylon.mempool.space
```


# Instructions for Integrating Staking in Your Mobile Wallet Browser

To integrate staking functionality into your mobile wallet browser, follow the steps below:

1. **Implement Abstract Methods**: Implement all abstract methods defined in `src/utils/wallet/wallet_provider.ts` by utilizing your own provider's methods. This ensures that your wallet provider conforms to the necessary interface for staking.

2. **[Optional] Override Non-Abstract Methods**: If your provider's API includes methods that can achieve the same outcomes as any non-abstract methods in `wallet_provider.ts`, consider overriding these methods with your provider-specific implementations.

3. **Inject Instance**: Once your wallet provider is properly configured, inject its instance into the global window object of your wallet browser as `window.btcwallet`. This makes the provider accessible for staking operations within the browser environment.

For a practical example of how these steps can be implemented, refer to the `okx_wallet.ts` file.


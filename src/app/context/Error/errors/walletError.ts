import { ErrorType } from "@/app/types/errors";
import { ChainType } from "@/app/types/network";

export const enum WalletErrorType {
  ConnectionCancelled = "ConnectionCancelled",
  ConnectionFailed = "ConnectionFailed",
  UnsupportedWallet = "UnsupportedWallet",
  UnsupportedNetwork = "UnsupportedNetwork",
  AddressTypeNotSupported = "AddressTypeNotSupported",
  SigningFailed = "SigningFailed",
  WalletNotDetected = "WalletNotDetected",
  WalletDisconnected = "WalletDisconnected",
  WalletNotInitialized = "WalletNotInitialized",
  WalletNotConnected = "WalletNotConnected",
}

export class WalletError extends Error {
  readonly name: string = "WalletError";
  readonly displayMessage: string;
  readonly errorType: WalletErrorType;
  readonly chainType?: ChainType;
  readonly chainId?: string;
  readonly walletProviderName?: string;
  readonly metadata?: Record<string, any>;
  readonly type: ErrorType;

  /**
   * @param errorType      Type of wallet error
   * @param message        Error message
   * @param chainType      Type of chain (BBN or BTC)
   * @param chainId        ID of the chain
   * @param walletProviderName     Name of the wallet provider (Keplr, OKX, etc.)
   * @param metadata       Additional metadata about the error
   */
  constructor({
    errorType,
    message,
    chainType,
    chainId,
    walletProviderName,
    metadata,
  }: {
    errorType: WalletErrorType;
    message: string;
    chainType?: ChainType;
    chainId?: string;
    walletProviderName?: string;
    metadata?: Record<string, any>;
  }) {
    super(message);
    this.errorType = errorType;
    this.chainType = chainType;
    this.chainId = chainId;
    this.walletProviderName = walletProviderName;
    this.metadata = metadata || {};
    this.displayMessage = this.getDisplayMessageFromType(errorType, message);
    this.type = ErrorType.WALLET;
    Object.setPrototypeOf(this, WalletError.prototype);
  }

  private getDisplayMessageFromType(
    type: WalletErrorType,
    message: string,
  ): string {
    const baseMessage = this.getBaseMessageForType(type);
    return message
      ? `${baseMessage}${message !== baseMessage ? ` Details: ${message}` : ""}`
      : baseMessage;
  }

  private getBaseMessageForType(type: WalletErrorType): string {
    switch (type) {
      case WalletErrorType.ConnectionCancelled:
        return "Connection was cancelled by the user.";
      case WalletErrorType.ConnectionFailed:
        return "Failed to connect to wallet.";
      case WalletErrorType.UnsupportedWallet:
        return "This wallet is not supported.";
      case WalletErrorType.UnsupportedNetwork:
        return "This network is not supported.";
      case WalletErrorType.AddressTypeNotSupported:
        return "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.";
      case WalletErrorType.SigningFailed:
        return "Failed to sign transaction.";
      case WalletErrorType.WalletNotDetected:
        return "Wallet extension not detected. Please install the wallet extension.";
      case WalletErrorType.WalletDisconnected:
        return "Wallet is disconnected. Please connect your wallet.";
      case WalletErrorType.WalletNotInitialized:
        return "Wallet is not initialized.";
      case WalletErrorType.WalletNotConnected:
        return "Wallet is not connected. Please connect your wallet.";
      default:
        return "An unexpected wallet error occurred.";
    }
  }

  public getType(): WalletErrorType {
    return this.errorType;
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getChainType(): ChainType | undefined {
    return this.chainType;
  }

  public getChainId(): string | undefined {
    return this.chainId;
  }

  public getWalletProviderName(): string | undefined {
    return this.walletProviderName;
  }
}

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

  private readonly errorMessages: Record<WalletErrorType, string> = {
    [WalletErrorType.ConnectionCancelled]:
      "Connection was cancelled by the user.",
    [WalletErrorType.ConnectionFailed]: "Failed to connect to wallet.",
    [WalletErrorType.UnsupportedWallet]: "This wallet is not supported.",
    [WalletErrorType.UnsupportedNetwork]: "This network is not supported.",
    [WalletErrorType.AddressTypeNotSupported]:
      "Only Native SegWit and Taproot addresses are supported. Please switch the address type in your wallet and try again.",
    [WalletErrorType.SigningFailed]: "Failed to sign transaction.",
    [WalletErrorType.WalletNotDetected]:
      "Wallet extension not detected. Please install the wallet extension.",
    [WalletErrorType.WalletDisconnected]:
      "Wallet is disconnected. Please connect your wallet.",
    [WalletErrorType.WalletNotInitialized]: "Wallet is not initialized.",
    [WalletErrorType.WalletNotConnected]:
      "Wallet is not connected. Please connect your wallet.",
  };

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
    const baseMessage =
      this.errorMessages[type] ?? "An unexpected wallet error occurred.";
    return message
      ? `${baseMessage}${message !== baseMessage ? ` Details: ${message}` : ""}`
      : baseMessage;
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

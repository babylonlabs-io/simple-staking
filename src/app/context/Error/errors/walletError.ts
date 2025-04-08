import { ErrorType } from "@/app/types/errors";
import { ChainType } from "@/app/types/network";

export class WalletError extends Error {
  readonly name: string = "WalletError";
  readonly displayMessage: string;
  readonly chainType?: ChainType;
  readonly walletProviderName?: string;
  readonly type: ErrorType;

  /**
   * @param message        Error message
   * @param chainType      Type of chain (BBN or BTC)
   * @param walletProviderName     Name of the wallet provider (Keplr, OKX, etc.)
   */
  constructor({
    message,
    chainType,
    walletProviderName,
  }: {
    message: string;
    chainType?: ChainType;
    walletProviderName?: string;
  }) {
    super(message);
    this.chainType = chainType;
    this.walletProviderName = walletProviderName;
    this.displayMessage = this.getDisplayMessage(message);
    this.type = ErrorType.WALLET;
    Object.setPrototypeOf(this, WalletError.prototype);
  }

  private getDisplayMessage(message: string): string {
    const baseMessage = "An unexpected wallet error occurred.";
    return message
      ? `${baseMessage}${message !== baseMessage ? ` Details: ${message}` : ""}`
      : baseMessage;
  }
}

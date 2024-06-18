export const enum WalletErrorType {
  ConnectionCancelled = "ConnectionCancelled",
}

export class WalletError extends Error {
  private type: WalletErrorType;
  constructor(type: WalletErrorType, message: string) {
    super(message);
    this.name = "WalletError";
    this.type = type;
  }

  public getType(): WalletErrorType {
    return this.type;
  }
}

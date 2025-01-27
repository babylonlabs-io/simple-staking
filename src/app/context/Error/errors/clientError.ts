import {
  ClientErrorCodeType,
  getClientErrorMessage,
} from "../../../constants/errorCodes";
import { ErrorState } from "../../../types/errors";

export class ClientError extends Error {
  readonly name = "ClientError";
  readonly displayMessage: string;

  /**
   * @param message        Technical message for debugging
   * @param errorCode      Client error code
   * @param errorType      Classification of error
   */
  constructor(
    public readonly message: string,
    public readonly errorCode: ClientErrorCodeType = "CLIENT_GENERIC",
    public readonly errorType: ErrorState = ErrorState.WALLET,
  ) {
    super(message);
    this.displayMessage = getClientErrorMessage(errorCode, message);
    Object.setPrototypeOf(this, ClientError.prototype);
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getErrorCode(): ClientErrorCodeType {
    return this.errorCode;
  }
}

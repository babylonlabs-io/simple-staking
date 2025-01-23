import { ErrorCodes, ErrorCodeType } from "../../../constants/errorCodes";
import { getErrorMessage } from "../../../constants/errorMessages";
import { ErrorState } from "../../../types/errors";

export class ClientError extends Error {
  public displayMessage: string;
  public errorType: ErrorState;
  public errorCode: ErrorCodeType;

  /**
   * @param message        Technical message for debugging
   * @param errorCode      Error code
   * @param errorType      Classification of error
   */
  constructor(
    message: string,
    errorCode: ErrorCodeType = ErrorCodes.CLIENT_GENERIC,
    errorType: ErrorState = ErrorState.WALLET,
  ) {
    super(message);
    this.name = "ClientError";
    this.errorCode = errorCode;
    this.errorType = errorType;
    this.displayMessage = getErrorMessage(errorCode, message);

    Object.setPrototypeOf(this, ClientError.prototype);
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getErrorCode(): ErrorCodeType {
    return this.errorCode;
  }
}

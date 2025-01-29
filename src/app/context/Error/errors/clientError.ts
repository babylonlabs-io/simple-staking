import {
  ClientErrorCategory,
  getClientErrorMessage,
} from "../../../constants/errorMessage";
import { ErrorState } from "../../../types/errors";

export class ClientError extends Error {
  readonly name = "ClientError";
  readonly displayMessage: string;
  readonly category?: ClientErrorCategory;
  readonly state?: ErrorState;

  /**
   * @param message        Technical message for debugging
   * @param errorCode      Client error code
   * @param errorType      Classification of error
   */
  constructor({
    message,
    category = ClientErrorCategory.CLIENT_UNKNOWN,
    state = ErrorState.WALLET,
  }: {
    message: string;
    category?: ClientErrorCategory;
    state?: ErrorState;
  }) {
    super(message);
    this.category = category;
    this.state = state;
    this.displayMessage = getClientErrorMessage(category, message);
    Object.setPrototypeOf(this, ClientError.prototype);
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getErrorCode(): ClientErrorCategory | undefined {
    return this.category;
  }
}

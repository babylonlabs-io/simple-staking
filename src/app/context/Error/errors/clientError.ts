import {
  ClientErrorCategory,
  getClientErrorMessage,
} from "../../../constants/errorMessages";
import { ErrorType } from "../../../types/errors";

export class ClientError extends Error {
  readonly name = "ClientError";
  readonly displayMessage: string;
  readonly category?: ClientErrorCategory;
  readonly type?: ErrorType;

  /**
   * @param message        Error message
   * @param category       Error category
   * @param type           Error type
   */
  constructor({
    message,
    category = ClientErrorCategory.CLIENT_UNKNOWN,
    type = ErrorType.UNKNOWN,
  }: {
    message: string;
    category?: ClientErrorCategory;
    type?: ErrorType;
  }) {
    super(message);
    this.category = category;
    this.type = type;
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

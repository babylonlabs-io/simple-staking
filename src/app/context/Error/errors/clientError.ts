import {
  ClientErrorCategory,
  getClientErrorMessage,
} from "../../../constants/errorMessages";
import { ErrorType } from "../../../types/errors";

/**
 * @deprecated This class is deprecated and will be removed in a future version.
 */
export class ClientError extends Error {
  readonly name = "ClientError";
  readonly displayMessage: string;
  readonly category?: ClientErrorCategory;
  readonly type?: ErrorType;
  readonly metadata?: Record<string, any>;

  /**
   * @param message        Error message
   * @param category       Error category
   * @param type           Error type
   * @param metadata       Additional metadata about the error
   * @deprecated This constructor is deprecated along with the class.
   */
  constructor(
    {
      message,
      category = ClientErrorCategory.CLIENT_UNKNOWN,
      type = ErrorType.UNKNOWN,
      metadata,
    }: {
      message: string;
      category?: ClientErrorCategory;
      type?: ErrorType;
      metadata?: Record<string, any>;
    },
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.category = category;
    this.type = type;
    this.metadata = metadata || {};
    this.displayMessage = getClientErrorMessage(category, message);
    Object.setPrototypeOf(this, ClientError.prototype);
  }

  /**
   * @deprecated This method is deprecated along with the class.
   */
  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  /**
   * @deprecated This method is deprecated along with the class.
   */
  public getErrorCode(): ClientErrorCategory | undefined {
    return this.category;
  }
}

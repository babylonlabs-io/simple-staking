import {
  getHttpErrorMessage,
  HttpStatusCode,
} from "../../../constants/httpStatusCodes";
import { ErrorState } from "../../../types/errors";

export class ServerError extends Error {
  readonly endpoint: string;
  readonly errorType: ErrorState;
  readonly status: number;
  readonly displayMessage: string;

  /**
   * @param message       Technical message for debugging
   * @param endpoint      Endpoint, resource name, or server location
   * @param status       HTTP status code
   */
  constructor(
    message: string,
    endpoint: string,
    status: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
  ) {
    super(message);
    this.name = "ServerError";
    this.endpoint = endpoint;
    this.errorType = ErrorState.SERVER_ERROR;
    this.status = status;
    this.displayMessage = getHttpErrorMessage(status, message);

    Object.setPrototypeOf(this, ServerError.prototype);
  }

  public getDisplayMessage(): string {
    return this.displayMessage;
  }

  public getStatusCode(): number {
    return this.status;
  }
}

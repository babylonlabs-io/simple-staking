import {
  getHttpErrorMessage,
  HttpStatusCode,
} from "../../../constants/httpStatusCodes";

export class ServerError extends Error {
  readonly name = "ServerError";
  readonly displayMessage: string;

  /**
   * @param message       Technical message for debugging
   * @param status        HTTP status code
   * @param endpoint      Endpoint, resource name, or server location
   */
  constructor(
    public readonly message: string,
    public readonly status: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
    public readonly endpoint?: string,
  ) {
    super(message);
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

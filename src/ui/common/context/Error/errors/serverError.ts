import { HttpStatusCode } from "@/ui/common/api/httpStatusCodes";
import { ErrorType } from "@/ui/common/types/errors";

/**
 * @deprecated This class is deprecated and will be removed in a future version.
 */
export class ServerError extends Error {
  readonly name = "ServerError";
  readonly displayMessage: string;
  readonly status: HttpStatusCode;
  readonly endpoint?: string;
  readonly type: ErrorType;
  readonly request?: Record<string, any>;
  readonly response?: Record<string, any>;
  metadata?: Record<string, any>;

  /**
   * @param message       Error message
   * @param status        HTTP status code
   * @param endpoint      Endpoint, resource name, or server location
   * @param request       Request data that caused the error
   * @param response      Response data from the server
   */
  constructor({
    message,
    status = HttpStatusCode.InternalServerError,
    endpoint,
    request,
    response,
  }: {
    message: string;
    status?: HttpStatusCode;
    endpoint?: string;
    request?: Record<string, any>;
    response?: Record<string, any>;
  }) {
    super(message);
    this.status = status;
    this.endpoint = endpoint;
    this.displayMessage = message;
    this.type = ErrorType.SERVER;
    this.request = request;
    this.response = response;
    Object.setPrototypeOf(this, ServerError.prototype);
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
  public getStatusCode(): number {
    return this.status;
  }
}

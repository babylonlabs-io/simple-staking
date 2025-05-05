import { ErrorCode } from "./codes";

interface ClientErrorOptions extends ErrorOptions {
  metadata?: Record<string, any>;
}

export class ClientError extends Error {
  constructor(
    public errorCode: ErrorCode,
    message: string,
    options?: ClientErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

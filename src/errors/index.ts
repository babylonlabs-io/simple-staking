interface ClientErrorOptions extends ErrorOptions {
  cause?: Error;
  metadata?: Record<string, any>;
}

export class ClientError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    options?: ClientErrorOptions,
  ) {
    super(message, options);
  }
}

export * from "./codes";

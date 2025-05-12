interface ClientErrorOptions extends ErrorOptions {
  metadata?: Record<string, any>;
}

export class ClientError extends Error {
  public readonly metadata?: Record<string, any>;

  constructor(
    public readonly errorCode: string,
    message: string,
    options?: ClientErrorOptions,
  ) {
    super(message, options);
    if (options?.metadata) this.metadata = options.metadata;
  }
}

export * from "./codes";

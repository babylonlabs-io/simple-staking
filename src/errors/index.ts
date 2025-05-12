export class ClientError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export * from "./codes";

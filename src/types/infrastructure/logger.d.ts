namespace Infra {
  interface Logger {
    info(message: string, context?: Context): void;
    warn(message: string, context?: Context): void;
    error(error: Error, context?: ErrorContext): string;
  }
}

interface Infra {
  logger: Infra.Logger;
}

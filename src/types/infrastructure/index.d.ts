declare global {
  namespace Infra {
    interface Infra {
      eventBus: Infra.EventBus;
      db: Infra.DB;
    }
  }
}

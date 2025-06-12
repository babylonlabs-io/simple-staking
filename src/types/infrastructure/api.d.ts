import type { Api } from "@/shared/utils/swagger/api";

declare global {
  namespace Infra {
    type API = Api;
  }

  interface Infra {
    api: Infra.API;
  }
}

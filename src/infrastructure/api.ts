import { Api } from "@/shared/utils/swagger/api";

export default ({ config }: DI.Container) =>
  new Api({ baseUrl: config.api.baseUrl });

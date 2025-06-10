import { Api } from "@/shared/utils/swagger/api";

export default new Api({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

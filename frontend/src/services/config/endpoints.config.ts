import { environment } from "config/environment.config";

export const endpoint = environment.API_URL ?? "http://localhost:8000/";

export default endpoint;

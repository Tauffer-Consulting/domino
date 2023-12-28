import { environment } from "config/environment.config";

/**
 * Exports all endpoints, already set up by current env
 */

console.log(environment);

export const endpoint = environment.API_URL ?? "http://localhost:8000/";

export default endpoint;

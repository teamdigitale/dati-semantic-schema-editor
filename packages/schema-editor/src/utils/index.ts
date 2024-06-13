import { sanitizeUrl as braintreeSanitizeUrl } from "@braintree/sanitize-url";

export function sanitizeUrl(url) {
  if (typeof url !== "string" || url === "") {
    return "";
  }
  return braintreeSanitizeUrl(url);
}

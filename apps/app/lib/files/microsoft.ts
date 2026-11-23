import "server-only";
import { ConfidentialClientApplication } from "@azure/msal-node";
import type { FilesSettings } from "./settings";

export const graphOrigin = "https://graph.microsoft.com";
export const filesReadScope = `${graphOrigin}/Files.Read`;
// Use the tenant ID so refreshed tokens keep the owner's MSAL cache realm.
const consumerTenant = "9188040d-6c67-4c5b-b112-36a304b66dad";

export function createMicrosoftClient({
  clientId,
  clientSecret,
  tenantId,
}: Pick<FilesSettings, "clientId" | "clientSecret" | "tenantId">) {
  const authority = `https://login.microsoftonline.com/${tenantId ?? consumerTenant}`;
  return new ConfidentialClientApplication({
    auth: { authority, clientId, clientSecret },
  });
}

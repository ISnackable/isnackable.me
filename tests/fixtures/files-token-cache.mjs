const environment = "login.microsoftonline.com";
const consumerTenant = "9188040d-6c67-4c5b-b112-36a304b66dad";
const owner = "fixture-owner";
const target = "https://graph.microsoft.com/files.read";

export const clientId = "760779e6-ee5d-4149-9c24-d896ca371112";
export const accountId = `${owner}.${consumerTenant}`;
export const accessToken = "fixture-personal-access-token";
export const refreshToken = "fixture-personal-refresh-token";

export function filesTokenCache(
  token = accessToken,
  lifetime = 3600,
  realm = consumerTenant
) {
  const now = Math.floor(Date.now() / 1000);
  const homeAccountId = `${owner}.${realm}`;
  const account = { environment, home_account_id: homeAccountId, realm };
  const credential = {
    client_id: clientId,
    environment,
    home_account_id: homeAccountId,
  };
  return JSON.stringify({
    AccessToken: {
      [[
        homeAccountId,
        environment,
        "accesstoken",
        clientId,
        realm,
        target,
        "",
      ].join("-")]: {
        ...credential,
        cached_at: String(now),
        credential_type: "AccessToken",
        expires_on: String(now + lifetime),
        realm,
        secret: token,
        target,
        token_type: "Bearer",
      },
    },
    Account: {
      [[homeAccountId, environment, realm].join("-")]: {
        ...account,
        authority_type: "MSSTS",
        local_account_id: owner,
        username: "owner@example.test",
      },
    },
    AppMetadata: {},
    IdToken: {},
    RefreshToken: {
      [[homeAccountId, environment, "refreshtoken", clientId, "", "", ""].join(
        "-"
      )]: {
        ...credential,
        credential_type: "RefreshToken",
        secret: refreshToken,
      },
    },
  });
}

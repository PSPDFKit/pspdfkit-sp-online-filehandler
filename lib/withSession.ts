import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

type SSRHandler = Parameters<typeof withIronSessionSsr>[0];

export function withSessionSsr(handler: SSRHandler) {
  const isProd = process.env.NODE_ENV === "production";
  const password = isProd
    ? process.env.IRON_SESSION_PASSWORD
    : "a1a2fec0-252b-499c-af1c-ce4bef7f2351";

  return withIronSessionSsr(handler, {
    cookieName: "msal-service-auth",
    cookieOptions: {
      sameSite: "strict",
      secure: isProd,
    },
    password,
  });
}

type APIHandler = Parameters<typeof withIronSessionApiRoute>[0];

export function withSessionApiRoute(handler: APIHandler) {
  const isProd = process.env.NODE_ENV === "production";
  const password = isProd
    ? process.env.IRON_SESSION_PASSWORD
    : "a1a2fec0-252b-499c-af1c-ce4bef7f2351";

  return withIronSessionApiRoute(handler, {
    cookieName: "msal-service-auth",
    cookieOptions: {
      sameSite: "strict",
      secure: isProd,
    },
    password,
  });
}

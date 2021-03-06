import { NextApiResponse } from "next";
import { authClientFactory, ILoginState } from "../../../lib/initHandler";
import { NextApiRequestWithSession } from "../../../lib/types";
import { fromBase64 } from "../../../lib/utils";
import { withSessionApiRoute } from "../../../lib/withSession";

/**
 * API handler for login actions
 * Uses nextjs dynamic routing to handler "login" and "logout" in the same file
 *
 */
async function handler(req: NextApiRequestWithSession, res: NextApiResponse) {
  const { action } = req.query;

  switch (action) {
    case "login":
      await handleLogin(req, res);
      break;
    case "logout":
      await handleLogout(req, res);
      break;
    default:
      res.status(404).end();
  }
}

export default withSessionApiRoute(handler);

/**
 * Handles the login operation and redirects to the original page
 *
 */
async function handleLogin(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  const state: ILoginState = JSON.parse(
    fromBase64(req.query["state"] as string)
  );

  const authApp = await authClientFactory();
  // using the code returned from the server we acquire an access token
  const tokenResponse = await authApp.acquireTokenByCode({
    code: req.query.code as string,
    redirectUri: `${process.env.NEXT_PUBLIC_FILEHANDLER_SITE_HOST_URL}/api/auth/login`,
    scopes: ["openid", "Files.ReadWrite.All"],
  });

  // with the token we redirect to the original calling page
  // the logic in lib/iniHandler will pick up the token from the query and store it in the session
  res.redirect(
    `${state.target}?state=${req.query.state}&token=${tokenResponse.accessToken}&expiresOn=${tokenResponse.expiresOn}`
  );
}

/**
 * Handles any logout activity required, we destroy the session data and redirect to home
 *
 * @param req api request augmented with session information
 * @param res The response
 */
async function handleLogout(
  req: NextApiRequestWithSession,
  res: NextApiResponse
): Promise<void> {
  req.session.destroy();
  res.redirect("/");
}

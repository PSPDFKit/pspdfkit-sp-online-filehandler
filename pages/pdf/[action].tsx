/**
 * Page used to preview and edit PDF files within our File Handler
 */

import { GetServerSideProps } from "next";
import { initHandler } from "../../lib/initHandler";

import "react-toastify/dist/ReactToastify.css";
import { withSessionSsr } from "../../lib/withSession";
import PSPDFKitViewer from "../../components/PSPDFKitViewer";

const getServerSidePropsHandler: GetServerSideProps = async ({ req, res }) => {
  const [token, activationParams, redirectUrl] = await initHandler(
    req as any,
    res
  );

  if (redirectUrl) {
    return {
      redirect: {
        destination: redirectUrl,
        statusCode: 302,
      },
    };
  }
  if (token === null) {
    // return nothing if we don't have a token, we are likely doing a redirect
    return { props: {} };
  }

  // read the file from the url supplied via the activation params
  // we do this on the server due to cors and redirect issues when trying to do it on the client

  const response = await fetch(activationParams.items[0], {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  const { "@microsoft.graph.downloadUrl": downloadUrl, webUrl } = json;
  return {
    props: {
      token,
      webUrl,
      downloadUrl,
      graphUrl: activationParams.items[0],
    },
  };
};

export const getServerSideProps = withSessionSsr(getServerSidePropsHandler);

const Handler = (props: {
  token: string;
  webUrl: string;
  downloadUrl: string;
  graphUrl: string;
}) => <PSPDFKitViewer {...props} />;

export default Handler;

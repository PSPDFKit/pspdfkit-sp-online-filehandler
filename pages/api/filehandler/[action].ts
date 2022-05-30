import { NextApiResponse } from "next";
import { NextApiRequestWithSession } from "../../../lib/types";
import { withSessionApiRoute } from "../../../lib/withSession";

// // next API config (see: https://nextjs.org/docs/api-routes/api-middlewares#custom-config)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Our API handler method to process incoming API requests
 * This matches in nextjs any call to /api/filehandler/[action]
 *
 */
const handler = async (
  req: NextApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  const { action } = req.query;

  console.log(`In api/filehandler. Action: ${action}`);

  switch (action) {
    case "fetch":
      const { fetchUrl } = req.query as {
        fetchUrl: string;
      };

      const response = await fetch(fetchUrl);

      const body = response.body;

      return new Promise((resolve, reject) => {
        // @ts-expect-error
        body.on("readable", () => {
          let chunk;

          // @ts-expect-error
          while (null != (chunk = body.read())) {
            res.write(chunk);
          }
        });

        // @ts-expect-error
        body.on("close", () => {
          res.end();
          resolve();
        });
      });

    default:
      res.status(404).end();
  }
};

export default withSessionApiRoute(handler);

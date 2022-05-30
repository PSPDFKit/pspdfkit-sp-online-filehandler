import { NextApiRequestWithSession } from "../../../lib/types";
import { NextApiResponse } from "next";
import { withSessionApiRoute } from "../../../lib/withSession";

const handler = async (
  req: NextApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  const { currentFileUrl, newPath, token } = JSON.parse(req.body) as {
    currentFileUrl: string;
    newPath: string;
    token: string;
  };

  const fileInfoResponse = await fetch(currentFileUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!fileInfoResponse.ok) {
    res
      .status(500)
      .end(`Error in getFileInfo action: ${fileInfoResponse.statusText}`);
    return;
  }

  const fileInfo = await fileInfoResponse.clone().json();
  const newFileUrl = `https://graph.microsoft.com/v1.0/${fileInfo.parentReference.path}/${newPath}`;
  const newFileInfoResponse = await fetch(newFileUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const newFileInfoJson = await newFileInfoResponse.json();

  const { webUrl, "@microsoft.graph.downloadUrl": downloadUrl } =
    newFileInfoJson;

  res.status(200).json({
    webUrl,
    downloadUrl,
    graphUrl: newFileUrl,
  });
};

export default withSessionApiRoute(handler);

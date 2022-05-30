export async function uploadContentToSharePoint(
  content: ArrayBuffer,
  token: string,
  graphUrl: string
) {
  const itemInfoResponse = await fetch(graphUrl, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!itemInfoResponse.ok) {
    throw new Error("Error getting item details before save.");
  }

  const itemInfo = await itemInfoResponse.json();

  // construct a graph url to PUT our changes
  const itemUrl = `https://graph.microsoft.com/v1.0/drives/${itemInfo.parentReference.driveId}/items/${itemInfo.id}`;

  const totalSize = content.byteLength;
  // The Graph API considers files larger than 5 MiB as "large".
  // We need to use the upload session API for these cases:
  // https://docs.microsoft.com/en-us/graph/api/driveitem-createuploadsession.
  const isLargeFile = totalSize >= 5 * 1024 * 1024;

  if (isLargeFile) {
    await uploadLargeFileToSharePoint(content, token, itemUrl);
  } else {
    await uploadSmallFileToSharePoint(content, token, itemUrl);
  }
}

async function uploadLargeFileToSharePoint(
  content: ArrayBuffer,
  token: string,
  itemUrl: string
) {
  const uploadSessionUrl = `${itemUrl}/createUploadSession`;

  const uploadSessionResponse = await fetch(uploadSessionUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: {
        "@microsoft.graph.conflictBehavior": "replace",
      },
    }),
  });

  if (!uploadSessionResponse.ok) {
    throw new Error(uploadSessionResponse.statusText);
  }

  const { uploadUrl } = await uploadSessionResponse.json();

  // Splitting file into chunks of 10 MiB
  const CHUNK_SIZE = 10 * 1024 * 1024;
  const totalSize = content.byteLength;
  let currentOffset = 0;

  while (currentOffset < totalSize) {
    const chunkSize = Math.min(CHUNK_SIZE, totalSize - currentOffset);
    const chunk = content.slice(currentOffset, currentOffset + chunkSize);

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Length": chunk.byteLength.toString(),
        "Content-Range": `bytes ${currentOffset}-${
          currentOffset + chunkSize - 1
        }/${totalSize}`,
      },
      body: chunk,
    });

    if (!uploadResponse.ok) {
      throw new Error(uploadResponse.statusText);
    }

    currentOffset += chunkSize;
  }
}

async function uploadSmallFileToSharePoint(
  content: ArrayBuffer,
  token: string,
  itemUrl: string
) {
  const contentUrl = `${itemUrl}/content`;

  // update the file via Graph API
  const updateResult = await fetch(contentUrl, {
    body: content,
    headers: {
      authorization: `Bearer ${token}`,
    },
    method: "PUT",
  });

  if (!updateResult.ok) {
    const err = await updateResult.text();
    throw new Error(err);
  }
}

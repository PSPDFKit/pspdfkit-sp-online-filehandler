import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import type { ToolbarItem } from "pspdfkit";
import type IPSPDFKit from "pspdfkit";
import { uploadContentToSharePoint } from "../lib/graphAPI";

export default function PSPDFKitViewer(props: IPSPDFKitViewerProps) {
  const [currentDownloadUrl, setCurrentDownloadUrl] = useState("");
  const [currentGraphUrl, setCurrentGraphUrl] = useState("");
  const [currentWebUrl, setCurrentWebUrl] = useState("");
  const PSPDFKit = useRef<typeof IPSPDFKit>();

  const previousDownloadUrl = usePrevious(currentDownloadUrl);

  useEffect(() => {
    setCurrentDownloadUrl(props.downloadUrl);
    setCurrentGraphUrl(props.graphUrl);
    setCurrentWebUrl(props.webUrl);
  }, []);

  useEffect(() => {
    if (!currentDownloadUrl || !currentGraphUrl) {
      return;
    }

    if (currentDownloadUrl === previousDownloadUrl) {
      return;
    }

    let instance;

    const saveItem: ToolbarItem = {
      type: "custom",
      title: "Save",
      onPress() {
        async function exportAndSave() {
          const content: ArrayBuffer = await instance.exportPDF();
          return uploadContentToSharePoint(
            content,
            props.token,
            currentGraphUrl
          );
        }

        toast.promise(exportAndSave, {
          pending: "Saving changes...",
          success: "Changes saved.",
          error: "Failed to save changes.",
        });
      },
    };

    (async () => {
      if (PSPDFKit.current) {
        PSPDFKit.current.unload("#pspdfkit");
      }
      PSPDFKit.current = (await import("pspdfkit")).default;

      instance = await PSPDFKit.current.load({
        container: "#pspdfkit",
        document: currentDownloadUrl,
        baseUrl: `${process.env.NEXT_PUBLIC_FILEHANDLER_SITE_HOST_URL}/`,
        toolbarItems: [
          ...PSPDFKit.current.defaultToolbarItems,
          saveItem,
        ],
        onOpenURI(uri) {
          (async () => {
            const response = await fetch("/api/filehandler/getFileInfo", {
              method: "POST",
              body: JSON.stringify({
                currentFileUrl: currentGraphUrl,
                newPath: uri,
                token: props.token,
              }),
            });

            const {
              webUrl: newWebUrl,
              downloadUrl: newDownloadUrl,
              graphUrl: newGraphUrl,
            } = await response.json();

            setCurrentDownloadUrl(newDownloadUrl);
            setCurrentGraphUrl(newGraphUrl);
            setCurrentWebUrl(newWebUrl);
          })();
          return false;
        },
      });
    })();
  }, [
    currentWebUrl,
    currentGraphUrl,
    currentDownloadUrl,
  ]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      <div id="pspdfkit" style={{ width: "100%", height: "100%" }}></div>
      <ToastContainer position="bottom-right" newestOnTop theme="dark" />
    </div>
  );
}

function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export interface IPSPDFKitViewerProps {
  token: string;
  webUrl: string;
  downloadUrl: string;
  graphUrl: string;
}

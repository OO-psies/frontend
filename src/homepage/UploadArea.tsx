import UploadLogo from "../icons/upload.png";
import Webcamera from "./Webcamera";
import { Button } from "@/components/ui/button";

export function UploadArea({ uploadedImage, onImageUpload, }: { uploadedImage: string | null, onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }) {

  async function convertBase64ToFile(base64: string, filename: string): Promise<File> {
    return fetch(base64)
      .then(res => res.blob())
      .then(blob => new File([blob], filename, { type: "image/jpeg" }));
  }

  async function handleCapture(imageURL: string) {
    const file = await convertBase64ToFile(imageURL, "webcam-image.jpg");

    // Create a fake event to trigger `onImageUpload`
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = document.createElement("input");
    input.type = "file";
    input.files = dataTransfer.files;

    const event = new Event("change", { bubbles: true });
    Object.defineProperty(event, 'target', {
      value: input,
      writable: true,
      configurable: true
    });

    input.dispatchEvent(event);

    onImageUpload(event as unknown as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <div className="w-full h-[390px] gap-4 border-2 border-dashed border-gray-300 bg-gray-50 p-6 rounded-lg flex items-center justify-center">
      {uploadedImage ? (

        // ------------------------- if there is an uploaded uploadedImage -------------------------
        <div className="w-full h-full flex flex-col items-center justify-center">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="items-center rounded-lg shadow-md max-w-full max-h-[300px]"
          />

          <label className="items-center bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded mt-4">
            Change Image
            <input
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={onImageUpload}
            />
          </label>
        </div>
      ) : (

        // ------------------------- if there is no uploaded image -------------------------
        <div>
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-gray-500 hover:text-gray-700 flex flex-col items-center"
          >
            <img src={UploadLogo} alt="Upload Logo" className="w-16 h-16 mb-4" />
            <p className="text-sm text-gray-500 font-medium">Click <strong><u>here</u></strong> to upload</p>
            {/* <Button>Click To Upload</Button> */}
            <p className="text-xs text-gray-400">PNG or JPG</p>

            <input
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={onImageUpload}
            />
          </label>
          <Webcamera onCapture={handleCapture} />
        </div>
      )}
    </div>
  );
}
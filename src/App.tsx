import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";
import BgRemoverPopUp from "./homepage/BgRemoverPopUp";


function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Stores cropped image
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null); // Stores bg removed image

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl); 
      setCroppedImage(null); // Reset cropped image when new image is uploaded
      setBgRemovedImage(null); // Reset bg removed image when new image is uploaded
    } else {
      setUploadedImage(null);
    }
  };

  const handleDownload = async () => {
    let fileName = prompt("Enter a name for the file")?.trim() || "edited_image";

    // ensure filename remains exactly as inputted
    fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, ""); 

    // prioritize downloading only edited images
    const imageToDownload = croppedImage || bgRemovedImage;
    if (!imageToDownload) {
        alert("No edited image available to download.");
        return;
    }

    // fetch the image to convert it into a blob
    const response = await fetch(imageToDownload);
    const blob = await response.blob();

    try {
        // use file system access API to let user choose where to save the file
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${fileName}.png`,
            types: [
                {
                    description: "PNG Image",
                    accept: { "image/png": [".png"] }
                }
            ]
        });

        // create a writable stream and write the blob to the file
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();

        alert("File saved successfully!");
    } catch (error) {
        console.error("File save canceled or failed:", error);
    }
};

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="font-bold text-2xl">OOpSies ID Photo Processor</h1>
        <p className="text-gray-700 py-4 pb-8">
          Upload your image and choose an option to get started
        </p>

        {/* Wrapper for Upload Area & Cropped Image */}
        <div className="flex flex-row space-x-8">
          {/* Upload Area (Initially Placeholder, Then Image) */}
          <div className="flex flex-col items-center">
            <div className="border border-gray-300 shadow-md rounded-md p-2 w-[350px] h-full flex items-center justify-center">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="Uploaded Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <UploadArea
                  uploadedImage={uploadedImage}
                  onImageUpload={handleImageUpload}
                />
               
              )}
            </div>
            
            {croppedImage && (
              <p className="text-gray-600 mt-2">Original Image</p>

            )}
          </div>

          {/* Cropped Image Preview (Only Show if Cropped Image Exists) */}
          {croppedImage && (
            <div className="flex flex-col items-center">
              <div className="border border-gray-300 rounded-md p-2 shadow-md w-[350px] h-[420px] flex items-center justify-center">
                <img
                  src={croppedImage}
                  alt="Cropped Preview"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-gray-600 mt-2">Edited Image</p>
            </div>
          )}
        </div>

        {/* Button Options */}
        <div className="flex pt-8 space-x-4">
        {/* Cropper */}
          <CropPopUp
            uploadedImage={uploadedImage}
            setCroppedImage={setCroppedImage} />
        {/* Enhance */}
          <Button disabled={!uploadedImage}>
            <Wand2 />
            Enhance
          </Button>
        {/* BG Remover */}
          <BgRemoverPopUp 
            uploadedImage={uploadedImage}
            setBgRemovedImage={setBgRemovedImage}/>
          {/* <Button disabled={!uploadedImage}>
            <ImageOff />
            Remove Background
          </Button> */}
        {/* Download */}
          <Button
            disabled={!uploadedImage}
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={handleDownload}
          >
            <Download />
            Download
          </Button>
        </div>
      </div>
    </>
  );
}

export default App;
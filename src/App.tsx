import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";
import BgRemoverPopUp from "./homepage/BgRemoverComponents/BgRemoverPopUp";

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); //uploadedImage is showing error saying null is not assignable to string - should i replace with '' and remove <null> from declared type? what if the image somehow uploads a null?
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Stores cropped image
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null); // Stores bg removed image

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl); // Store the image URL
      setCroppedImage(null); // Reset cropped image when new image is uploaded
      setBgRemovedImage(null); // Reset bg removed image when new image is uploaded
    } else {
      setUploadedImage(null);
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
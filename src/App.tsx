import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";
import BgRemoverPopUp from "./homepage/BgRemoverPopUp";
import BgColourPopUp from "./homepage/BgColourPopUp";


function App() {
  const [baseImage, setBaseImage] = useState<string | null>(null); // Stores the original image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Stores cropped image
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null); // Stores bg removed image  

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBaseImage(imageUrl); // Store original image separately
      setUploadedImage(imageUrl); 
      setCroppedImage(null); // Reset cropped image when new image is uploaded
      setBgRemovedImage(imageUrl); // Reset bg removed image when new image is uploaded
    } else {
      setUploadedImage(null);
    }
  };

  const handleDownload = async () => {
    let fileName = prompt("Enter a name for the file")?.trim() || "edited_image";

    // ensure filename remains exactly as inputted
    fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, ""); 

    // prioritize downloading only edited images
    const imageToDownload = croppedImage || bgRemovedImage || uploadedImage || baseImage;
      if (!imageToDownload) {
          alert("No image available to download.");
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
            <div className="border border-gray-300 shadow-md rounded-md p-2 w-[350px] h-full flex items-center justify-center image-container">
            {baseImage ? (
              <img 
                src={croppedImage || uploadedImage || baseImage} 
                alt="Processed Image" 
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

        </div>

        {/* Button Options */}
        <div className="flex pt-8 space-x-4">

        {/* Cropper */}
        <CropPopUp baseImage={baseImage} setCroppedImage={(cropped) => {
            setUploadedImage(cropped); // Update the displayed image
            setCroppedImage(cropped);  // Store the cropped version separately
          }}
        />

       

          {/* 
          <Button 
            disabled={!uploadedImage}
            onClick={() => {
              const color = prompt("Enter background color (e.g., #FF5733 or blue):", "#ffffff");
              if (color) {
                const imageContainer = document.querySelector('.image-container');
                if (imageContainer) {
                  imageContainer.style.backgroundColor = color;
                }
              }
            }}
          >
            <ImageOff />
            Change BG Color
          </Button>
           */}
        {/* BG Remover */}
          <BgRemoverPopUp 
            uploadedImage={uploadedImage}
            setBgRemovedImage={setBgRemovedImage}/>

        {/* Enhance */}
          <BgColourPopUp 
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
          />  
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
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";
import Enhance from "./homepage/Enhance";
import BgRemoverPopUp from "./homepage/BgRemoverPopUp";


function App() {
  const [baseImage, setBaseImage] = useState<string | null>(null); // (1) Working image (display, saves all function edits)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // (2) Original image (backup)
  const [baseImageWithBg, setBaseImageWithBg] = useState<string | null>(null); // (3) Working copy image for bgremover (saves all image edits except bgremove)
  const [savedMask, setSavedMask] = useState<string | null>(null); // (4) Working copy mask for bgremover (saves all mask edits from bgremove)

  // (!) Do we need this
  const [croppedImage, setCroppedImage] = useState<string | null>(null); // Stores cropped image
  const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null); // Stores bg removed image 
  const [imageFile, setImageFile] = useState<File | null>(null); // Store actual file

  // (!) Testing Mask Canvas
  // const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // !!!for testing mask
  // const handleButtonClick = () => {
  //   fileInputRef.current?.click(); // Triggers the file input when button is clicked
  // };
  // const handleMaskUpload = async (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const file = event.target.files?.[0];

  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     console.log("imageURL", imageUrl)
  //     setMaskImage(imageUrl);
  //   }
  // };

  // (0) Upload Image -> baseImage (working copy) + uploadedImage (untouched copy)
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBaseImage(imageUrl); 
      setUploadedImage(imageUrl); 
      setBaseImageWithBg(imageUrl);

      setImageFile(file); // upload file for use
      setCroppedImage(null); // Reset cropped image when new image is uploaded
      setBgRemovedImage(null); // Reset bg removed image when new image is uploaded
    } else {
      setUploadedImage(null);
    }
  };

  // (1) Download working image -> baseImage
  const handleDownload = async () => {
    let fileName = prompt("Enter a name for the file")?.trim() || "edited_image";

    // ensure filename remains exactly as inputted
    fileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "");

    // (??a) prioritize downloading only edited images
    // const imageToDownload = croppedImage || bgRemovedImage || uploadedImage || baseImage;

    // (??b) only download working copy
    const imageToDownload = baseImage;

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
            <div className="border border-gray-300 shadow-md rounded-md p-2 w-[350px] h-full flex items-center justify-center">
              {baseImage ? (
                <img
                  // src={croppedImage || uploadedImage || baseImage} !!!!!
                  src={baseImage}
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
          <CropPopUp baseImage={baseImage}
          setCroppedImage={(cropped) => {
            setBaseImage(cropped); // Update the displayed image
            setCroppedImage(cropped);  // Store the cropped version separately
            setBaseImageWithBg(cropped) // !Save the cropped version separately for bgremover
          }}
          />

          <Enhance baseImage={baseImage}
          setEnhanceImage={(enhanced) => {
            setBaseImage(enhanced); // Update the displayed image
            setCroppedImage(enhanced);  // Store the cropped version separately
            setBaseImageWithBg(enhanced) // !Save the cropped version separately for bgremover
          }}
          />

          {/* BG Remover
            1. baseImage (IN: working image copy for display)
            2. savedMask (IN: working mask copy for display & BE processing)
            3. setBaseImage (OUT: edited image -> to working image copy for display)
            4. setSavedMask (OUT: latest mask output -> to working mask copy for use next time)
           */}
          <BgRemoverPopUp
            baseImageWithBg={baseImageWithBg} // For bgremover to display as src
            savedMask={savedMask} // For bgremover to display as overlay (if true)
            setBaseImage={setBaseImage} // To update working copy for display
            setSavedMask={setSavedMask} // To save for future bg removal use (within session)
            />

          {/* Download */}
          <Button
            disabled={!baseImage}
            className="bg-emerald-600 hover:bg-emerald-500"
            onClick={handleDownload}
          >
            <Download />
            Download
          </Button>

          {/* TEST FOR BG REMOVER */}
          {/* <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleMaskUpload}
              style={{ display: "none" }} // Hide the file input
            />

            <Button disabled={!uploadedImage} onClick={handleButtonClick}>
              Upload Mask
            </Button>
          </>

          <Button disabled={!uploadedImage} onClick={() => console.log(maskImage)}>
            Check Mask
          </Button> */}
        </div>
      </div>
    </>
  );
}

export default App;
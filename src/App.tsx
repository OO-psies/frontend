import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("Uploaded Image URL:", uploadedImage);

    if (file) {
      const imageUrl = URL.createObjectURL(file); // convert file to blob url
      setUploadedImage(imageUrl); // Store the image URL in state
    } else {
      setUploadedImage(null); // Reset state if no file is selected
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen flex-col">
        <h1 className="font-bold">OOpSies ID Photo Processor</h1>
        <p className="text-gray-700 py-4 pb-8">Upload your image and choose an option to get started</p>

        {/* Upload Area */}
        <UploadArea
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
        />

        {/* Button options */}
        <div className="flex pt-8 space-x-4">
          <CropPopUp uploadedImage = {uploadedImage} />
          <Button disabled={!uploadedImage}><Wand2 />Enhance</Button>
          <Button disabled={!uploadedImage}><ImageOff />Remove Background</Button>
          <Button disabled={!uploadedImage} className="bg-emerald-600 hover:bg-emerald-500"><Download />Download</Button>
        </div>
      </div>
    </>
  );
}

export default App;
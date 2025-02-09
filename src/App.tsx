import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Convert file to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read file as Base64
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // [JAMESZ] for sending image to backend via FormData
      const base64Image = await convertToBase64(file);

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl); // Store the image URL

      // [JAMESZ] testing sending to backend
      try {
        const response = await fetch("https://photoid.onrender.com/api/grabcut", {
          method: "POST",
          // body: formData, // No need to set headers, browser automatically handles it
          body: JSON.stringify({ image: base64Image })
        });
        const data = await response.json();
        console.log("Server Response:", data);
      } catch (error) {
        console.error("Upload failed:", error);
      }

    } else {
      setUploadedImage(null); // Reset the uploaded image if no file is selected
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
          <CropPopUp />
          <Button><Wand2 />Enhance</Button>
          <Button><ImageOff />Remove Background</Button>
        </div>
      </div>
    </>
  );
}

export default App;
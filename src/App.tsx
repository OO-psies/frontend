import { useState } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";

function App() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Convert file to Base64 (Removes the initial prefixes of Base64)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read file as Base64
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the 'data:image/<file-type>;base64,' prefix if present
        const base64Data = base64String.split(",")[1];
        resolve(base64Data); // This gives you just the base64 part
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log("Uploaded Image URL:", uploadedImage);

    if (file) {
      // [JAMESZ] for sending image to backend via FormData
      const base64Image = await convertToBase64(file);

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl); // Store the image URL

      // [JAMESZ] testing sending to backend
      try {
        const response = await fetch(
          "https://photoid.onrender.com/api/grabcut",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({
              base64Image: base64Image,
              // HARD CODED COORDINATES
              rectX: 0,
              rectY: 0,
              rectWidth: 700,
              rectHeight: 1000,
            }),
          }
        );
        const data = await response.json();
        console.log("Server Response:", data);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    } else {
      setUploadedImage(null); // Reset state if no file is selected
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen flex-col">
        <h1 className="font-bold">OOpSies ID Photo Processor</h1>
        <p className="text-gray-700 py-4 pb-8">
          Upload your image and choose an option to get started
        </p>

        {/* Upload Area */}
        <UploadArea
          uploadedImage={uploadedImage}
          onImageUpload={handleImageUpload}
        />

        {/* Button options */}
        <div className="flex pt-8 space-x-4">
          <CropPopUp uploadedImage={uploadedImage} />
          <Button disabled={!uploadedImage}>
            <Wand2 />
            Enhance
          </Button>
          <Button disabled={!uploadedImage}>
            <ImageOff />
            Remove Background
          </Button>
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

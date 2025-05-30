
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import "./App.css";
import { UploadArea } from "./homepage/UploadArea";
import { Wand2, ImageOff, Download } from "lucide-react";
import CropPopUp from "./homepage/cropPopUp";
import Enhance from "./homepage/Enhance";
import BgRemoverPopUp from "./homepage/BgRemoverPopUp";
import BgColourPopUp from "./homepage/BgColourPopUp";

function App() {
    const [baseImage, setBaseImage] = useState<string | null>(null); // (1) Working image (display, saves all function edits)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null); // (2) Original image (backup)
    const [baseImageWithBg, setBaseImageWithBg] = useState<string | null>(null); // (3) Working copy image for bgremover (saves all image edits except bgremove)
    const [savedMask, setSavedMask] = useState<string | null>(null); // (4) Working copy mask for bgremover (saves all mask edits from bgremove)
    const [bgEdited, setBgEdited] = useState<Boolean>(false)

    // (!) Do we need this
    const [croppedImage, setCroppedImage] = useState<string | null>(null); // Stores cropped image
    const [bgRemovedImage, setBgRemovedImage] = useState<string | null>(null); // Stores bg removed image
    const [imageFile, setImageFile] = useState<File | null>(null); // Store actual file

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

            // Check passport compliance in the background
            checkFaceValidity(file);
        } else {
            setUploadedImage(null);
        }
    };

    // Simplified function to check face validity and display warning
    const checkFaceValidity = async (file: File) => {
        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = async () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(",")[1];

                // Send to face detector API
                const response = await fetch(
                    "http://localhost:8080/api/edit-image/face-detector",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            base64Image: base64Data,
                        }),
                    }
                );

                const responseData = await response.json();
                const isValid = responseData.faceDetected;
                console.log("Face validity check:", isValid);
                console.log("Face validity check:", responseData);

                // Show appropriate warning based on result
                if (isValid === false) {
                    // Display warning
                    const warningElement = document.getElementById(
                        "face-validity-warning"
                    );
                    if (warningElement) {
                        warningElement.style.display = "flex";

                        // Hide warning after 5 seconds
                        setTimeout(() => {
                            warningElement.style.display = "none";
                        }, 5000); // 5000ms = 5 seconds
                    }
                } else {
                    // Hide warning if it exists
                    const warningElement = document.getElementById(
                        "face-validity-warning"
                    );
                    if (warningElement) {
                        warningElement.style.display = "none";
                    }
                }
            };
        } catch (error) {
            console.error("Error checking face validity:", error);
        }
    };

    // (1) Download working image -> baseImage
    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      };
      
      const handleDownload = async () => {
        // Use the working copy: assume baseImage is available and holds the current image URL.
        const imageToDownload = baseImage; // Replace with the appropriate variable if different
        if (!imageToDownload) {
          alert("No image available to download.");
          return;
        }
      
        try {
          // Fetch the image and convert it into a blob.
          const response = await fetch(imageToDownload);
          const imageBlob = await response.blob();
          
          // Set file name directly
          const fileName = "image.png";
          
          // Create an object URL from the blob and wait for image to load.
          const objectUrl = URL.createObjectURL(imageBlob);
          const img = await loadImage(objectUrl);
          URL.revokeObjectURL(objectUrl); // Clean up the object URL once loaded
      
          // Create a canvas the same size as the image.
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
      
          // Draw a white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      
          // Draw the image on top of the white background.
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
          // Convert the canvas to a blob.
          const newBlob: Blob = await new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), "image/png");
          });
      
          // Use the File System Access API to save the file.
          const fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "PNG Image",
                accept: { "image/png": [".png"] },
              },
            ],
          });
          const writableStream = await fileHandle.createWritable();
          await writableStream.write(newBlob);
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

                {/* Warning Message - Hidden by default */}
                <div
                    id="face-validity-warning"
                    style={{ display: "none" }}
                    className="w-full max-w-[800px] mt-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-center gap-2"
                >
                    <div className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                        !
                    </div>
                    <p>
                        Warning: This image does not appear to be passport compliant. Please
                        ensure that the photo is close to the camera and clear.
                    </p>
                </div>

                {/* Button Options */}
                <div className="flex pt-8 space-x-4">

                    {/* Cropper */}
                    {savedMask ? (
                        <></>
                    ) : (
                        <CropPopUp baseImage={baseImage}
                            savedMask={savedMask}
                            setCroppedImage={(cropped) => {
                                setBaseImage(cropped); // Update the displayed image
                                setCroppedImage(cropped);  // Store the cropped version separately
                                setBaseImageWithBg(cropped) // !Save the cropped version separately for bgremover
                            }}
                            setSavedMask={(croppedMask) => {
                                setSavedMask(croppedMask)
                            }}
                        />
                    )}

                    {/* BG Remover
                        1. baseImage (IN: working image copy for display)
                        2. savedMask (IN: working mask copy for display & BE processing)
                        3. setBaseImage (OUT: edited image -> to working image copy for display)
                        4. setSavedMask (OUT: latest mask output -> to working mask copy for use next time)
                    */}
                    {croppedImage && !bgEdited ? (
                        <BgRemoverPopUp
                            baseImageWithBg={baseImageWithBg} // For bgremover to display as src
                            savedMask={savedMask}             // For bgremover to display as overlay (if true)
                            setBaseImage={setBaseImage}       // To update working copy for display
                            setSavedMask={setSavedMask}       // To save for future bg removal use (within session)
                        />
                    ) : (
                        <></>
                    )}

                    {/* BG Colour Change */}
                    {savedMask ? (
                        <BgColourPopUp
                            bgRemovedImage={baseImage}
                            setBgcolorImage={(img) => {
                                setBaseImage(img); // Update the displayed image
                                setBgEdited(true); // Disable Remove BG button
                           }}
                        />
                    ) : (
                        <></>
                    )}

                    {/* Enhance */}
                    {savedMask ? (
                        <Enhance
                            baseImage={baseImage}
                            setEnhancedImage={(enhanced) => {
                                setBaseImage(enhanced);  // Update the displayed image
                                setCroppedImage(enhanced);  // Also update the cropped version state
                                setBaseImageWithBg(enhanced); // For further background removal if needed
                                setBgEdited(true)
                            }}
                        />
                    ) : (
                        <></>
                    )}


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

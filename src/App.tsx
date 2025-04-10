
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

    // (*) - for checking image's validity for passport
    //   const convertToBase64 = async (image: File | string): Promise<string> => {

    //     // (2.1) if image null
    //     if (!image) {
    //         console.log("image does not exist");
    //     }

    //     // (2.2) if typeof(image) == string
    //     if (typeof(image) === 'string') {
    //         let file: File;
    //         const response = await fetch(image);
    //         const blob = await response.blob();
    //         file = new File([blob], "image.png", { type: blob.type });

    //         return new Promise((resolve, reject) => {
    //             const reader = new FileReader();
    //             reader.readAsDataURL(file); // Read file as Base64
    //             reader.onload = () => {
    //                 const base64String = reader.result as string;
    //                 // Remove the 'data:image/<file-type>;base64,' prefix if present
    //                 const base64Data = base64String.split(",")[1];
    //                 resolve(base64Data); // This gives you just the base64 part
    //             };
    //             reader.onerror = (error) => reject(error);
    //         });
    //     }

    //     // (2.3) if typeof(image) == file
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(image); // Read file as Base64
    //         reader.onload = () => {
    //             const base64String = reader.result as string;
    //             // Remove the 'data:image/<file-type>;base64,' prefix if present
    //             const base64Data = base64String.split(",")[1];
    //             resolve(base64Data); // This gives you just the base64 part
    //         };
    //         reader.onerror = (error) => reject(error);
    //     });
    // }

    //   const handleImageCheck = async (image: any) => {
    //     const base64Image = await convertToBase64(image);
    //     console.log("The image post conversion >>>", base64Image)

    //     try {
    //     const response = await fetch(
    //         "http://localhost:8080/api/edit-image/face-detector",
    //         {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json", // Set the content type to JSON
    //         },
    //         body: JSON.stringify({
    //             base64Image: base64Image,
    //         }),
    //         }
    //     );
    //         const data = await response.json();
    //         console.log("Server Response:", data);

    //     } catch (error) {
    //     console.error("Upload failed:", error);
    //     }

    // };

    // (0) Upload Image -> baseImage (working copy) + uploadedImage (untouched copy)
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
    const handleDownload = async () => {
        let fileName =
            prompt("Enter a name for the file")?.trim() || "edited_image";

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
        const imageBlob = await response.blob();

        const img = new Image();
        img.src = URL.createObjectURL(imageBlob);

        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set the canvas size to the image's size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the white background first
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the image on top of the white background
            ctx.drawImage(img, 0, 0);

            // Convert the canvas to a blob
            const newBlob = await new Promise((resolve) =>
                canvas.toBlob(resolve, "image/png")
            );

            try {
                // use file system access API to let user choose where to save the file
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: `${fileName}.png`,
                    types: [
                        {
                            description: "PNG Image",
                            accept: { "image/png": [".png"] },
                        },
                    ],
                });

                // create a writable stream and write the blob to the file
                const writableStream = await fileHandle.createWritable();
                await writableStream.write(newBlob);
                await writableStream.close();

                alert("File saved successfully!");
            } catch (error) {
                console.error("File save canceled or failed:", error);
            }
        };
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
                    {croppedImage ? (
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
                            setBgcolorImage={setBaseImage}
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
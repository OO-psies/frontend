import React, { useState, useRef, useEffect } from "react";
// import { MaskEditor, toMask } from "react-mask-editor";
import { MaskEditor } from "@/components/maskEditor"
import { toMask, toStrokeMask } from "@/components/utils"
import "react-mask-editor/dist/style.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton"
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BgRemoverPopUpProps {
    uploadedImage: string | null; //from app.tsx
    uploadedMask: string | null;
    imageFile: File | null;
    setBgRemovedImage: (image: string | null) => void; // from 
  }

export default function BgRemoverPopUp({ uploadedImage, uploadedMask, imageFile, setBgRemovedImage }: BgRemoverPopUpProps){
    // flag markers
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // from BE (mask for overlay, image not used)
    const [imageMask, setImageMask] = useState<string>(''); 
    const [bgRemovedImage, loadBgRemovedImage] = useState<string>(''); // just normal photo from BE

    // for recording user strokes in maskEditor Child
    const canvas = useRef<HTMLCanvasElement>();
    const strokeCanvas = useRef<HTMLCanvasElement>();
    const [cursorSize, setCursorSize] = React.useState(10); // Default brush size

    // for sending to BE for touchups
    const [supplementMask, setSupplementMask] = useState<string>(''); 

    const handleCursorSizeChange = (newSize: number) => {
      setCursorSize(newSize); // Update cursor size state
    };

    // useEffect(() => {
    //     console.log(canvas.current); // Should log a valid canvas element
    // }, []);

    // Helper F0 - Sends image to BE on isOpen
    useEffect(() => {
        if (!isOpen) {
            
        } else {
            handleImageUpload();
        }
    }, [isOpen])

    // Helper F0 - Converts Base64 to Image URL
    const convertToImageUrl = async (base64: string) => {
        return `data:image/png;base64,${base64}`;
    }
    
    // Helper F1 - Converts Image URL to Base64
    const convertToBase64 = async (image: File | string) => {

        if (typeof(image) === 'string') {
            let file: File;
            const response = await fetch(image);
            const blob = await response.blob();
            file = new File([blob], "image.png", { type: blob.type });
            console.log(file, "heres the file type")

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
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(image); // Read file as Base64
            reader.onload = () => {
                const base64String = reader.result as string;
                // Remove the 'data:image/<file-type>;base64,' prefix if present
                const base64Data = base64String.split(",")[1];
                resolve(base64Data); // This gives you just the base64 part
            };
            reader.onerror = (error) => reject(error);
        });
    }

    // Helper F2 - API Request on render
    const handleImageUpload = async () => {
        // on load, send over: 1) image
        // receive: 1) mask, 2) image
        setIsLoading(true);
        if (!imageFile) {
            console.log("file is null")
            return
        }

        const base64Image = await convertToBase64(imageFile);

        try {
        const response = await fetch(
            "http://localhost:8080/api/edit-image/background-removal",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({
                base64Image: base64Image,
            }),
            }
        );
            const data = await response.json();
            console.log("Server Response:", data);

            const dataMask = await convertToImageUrl(data.base64Mask)
            const dataResult = await convertToImageUrl(data.base64Result)
            setImageMask(dataMask);
            loadBgRemovedImage(dataResult);

        } catch (error) {
        console.error("Upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper F3 - API Request onclick touchup
    const handleTouchUp = async () => {
        // if touchup is clicked, send over: 1) new mask (brush strokes), 2) old mask, 3) image
        // receive: 1) new mask, 2) image
        setIsLoading(true);
        if (!supplementMask) {
            console.log("supplementary mask is null")
            return
        } else if (!imageFile) {
            console.log("file is null")
            return
        }

        const base64Image = await convertToBase64(imageFile);
        const base64NewMask = await convertToBase64(supplementMask)
        const base64CurrentMask = await convertToBase64(imageMask)

        try {
        const response = await fetch(
            "http://localhost:8080/api/edit-image/refine-background-removal",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify({
                base64Image: base64Image,
                base64NewMask: base64NewMask,
                base64CurrentMask: base64CurrentMask
            }),
            }
        );
            const data = await response.json();
            console.log("Server Response:", data);

            const dataMask = await convertToImageUrl(data.base64Mask)
            const dataResult = await convertToImageUrl(data.base64Result)
            setImageMask(dataMask);
            loadBgRemovedImage(dataResult);

        } catch (error) {
        console.error("Upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // F1 - Calls HF1 HF2 (converts and sends to BE for touchup)
    const handleBgRemove = async () => {
        const base64NewMask = await convertToBase64(toStrokeMask(strokeCanvas.current))

        setSupplementMask(toStrokeMask(strokeCanvas.current));
        // console.log("Just the strokes >>>", toStrokeMask(strokeCanvas.current));
        console.log("Just the strokes b64>>>", base64NewMask);
        // console.log("Mask >>>", toMask(canvas.current));
        console.log("be-mask", imageMask)
        console.log("be-result", bgRemovedImage)
    }

    // F2 - Closes Dialog
    const closeDialog = (() => {
        setIsOpen(false);
    })

    return (
        <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
            <Button disabled={!uploadedImage} onClick={() => setIsOpen(true)}>
                <Crop /> Remove Background
            </Button>
            </DialogTrigger>

            <DialogContent>
            <DialogHeader>
                <DialogTitle>Remove your background</DialogTitle>
                <DialogDescription className="pb-4">
                Use the brush to clean your background.<br />
                Or click on the areas you want to clean
                </DialogDescription>

                {/* Cropping Image */}
                    <div className="this flex mb-10">
                        { isLoading &&
                            <Skeleton className="h-[400px] w-full"/>
                        }
                    </div>

                        { !isLoading &&
                            <div className="items-center min-h-400"> 
                            <MaskEditor
                                src={uploadedImage}
                                maskSrc={imageMask}
                                canvasRef={canvas}
                                strokeCanvasRef={strokeCanvas}
                                maskColor="#23272d"
                                maskBlendMode="normal"
                                style={{ maxHeight: "100%", display: "block" }} 
                                />
                        </div>
                        }


                {/* Done Button */}
                <div className="flex justify-end mt-4 gap-2">
                    <Button onClick={handleBgRemove}>
                        Touch Up
                    </Button>
                    <Button onClick={closeDialog}>
                        Done
                    </Button>
                </div>
            </DialogHeader>
            </DialogContent>
        </Dialog>
        </>
    );
}
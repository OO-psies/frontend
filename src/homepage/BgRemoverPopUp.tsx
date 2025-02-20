/*
Functionalities:
1. accept image (from cropped or from uploads)
2. sends image to be for removal (req)
3. fetches bg removed image + mask from be (res)
4. shows image and mask over image
5. use interactivity with mask
6. sends pixel radius to be
*/

import React, { useState, useRef, useEffect } from "react";
import { MaskEditor, toMask } from "react-mask-editor";
import "react-mask-editor/dist/style.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton"
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BgRemoverPopUpProps {
    uploadedImage: string; //from app.tsx
    setBgRemovedImage: (image: string | null) => void; // from 
  }

export default function BgRemoverPopUp({ uploadedImage, setBgRemovedImage }: BgRemoverPopUpProps){
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false); 
    const [bgRemovedImage, loadBgRemovedImage] = useState<string>(''); 

    const imageRef = useRef<HTMLImageElement | null>(null);
    const canvas = useRef<HTMLCanvasElement>();

    useEffect(() => {
        console.log(canvas.current); // Should log a valid canvas element
    }, []);

    // Helper F0 - Sends image to BE on isOpen
    useEffect(() => {
        if (!isOpen) {
            setImageLoaded(false);
        } else {
            // handleImageUpload();
        }
    }, [isOpen])
    
    // Helper F1 - Converts Image URL to Base64
    const convertToBase64 = async (image: string) => {    
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

    // Helper F2 - API Request sent to BE (may or may not take in mask)
    const handleImageUpload = async () => {
        setIsLoading(true);
        const base64Image = await convertToBase64(uploadedImage);
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
            loadBgRemovedImage(data);
        } catch (error) {
        console.error("Upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // F1 - Calls HF1 HF2 (converts and sends to BE for touchup)
    const handleBgRemove = (() => {
        console.log(toMask(canvas.current))
        console.log("Clicked button for retouchup")
        console.log(canvas.current); // Should log a valid canvas element
    })

    // F2 - Closes Dialog
    const closeDialog = (() => {
        setIsOpen(false);
    })

    // if (isLoading) {
    //     return (
    //         <>
    //             <Dialog>
    //                 <DialogTrigger asChild>
    //                 </DialogTrigger>
    //                 <DialogContent>
    //                 <DialogHeader>
    //                     <DialogTitle>Loading</DialogTitle>
    //                     <DialogDescription className="pb-4">
    //                         Loading
    //                     </DialogDescription>
    //                 </DialogHeader>
    //                 </DialogContent>
    //             </Dialog>
    //         </>
    //     )
    // }

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
                    <div className="flex mb-10">
                        { isLoading &&
                            <Skeleton className="h-[400px] w-full"/>
                        }
                        {/* { !isLoading &&
                            // <img 
                            //     ref={imageRef} 
                            //     src={uploadedImage} //#### to change to bg removed image from be
                            //     alt="To Crop" 
                            //     style={{ maxWidth: "100%", display: "block" }} 
                            //     onLoad={() => setImageLoaded(true)} // ensure image is loaded before initializing Cropper
                            // />

                        } */}
                    </div>

                    <div className="flex">
                        <MaskEditor
                            src=""
                            canvasRef={canvas}
                            maskColor="#292c30"
                            maskBlendMode="normal"
                            cursorSize={5}
                            maskOpacity={1}
                            />
                    </div>

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
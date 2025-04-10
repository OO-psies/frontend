import React, { useState, useRef, useEffect } from "react";
// import { MaskEditor, toMask } from "react-mask-editor";
import { MaskEditor } from "@/components/maskEditor"
import { toMask, toStrokeMask } from "@/components/utils"
import "react-mask-editor/dist/style.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton"
import { Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { strict } from "node:assert";

interface BgRemoverPopUpProps {
    baseImageWithBg: string | null;
    savedMask: string | null;
    setBaseImage: (image: string | null) => void;
    setSavedMask: (image: string | null) => void;
  }

export default function BgRemoverPopUp({ baseImageWithBg, savedMask, setBaseImage, setSavedMask }: BgRemoverPopUpProps){
    // flag markers
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // from BE
    const [imageMask, setImageMask] = useState<string | null>(null); // store mask to be used
    const [bgRemovedImage, loadBgRemovedImage] = useState<string | null>(null); // store latest bg removed image from BE -> setBaseImage !!! must load when dialog is closed

    const [stashedBgRemovedImage, loadStashedBgRemovedImage] = useState<string | null>(null); // store to return to user upon saving/reversion

    // for recording user strokes in maskEditor Child
    const canvas = useRef<HTMLCanvasElement>();
    const strokeCanvas = useRef<HTMLCanvasElement>();
    const [cursorSize, setCursorSize] = React.useState(10); // Default brush size

    // for sending to BE for touchups
    const [supplementMask, setSupplementMask] = useState<string | null>(''); 

    const handleCursorSizeChange = (newSize: number) => {
      setCursorSize(newSize); // Update cursor size state
    };

    // [!!!Testing for debug] Retrieve child loaded dimensions 
    // const [childWidth, setChildWidth] = useState<number | null>(null);
    // const [childHeight, setChildHeight] = useState<number | null>(null);
    // const [childLoaded, setChildLoaded] = useState<boolean>(false);
    // const tryWidth = 655;
    // const tryHeight = 500;
    // const [isReadyToLoad, setIsReadyToLoad] = useState(false);

    // Event 1 - Sends image to BE on isOpen
    useEffect(() => {
        if (isOpen) {
            if (savedMask) {
                setImageMask(savedMask);
            } else {
                handleImageUpload();
            }
        }
    }, [isOpen])

    // [!!!Testing for Debug] Event 2 - Obtains Child element maskEditor's dimensions for rendering
    // useEffect(() => {
    //     console.log("child loaded >>>", childLoaded);
    // }, [childLoaded])
    // useEffect(() => {
    //     console.log("child width >>>", childWidth);
    // }, [childWidth])
    // useEffect(() => {
    //     console.log("child height >>>", childHeight);
    // }, [childHeight])

    // Helper (F1) - Converts Base64 to Image URL
    const convertToImageUrl = async (base64: string) => {
        return `data:image/png;base64,${base64}`;
    }
    // Helper (F2) - Converts Image URL to Base64
    const convertToBase64 = async (image: File | string): Promise<string> => {

        // (2.1) if image null
        if (!image) {
            console.log("image does not exist");
        }

        // (2.2) if typeof(image) == string
        if (typeof(image) === 'string') {
            let file: File;
            const response = await fetch(image);
            const blob = await response.blob();
            file = new File([blob], "image.png", { type: blob.type });

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

        // (2.3) if typeof(image) == file
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

    /* API (F3) - API Request on render
        if !savedMask:
        1. send [baseImageWithBg] to BE to process
        2. receive [bgRemovedImage, ImageMask]
    */
    const handleImageUpload = async () => {
        setIsLoading(true);

        if (!baseImageWithBg) {
            console.log("file is null")
            return
        }
        const base64Image = await convertToBase64(baseImageWithBg);

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
            // console.log("Server Response:", data);

            const dataMask = await convertToImageUrl(data.base64Mask)
            const dataResult = await convertToImageUrl(data.base64Result)
            console.log("Initial mask result>>>", dataMask)
            console.log("Initial bg remove result>>>", dataResult)

            setImageMask(dataMask); // mask for display overlay
            loadBgRemovedImage(dataResult); 

        } catch (error) {
        console.error("Upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // API (F4) - API Request onclick touchup
    const handleTouchUp = async () => {
        // if touchup is clicked, send over: 1) new mask (brush strokes), 2) old mask, 3) image
        // receive: 1) new mask, 2) image

        setIsLoading(true);

        const base64Image = await convertToBase64(baseImageWithBg);
        // console.log("baseImageWithBg for touch up")
        // console.log(baseImageWithBg)
        // console.log(base64Image);
        const base64NewMask = await convertToBase64(supplementMask)
        // console.log("supplementMask for touch up")
        // console.log(supplementMask)
        // console.log(base64NewMask);
        const base64CurrentMask = await convertToBase64(imageMask)
        // console.log("imageMask for touch up")
        // console.log(imageMask)
        // console.log(base64CurrentMask)

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
            // console.log("Server Response:", data);

            const dataMask = await convertToImageUrl(data.base64Mask)
            const dataResult = await convertToImageUrl(data.base64Result)
            console.log("Refined mask result>>>", dataMask)
            console.log("Refined bg remove result>>>", dataResult)

            setImageMask(dataMask); // store new mask for display in child
            loadStashedBgRemovedImage(bgRemovedImage); // stash prev bg-removed result
            loadBgRemovedImage(dataResult); // store new bg-removed result

        } catch (error) {
        console.error("Upload failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Event 2 - Calls F2, affects F4 (converts and calls F4 for sending to BE to touchup)
    const handleBgRemove = async () => {
        // Calls F2
        const convertedStrokeMask = toStrokeMask(strokeCanvas.current);
        setSupplementMask(convertedStrokeMask);
        console.log("Just the strokes >>>", convertedStrokeMask);

        // Calls F4
        handleTouchUp();
        // console.log("Mask >>>", toMask(canvas.current)); // not in use
    }

    // Event 3 - Sets latest imageMask -> savedMask and latest bgRemovedImage -> baseImage Closes Dialog
    const closeDialog = (() => {
        setBaseImage(bgRemovedImage);
        setSavedMask(imageMask);
        setIsOpen(false);
    })

    return (
        <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
            <Button disabled={!baseImageWithBg} onClick={() => setIsOpen(true)}>
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

                        { isLoading &&
                            <div className="this flex mb-10">
                                <Skeleton className="h-[400px] w-full"/>
                            </div>
                        }

                        { !isLoading &&
                            <div className="items-center"> 
                            <MaskEditor
                                src={baseImageWithBg} //to store currentImageWithBg
                                maskSrc={imageMask}
                                canvasRef={canvas}
                                strokeCanvasRef={strokeCanvas}
                                maskColor="#23272d"
                                maskBlendMode="normal"
                                />
                            </div>
                        }

                {/* Done Button */}
                <div className="flex justify-end mt-4 gap-2">
                <Button onClick={handleBgRemove}
                    disabled={isLoading}>
                        Touch Up
                    </Button>
                <Button onClick={closeDialog}
                    disabled={isLoading}>
                    Done
                </Button>
                </div>
            </DialogHeader>
            </DialogContent>
        </Dialog>
        </>
    );
}
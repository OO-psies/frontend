import React, { useState, useRef, useEffect } from "react";
import { MaskEditor } from "@/components/maskEditor";
import { toMask } from "@/components/utils";
import "react-mask-editor/dist/style.css";
// Removed unused TestingMask import

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

import { SketchPicker } from "react-color";

interface BgColourPopUpProps {
    bgRemovedImage: string | null; // now using the background removed image from previous page
    setBgcolorImage: (image: string | null) => void;
}

export default function BgColourPopUp({
    bgRemovedImage,
    setBgcolorImage,
}: BgColourPopUpProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [color, setColor] = useState<string>("#ffffff");

    const handleChangeComplete = (selectedColor: any) => {
        setColor(selectedColor.hex);
    };

    // Draw the background-removed image onto the canvas with the chosen background color
    const drawOnCanvas = () => {
        if (!bgRemovedImage || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "Anonymous"; // if the image source is from another origin
        img.src = bgRemovedImage;
        img.onload = () => {
            // resize the canvas to match the image dimensions
            canvas.width = img.width;
            canvas.height = img.height;
            // first fill the canvas with the selected background color
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // then draw the (transparent) image over the colored background
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // At this point the layers are flattened into one canvas image
            setImageLoaded(true);
        };
    };

    // When the dialog is open and whenever bgRemovedImage, color, or isOpen changes,
    // draw the image with the updated background.
    useEffect(() => {
        if (isOpen) {
            const tryDraw = () => {
                if (canvasRef.current) {
                    drawOnCanvas();
                } else {
                    requestAnimationFrame(tryDraw);
                }
            };
            tryDraw();
        }
    }, [bgRemovedImage, color, isOpen]);

    // Helper function: Converts canvas to a flattened image Data URL
    const getCanvasDataUrl = (): string | null => {
        if (canvasRef.current) {
            return canvasRef.current.toDataURL("image/png");
        }
        return null;
    };

    // Reset imageLoaded when the dialog is closed
    useEffect(() => {
        if (!isOpen) {
            setImageLoaded(false);
        }
    }, [isOpen]);

    // On clicking "Done", retrieve the flattened image and pass it back through the setter prop.
    const handleDone = () => {
        const dataUrl = getCanvasDataUrl();
        setBgcolorImage(dataUrl);
        setIsOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button 
                    disabled={!bgRemovedImage} 
                    onClick={() => setIsOpen(true)}>
                        <Crop /> Change Background Color
                    </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Replace Your Background</DialogTitle>
                        <DialogDescription className="pb-4">
                            Choose a color to replace the image background.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Canvas container */}
                        <div className="flex-1 flex justify-center">
                            {bgRemovedImage ? (
                                <canvas
                                    ref={canvasRef}
                                    className="border border-gray-300 max-w-full h-auto"
                                />
                            ) : (
                                <Skeleton className="w-full h-64" />
                            )}
                        </div>
                        {/* Color Picker */}
                        <div className="flex-initial flex justify-center md:justify-end">
                            <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
                        </div>
                    </div>
                    {/* Done button */}
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleDone} disabled={!imageLoaded}>
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

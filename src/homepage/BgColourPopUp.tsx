import React, { useState, useRef, useEffect } from "react";
 import { MaskEditor } from "@/components/maskEditor";
 import { toMask } from "@/components/utils";
 import "react-mask-editor/dist/style.css";
 import TestingMask from "@/components/testingMark";
 
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
     uploadedImage: string | null;
     setBgcolorImage: (image: string | null) => void;
 }
 
 export default function BgColourPopUp({
     uploadedImage,
     setBgcolorImage,
 }: BgColourPopUpProps) {
     const [isOpen, setIsOpen] = useState(false);
     const [imageLoaded, setImageLoaded] = useState(false);
     const canvasRef = useRef<HTMLCanvasElement | null>(null);
     const [color, setColor] = useState<string>("#ffffff");
 
     const handleChangeComplete = (selectedColor: any) => {
         setColor(selectedColor.hex);
     };
 
     // Draw the uploaded image onto the canvas with the chosen background color
     const drawOnCanvas = () => {
         if (!uploadedImage || !canvasRef.current) return;
         const canvas = canvasRef.current;
         const ctx = canvas.getContext("2d");
         if (!ctx) return;
         const img = new Image();
         img.crossOrigin = "Anonymous"; // Useful if the image is from another origin
         img.src = uploadedImage;
         img.onload = () => {
             // set canvas size equal to the image dimensions
             canvas.width = img.width;
             canvas.height = img.height;
             // first fill the background with the selected color
             ctx.fillStyle = color;
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             // then draw the image on top
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             setImageLoaded(true);
         };
     };
 
     // Re-draw the canvas when uploadedImage, color, or the dialog open state change.
     useEffect(() => {
         if (isOpen) {
             // Ensure canvasRef is set. If not, try on the next animation frame.
             const tryDraw = () => {
                 if (canvasRef.current) {
                     drawOnCanvas();
                 } else {
                     requestAnimationFrame(tryDraw);
                 }
             };
             tryDraw();
         }
     }, [uploadedImage, color, isOpen]);
 
     // Helper function: Converts canvas to base64
     const getCanvasDataUrl = (): string | null => {
         if (canvasRef.current) {
             return canvasRef.current.toDataURL("image/png");
         }
         return null;
     };
 
     // When the dialog is closed, reset the imageLoaded state
     useEffect(() => {
         if (!isOpen) {
             setImageLoaded(false);
         }
     }, [isOpen]);
 
     // When clicking "Done", pass back the canvas base64 image and close the popup
     const handleDone = () => {
         const dataUrl = getCanvasDataUrl();
         setBgcolorImage(dataUrl);
         setIsOpen(false);
     };
    
 
     return (
         <>
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
                 <DialogTrigger asChild>
                     <Button disabled={!uploadedImage} onClick={() => setIsOpen(true)}>
                         <Crop /> Change Background color
                     </Button>
                 </DialogTrigger>
 
                 <DialogContent>
                     <DialogHeader>
                         <DialogTitle>Replace Your Background</DialogTitle>
                         <DialogDescription className="pb-4">
                             Choose a color to replace your image background.
                         </DialogDescription>
                     </DialogHeader>
                     <div className="flex flex-col md:flex-row gap-4">
                         {/* Responsive Image Canvas */}
                         <div className="flex-1 flex justify-center">
                             {uploadedImage ? (
                                 <canvas
                                     ref={canvasRef}
                                     className="border border-gray-300 max-w-full h-auto"
                                 />
                             ) : (
                                 <Skeleton className="w-full h-64" />
                             )}
                         </div>
                         {/* Color Picker on the right */}
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
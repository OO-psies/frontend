import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SketchPicker } from "react-color";

interface BgColourPopUpProps {
  bgRemovedImage: string | null; // background removed image from previous page
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
  // savedBgColor remembers the applied background color from the previous change.
  const [savedBgColor, setSavedBgColor] = useState<string | null>(null);

  const handleChangeComplete = (selectedColor: any) => {
    setColor(selectedColor.hex);
  };

  // Helper: convert hex to RGB
  const hexToRgb = (hex: string) => {
    let cleaned = hex.replace(/^#/, "");
    if (cleaned.length === 3) {
      cleaned = cleaned
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const num = parseInt(cleaned, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Helper: check if a pixel matches the target color
  const colorsMatch = (
    r: number,
    g: number,
    b: number,
    target: { r: number; g: number; b: number }
  ) => {
    return r === target.r && g === target.g && b === target.b;
  };

  // Draw the image on canvas.
  // If no savedBgColor exists, fill with the current color and draw the image.
  // Otherwise, replace the savedBgColor pixels with the new color.
  const drawOnCanvas = () => {
    if (!bgRemovedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = bgRemovedImage;
    img.onload = () => {
      // set canvas dimensions to the image’s dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      if (!savedBgColor) {
        // First application: fill with the selected color and draw the image on top.
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Subsequent changes:
        // Draw the flattened image (which was saved from before)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Access the current pixel data.
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const prevColorRgb = hexToRgb(savedBgColor);
        const newColorRgb = hexToRgb(color);

        // Loop over every pixel and replace pixels matching the previously saved color.
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];
          if (a > 0 && colorsMatch(r, g, b, prevColorRgb)) {
            data[i] = newColorRgb.r;
            data[i + 1] = newColorRgb.g;
            data[i + 2] = newColorRgb.b;
          }
        }
        // Write the updated pixel data back to the canvas.
        ctx.putImageData(imageData, 0, 0);
      }
      setImageLoaded(true);
    };
  };

  // Redraw canvas when bgRemovedImage, color, or dialog open state changes.
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

  // Reset the imageLoaded flag when the dialog closes.
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  // Helper: get the flattened canvas image.
  const getCanvasDataUrl = (): string | null => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL("image/png");
    }
    return null;
  };

  // On clicking Done, update parent's image and save the applied color.
  const handleDone = () => {
    const dataUrl = getCanvasDataUrl();
    setBgcolorImage(dataUrl);
    // Save the newly applied color for subsequent changes.
    setSavedBgColor(color);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!bgRemovedImage} onClick={() => setIsOpen(true)}>
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
          {/* Done Button */}
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

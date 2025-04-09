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
  bgRemovedImage: string | null; // background removed image from parent
  setBgcolorImage: (image: string | null) => void; // function to update the displayed image in the parent
}

export default function BgColourPopUp({
  bgRemovedImage,
  setBgcolorImage,
}: BgColourPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>("");

  // This state is used to store the original image for re-coloring,
  // and it is set only once. We never overwrite it to allow multiple color changes.
  const [originalBgRemovedImage, setOriginalBgRemovedImage] = useState<string | null>(null);

  // When bgRemovedImage is provided for the first time, store it in originalBgRemovedImage.
  useEffect(() => {
    if (bgRemovedImage && !originalBgRemovedImage) {
      setOriginalBgRemovedImage(bgRemovedImage);
    }
  }, [bgRemovedImage, originalBgRemovedImage]);

  const handleChangeComplete = (selectedColor: any) => {
    setColor(selectedColor.hex);
  };

  const drawOnCanvas = () => {
    // If we have no image to work with, exit early.
    if ((!bgRemovedImage && !originalBgRemovedImage) || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use originalBgRemovedImage if a color is selected; otherwise use bgRemovedImage.
    const imageSrc =
      color !== "" && originalBgRemovedImage ? originalBgRemovedImage : bgRemovedImage;
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // If a color is selected, fill the canvas with the color before drawing the image.
      // Otherwise, simply clear the canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (color !== "") {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };
  };

  // Redraw the canvas every time the modal is open, or bgRemovedImage, color, or originalBgRemovedImage change.
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
  }, [bgRemovedImage, color, isOpen, originalBgRemovedImage]);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  // Get the updated image from the canvas as a data URL.
  const getCanvasDataUrl = (): string | null => {
    if (canvasRef.current) {
      return canvasRef.current.toDataURL("image/png");
    }
    return null;
  };

  // When "Done" is clicked, pass the canvas image back to the parent.
  // Note that if no color is selected, the original image is passed.
  const handleDone = () => {
    const dataUrl = getCanvasDataUrl();
    setBgcolorImage(dataUrl);
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
            <div className="flex-1 flex justify-center">
              {bgRemovedImage || originalBgRemovedImage ? (
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 max-w-full h-auto"
                />
              ) : (
                <Skeleton className="w-full h-64" />
              )}
            </div>

            <div className="flex-initial flex justify-center md:justify-end">
              <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
            </div>
          </div>

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

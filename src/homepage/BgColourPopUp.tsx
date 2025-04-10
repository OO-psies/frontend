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

/**
 * Helper function: checkImageHasAlpha
 *
 * Given an image URL, load and draw it onto an offscreen canvas.
 * Then inspect its pixel data. If any pixel's alpha value is less than 255,
 * we return true. Otherwise, false.
 */
const checkImageHasAlpha = (imageUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = img.width;
      offscreenCanvas.height = img.height;
      const ctx = offscreenCanvas.getContext("2d");
      if (!ctx) {
        resolve(false);
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // data[i+3] is the alpha value.
          if (data[i + 3] < 255) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      } catch (e) {
        // If an error occurs (possibly due to CORS issues), assume no alpha.
        resolve(false);
      }
    };
    img.onerror = () => {
      resolve(false);
    };
  });
};

export default function BgColourPopUp({
  bgRemovedImage,
  setBgcolorImage,
}: BgColourPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>("");

  // This state is used to store the original image for re-coloring.
  // It will be set only if the image has alpha (transparency).
  const [originalBgRemovedImage, setOriginalBgRemovedImage] = useState<string | null>(null);

  // When the dialog opens, if we haven't saved an original image yet,
  // check if the provided bgRemovedImage has alpha. If it does, save it.
  useEffect(() => {
    if (isOpen && bgRemovedImage && !originalBgRemovedImage) {
      checkImageHasAlpha(bgRemovedImage).then((hasAlpha) => {
        if (hasAlpha) {
          setOriginalBgRemovedImage(bgRemovedImage);
        }
      });
    }
  }, [isOpen, bgRemovedImage, originalBgRemovedImage]);

  const handleChangeComplete = (selectedColor: any) => {
    setColor(selectedColor.hex);
  };

  const drawOnCanvas = () => {
    // Ensure we have an image source and a valid canvas.
    if ((!bgRemovedImage && !originalBgRemovedImage) || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use the original image if a color is selected and the original was saved;
    // otherwise, use the provided bgRemovedImage.
    const imageSrc =
      color !== "" && originalBgRemovedImage ? originalBgRemovedImage : bgRemovedImage;
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Clear canvas and, if a color is selected, fill the background with that color.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (color !== "") {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      // Draw the image on top.
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
    };
  };

  // Redraw the canvas whenever the dialog is open and any dependency changes.
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
  }, [isOpen, bgRemovedImage, originalBgRemovedImage, color]);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  // Get the updated canvas as a data URL.
  const getCanvasDataUrl = (): string | null => {
    return canvasRef.current ? canvasRef.current.toDataURL("image/png") : null;
  };

  // On "Done", pass the resulting image back to the parent and close the modal.
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
                <canvas ref={canvasRef} className="border border-gray-300 max-w-full h-auto" />
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

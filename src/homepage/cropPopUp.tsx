import React, { useState, useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import IDSizeByCountry from "@/homepage/IDSizeByCountry.json";

import Cropper from 'cropperjs';
interface CropPopUpProps {
  uploadedImage: string;
  setCroppedImage: (image: string | null) => void; // to pass cropped image to app.tsx
}

export default function CropPopUp({ uploadedImage, setCroppedImage }: CropPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false); // ensures that cropper is only initialized after the image has been fully loaded

  // reset imageLoaded when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
    }
  }, [isOpen]);

  // ensure cropper initializes only after the image has loaded
  useEffect(() => {
    if (isOpen && imageLoaded && imageRef.current) {
      console.log("Initializing Cropper...");
      if (cropperRef.current) {
        cropperRef.current.destroy(); // 
      }

      cropperRef.current = new Cropper(imageRef.current, {
        autoCropArea: 1, 
        viewMode: 1, // prevents cropping beyond image boundaries
        dragMode: "crop", // allows user to resize the crop box
        responsive: true,
        zoomable: true,
        background: false,
      });

      console.log("cropper initialized.");
    }

    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, [isOpen, imageLoaded]); 

  const handleCrop = () => {
    if (!cropperRef.current) return;

    let canvas;
    if (selectedCountry) {
      const dimensions = IDSizeByCountry[selectedCountry as keyof typeof IDSizeByCountry];
      if (dimensions) {
        console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
        canvas = cropperRef.current.getCroppedCanvas({
          width: dimensions.width,
          height: dimensions.height,
        });
      } else {
        console.log("No dimensions found for the selected country.");
        return;
      }
    } else {
      console.log("Manual cropping using current selection.");
      canvas = cropperRef.current.getCroppedCanvas();
    }

    if (canvas) {
      const croppedDataURL = canvas.toDataURL("image/png");
      console.log("Cropped Image Data URL:", croppedDataURL);
      setCroppedImage(croppedDataURL); // pass cropped image to App.tsx
    }

    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!uploadedImage} onClick={() => setIsOpen(true)}>
            <Crop /> Crop & Resize
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>How would you like to crop and resize your photo?</DialogTitle>
            <DialogDescription className="pb-4">
              Manually Crop By Dragging The Corners. Use two fingers for zooming.<br />
              Or Select A Country For Auto-Crop
            </DialogDescription>

            {/* Cropping Image */}
            <div>
              <img 
                ref={imageRef} 
                src={uploadedImage} 
                alt="To Crop" 
                style={{ maxWidth: "100%", display: "block" }} 
                onLoad={() => setImageLoaded(true)} // ensure image is loaded before initializing Cropper
              />
            </div>

            {/* Country selection */}
            <Select onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>

              <SelectContent>
                {Object.keys(IDSizeByCountry).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Done Button */}
            <div className="flex justify-end mt-2">
              <Button onClick={handleCrop}>
                Done
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
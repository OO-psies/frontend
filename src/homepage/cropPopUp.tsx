import React, { useState, useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import IDSizeByCountry from "@/homepage/IDSizeByCountry.json";

interface CropPopUpProps {
//   uploadedImage: string;
  baseImage: string; // Use the original image
  setCroppedImage: (image: string | null) => void;
}

export default function CropPopUp({ baseImage, setCroppedImage }: CropPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setSelectedCountry(null); // Reset country selection when modal closes
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && imageLoaded && imageRef.current) {
      console.log("Initializing Cropper...");
      if (cropperRef.current) {
        cropperRef.current.destroy();
      }

      cropperRef.current = new Cropper(imageRef.current, {
        autoCropArea: 1,
        viewMode: 1,
        dragMode: "crop",
        responsive: true,
        zoomable: true,
        background: false,
      });

      console.log("Cropper initialized.");
    }

    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, [isOpen, imageLoaded]);

  // auto-crop function when a country is selected
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  
    if (!cropperRef.current) return;
  
    const dimensions = IDSizeByCountry[country as keyof typeof IDSizeByCountry];
    if (dimensions) {
      console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
  
      // calculate aspect ratio
      const aspectRatio = dimensions.width / dimensions.height;
  
      // get image container size
      const imageElement = imageRef.current;
      if (!imageElement) return;
  
      const imageWidth = imageElement.clientWidth;
      const imageHeight = imageElement.clientHeight;
  
      // determine maximum possible crop area while maintaining aspect ratio
      let cropWidth = imageWidth * 0.7; // Make crop area 70% of image width
      let cropHeight = cropWidth / aspectRatio;
  
      if (cropHeight > imageHeight * 0.7) {
        cropHeight = imageHeight * 0.7;
        cropWidth = cropHeight * aspectRatio;
      }
  
      // set the new crop box size centered
      cropperRef.current.setCropBoxData({
        left: (imageWidth - cropWidth) / 2,
        top: (imageHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
  
      cropperRef.current.setAspectRatio(aspectRatio); // lock aspect ratio
    }
  };

  const handleCrop = () => {
    if (!cropperRef.current) return;

    let canvas;
    const imageElement = imageRef.current;
    if (!imageElement) return;

    if (selectedCountry) {
        const dimensions = IDSizeByCountry[selectedCountry as keyof typeof IDSizeByCountry];
        if (dimensions) {
            console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);

            // Ensure we maintain the original image resolution by using its natural size
            const aspectRatio = dimensions.width / dimensions.height;
            const originalWidth = imageElement.naturalWidth;
            const originalHeight = imageElement.naturalHeight;

            let newWidth = originalWidth;
            let newHeight = newWidth / aspectRatio;

            if (newHeight > originalHeight) {
                newHeight = originalHeight;
                newWidth = newHeight * aspectRatio;
            }

            canvas = cropperRef.current.getCroppedCanvas({
                width: newWidth,
                height: newHeight,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: "high"
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
        // convert canvas to Blob for better quality
        canvas.toBlob((blob) => {
            if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                console.log("Cropped Image Blob URL:", blobUrl);
                setCroppedImage(blobUrl);
            }
        }, "image/png", 1.0); // ensures no quality loss
    }

    setIsOpen(false);
};

  const handleRevert = () => {
    if (!baseImage) return;

    setSelectedCountry(null); // Reset country selection
    setCroppedImage(baseImage); // Revert to the original image

    if (cropperRef.current) {
      cropperRef.current.destroy(); // Destroy current cropper instance
      cropperRef.current = null;
    }

    setTimeout(() => {
      if (imageRef.current) {
        cropperRef.current = new Cropper(imageRef.current, {
          autoCropArea: 1,
          viewMode: 1,
          dragMode: "crop",
          responsive: true,
          zoomable: true,
          background: false,
        });
      }
    }, 100); // Small delay to reinitialize Cropper
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button disabled={!baseImage || baseImage === null} onClick={() => setIsOpen(true)}><Crop /> Crop & Resize</Button>
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
                src={baseImage} 
                alt="To Crop" 
                style={{ maxWidth: "100%", display: "block" }} 
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            {/* Country selection for Auto-Cropping */}
            <Select onValueChange={handleCountryChange}>
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
              <Button className="bg-red-500 hover:bg-red-400 mx-3" onClick={handleRevert}>
                Revert
              </Button>
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
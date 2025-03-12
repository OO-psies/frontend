import React, { useState, useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, Globe, FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import IDSizeByCountry from "@/homepage/IDSizeByCountry.json";

interface CropPopUpProps {
  baseImage: string;
  setCroppedImage: (image: string | null) => void;
}

export default function CropPopUp({ baseImage, setCroppedImage }: CropPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setSelectedCountry(null);
      setZoomLevel(1);
      setScaleX(1);
      setScaleY(1);
      setAspectRatio(null)
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
        aspectRatio: aspectRatio || NaN,
      });

      console.log("Cropper initialized.");
    }

    return () => {
      cropperRef.current?.destroy();
      cropperRef.current = null;
    };
  }, [isOpen, imageLoaded]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  
    if (!cropperRef.current) return;
  
    const dimensions = IDSizeByCountry[country as keyof typeof IDSizeByCountry];
    if (dimensions) {
      console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
      const aspectRatio = dimensions.width / dimensions.height;
      cropperRef.current.setAspectRatio(aspectRatio);
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    let newRatio: number | null = null;
    if (ratio !== "free") {
      newRatio = parseFloat(ratio);
    }
    setAspectRatio(newRatio);
    if (cropperRef.current) {
      cropperRef.current.setAspectRatio(newRatio || NaN);
    }
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    setZoomLevel(newZoom);
    if (cropperRef.current) {
      cropperRef.current.zoomTo(newZoom);
    }
  };

  const handleScaleXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScaleX = parseFloat(event.target.value);
    setScaleX(newScaleX);
    if (cropperRef.current) {
      cropperRef.current.scaleX(newScaleX);
    }
  };

  const handleScaleYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScaleY = parseFloat(event.target.value);
    setScaleY(newScaleY);
    if (cropperRef.current) {
      cropperRef.current.scaleY(newScaleY);
    }
  };

  const handleFlipHorizontal = () => {
    setScaleX((prev) => -prev); // Toggle between 1 and -1
    if (cropperRef.current) {
      cropperRef.current.scaleX(-scaleX);
    }
  };

  const handleFlipVertical = () => {
    setScaleY((prev) => -prev); // Toggle between 1 and -1
    if (cropperRef.current) {
      cropperRef.current.scaleY(-scaleY);
    }
  };

  const handleCrop = () => {
    if (!cropperRef.current) return;

    let canvas = cropperRef.current.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high"
    });

    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          console.log("Cropped Image Blob URL:", blobUrl);
          setCroppedImage(blobUrl);
        }
      }, "image/png", 1.0);
    }

    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!baseImage || baseImage === null} onClick={() => setIsOpen(true)}>
            <Crop /> Crop & Resize
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust & Crop Your Image</DialogTitle>
            <DialogDescription className="pb-4">
              Use the sliders to zoom, stretch, or flip your image.<br />
              Or Select A Country for Auto-Cropping
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

            <div className="flex gap-3">
              {/* Country Selection */}
              <div className="mt-4">
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
              </div>
              
              {/* handle aspect ratio */}
              <div className="mt-4">
                <Select onValueChange={handleAspectRatioChange}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center space-x-2">
                      <SelectValue placeholder="Aspect Ratio" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1:1 (Square)</SelectItem>
                    <SelectItem value="0.5625">9:16 (Widescreen)</SelectItem>
                    <SelectItem value="0.75">3:4 (Standard)</SelectItem>
                    <SelectItem value="free">Freeform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="mt-4 flex items-center">
              <label className="text-sm w-20">Zoom</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.01"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="mt-2 flex-grow "
              />
            </div>

            {/* Scale X Slider */}
            <div className="mt-4 flex items-center">
              <label className="text-sm w-20">Scale X</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={scaleX}
                onChange={handleScaleXChange}
                className="mt-2 flex-grow "
              />
            </div>

            {/* Scale Y Slider */}
            <div className="mt-4 flex items-center">
              <label className="text-sm w-20">Scale Y</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={scaleY}
                onChange={handleScaleYChange}
                className="mt-2 flex-grow "
              />
            </div>

            {/* Flip Buttons */}
            <div className="mt-4 p-6 flex justify-center gap-4">
              <Button variant="outline" onClick={handleFlipHorizontal} className="bg-blue-500 text-white">
                <FlipHorizontal className="w-5 h-5" /> Flip Horizontally
              </Button>
              <Button variant="outline" onClick={handleFlipVertical} className="bg-blue-500 text-white">
                <FlipVertical className="w-5 h-5" /> Flip Vertically
              </Button>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="bg-red-500 hover:bg-red-400 mx-3" onClick={() => setIsOpen(false)}>
                Close
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
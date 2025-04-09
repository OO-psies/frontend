import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhanceProps {
  baseImage: string;
  setEnhancedImage: (image: string | null) => void;
}

export default function Enhance({ baseImage, setEnhancedImage }: EnhanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");

  // Flattering portrait filters
  const filters = [
    { name: "None", value: "none" },
    { name: "Soft Glow", value: "brightness(110%) contrast(95%) blur(1px)" },
    { name: "Warm Tone", value: "sepia(30%) brightness(105%)" },
    { name: "Cool Tone", value: "hue-rotate(200deg) brightness(110%) contrast(90%)" },
    { name: "Vibrant Boost", value: "saturate(130%) contrast(105%) brightness(105%)" },
    { name: "Smooth Skin", value: "brightness(108%) contrast(90%) blur(0.5px)" },
    { name: "Cinematic", value: "contrast(120%) brightness(95%) sepia(10%)" },
    { name: "Matte", value: "contrast(90%) brightness(105%) saturate(90%)" },
  ];

  const handleEnhance = () => {
    console.log(`Applying filter: ${selectedFilter}`);
    console.log("Base image:", baseImage);

    // Create a new canvas and get its 2D context.
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // Create a new Image to load the base image.
    const img = new Image();
    // If your baseImage is hosted from another domain, you may need crossOrigin set.
    img.crossOrigin = "Anonymous";
    img.src = baseImage;

    // When the image is loaded, draw it on the canvas with the selected filter.
    img.onload = () => {
      // Set canvas dimensions to the image dimensions.
      canvas.width = img.width;
      canvas.height = img.height;

      // Set the filter on the canvas context.
      ctx.filter = selectedFilter;

      // Draw the image onto the canvas.
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Export the canvas image as a data URL.
      const enhancedImageUrl = canvas.toDataURL();

      // Pass the filtered image URL back to the parent.
      setEnhancedImage(enhancedImageUrl);
      setIsOpen(false);
    };

    // In case of an image loading error.
    img.onerror = (error) => {
      console.error("Error loading image", error);
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button disabled={!baseImage} onClick={() => setIsOpen(true)}>
            <Wand2 /> Enhance
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Enhance Your Image</DialogTitle>
            <DialogDescription className="pb-4">
              Tap a filter to preview it before applying.
            </DialogDescription>

            {/* Image Display */}
            <div className="mb-4 flex justify-center">
              <img
                ref={imageRef}
                src={baseImage}
                alt="To Enhance"
                className="max-w-full rounded-lg transition-all duration-300"
                style={{ filter: selectedFilter, borderRadius: "8px" }}
              />
            </div>

            {/* Filter Selection */}
            <div className="flex justify-center gap-4 overflow-x-auto p-3">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`flex flex-col items-center p-1 rounded-lg transition-all ${
                    selectedFilter === filter.value ? "border-2 border-blue-500 scale-105" : "border border-transparent"
                  }`}
                >
                  <img
                    src={baseImage}
                    alt={filter.name}
                    className="w-16 h-16 object-cover rounded-md"
                    style={{ filter: filter.value }}
                  />
                  <p className="text-xs text-center mt-1">{filter.name}</p>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-4">
              <Button className="bg-red-500 hover:bg-red-400 mx-3" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={handleEnhance}>
                Apply Filter
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
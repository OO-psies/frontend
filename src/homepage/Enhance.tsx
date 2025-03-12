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

  // Filters with fixed preview sizes
  const filters = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Bright", value: "brightness(150%)" },
    { name: "Contrast", value: "contrast(200%)" },
    { name: "Saturate", value: "saturate(200%)" },
    { name: "Invert", value: "invert(100%)" },
    { name: "Hue Shift", value: "hue-rotate(90deg)" },
  ];

  const handleEnhance = () => {
    console.log(`Applying filter: ${selectedFilter}`);
    setEnhancedImage(baseImage); 
    setIsOpen(false);
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
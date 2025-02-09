import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crop, Scissors, Globe} from "lucide-react"
import { Button } from "@/components/ui/button";
import IDSizeByCountry from "@/homepage/IDSizeByCountry.json";
import React, { useState, useEffect } from 'react'

import Cropper from 'cropperjs';
interface CropPopUpProps {
    uploadedImage: string;
  }

export default function CropPopUp({ uploadedImage }: CropPopUpProps){
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    

    const handleAutoCrop = () => {
        if (!selectedCountry) return;
    
        const dimensions = IDSizeByCountry[selectedCountry as keyof typeof IDSizeByCountry];
    
        if (dimensions) {
        console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
        } else {
        console.log("No dimensions found for the selected country.");
        }
    };


  return (
    <>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

        {/* button */}
        <DialogTrigger asChild>
            <Button disabled={!uploadedImage} onClick={ () => setIsModalOpen(true)}><Crop />Crop & Resize </Button>
        </DialogTrigger>

        {/* content */}
        <DialogContent>
            <DialogHeader>
            <DialogTitle>How would you like to crop and resize your photo?</DialogTitle>
            <DialogDescription className="pb-4">Manually Crop By Dragging The Corners <br></br>Or Select A Country For Auto-Crop</DialogDescription>

            {/* ------------------------DISPLAY THE UPLOADED PICTURE ------------------------ */}
            <img src={uploadedImage} className="pb-4" />

            {/* ------------------------END OF UPLOADED PICTURE ------------------------ */}


            <Select onValueChange={setSelectedCountry}>

                {/* display the dropdown */}
                <SelectTrigger className="w-[180px]">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <SelectValue placeholder="Country" />
                    </div>
                </SelectTrigger>


                {/* display all the countries in the dropdown */}
                <SelectContent>
                    {Object.keys(IDSizeByCountry).map((country) => (
                    <SelectItem key={country} value={country}>
                        {country}
                    </SelectItem>
                    ))}
                </SelectContent>

            </Select>

                <div>
                    <Button onClick={handleAutoCrop} disabled={!selectedCountry} className="mt-2">Done</Button>
                </div>
            </DialogHeader>
        </DialogContent>
        </Dialog>
        </>
  )
  
}


import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crop, Scissors, Globe} from "lucide-react"
import { Button } from "@/components/ui/button";
import IDSizeByCountry from "@/homepage/IDSizeByCountry.json";
import { useState } from "react";
import ManualCrop from "./ManualCrop";



export default function CropPopUp(){
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [showManualCrop, setShowManualCrop] = useState<boolean>(false);

    const handleAutoCrop = () => {
        if (!selectedCountry) return;
    
        const dimensions = IDSizeByCountry[selectedCountry as keyof typeof IDSizeByCountry];
    
        if (dimensions) {
        console.log(`Auto-cropping to ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
        } else {
        console.log("No dimensions found for the selected country.");
        }
    };

        const handleManualCropClick = () => {
            setIsModalOpen(false); // Close the modal
            setShowManualCrop(true);
            console.log("Manually Crop & Resize triggered");

    };

  return (
    <>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>

        {/* button */}
        <DialogTrigger asChild>
            <Button onClick={ () => setIsModalOpen(true)}><Crop />Crop & Resize </Button>
        </DialogTrigger>

        {/* content */}
        <DialogContent>
            <DialogHeader>
            <DialogTitle>How would you like to crop and resize your photo?</DialogTitle>
            <DialogDescription className="pb-4">Select an option.</DialogDescription>
            <Button disabled={selectedCountry} onClick={handleManualCropClick}><Scissors />Manually Crop & Resize</Button>

            <br></br>
            <hr className="h-px bg-gray-400 border-0  my-8"></hr>

            <p className="pt-4">Or select a country for auto-crop:</p>
                <Select onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(IDSizeByCountry).map((country) => (
                    <SelectItem key={country} value={country}>
                        {country}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>

                <div>
                    <Button onClick={handleAutoCrop} disabled={!selectedCountry} className="mt-2"><Globe />Auto Crop For Selected Country</Button>
                </div>
            </DialogHeader>
        </DialogContent>
        </Dialog>
        </>
  )
  
}


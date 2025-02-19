/*
Functionalities:
1. accept image (from cropped or from uploads)
2. sends image to be for removal (req)
3. fetches bg removed image + mask from be (res)
4. shows image and mask over image
5. use interactivity with mask
6. sends pixel radius to be
*/

import React, { useState, useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crop, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BgRemoverPopUpProps {
    uploadedImage: string; //from app.tsx
    setBgRemovedImage: (image: string | null) => void; // from 
  }

export default function BgRemoverPopUp({ uploadedImage, setBgRemovedImage }: BgRemoverPopUpProps){
    const [isOpen, setIsOpen] = useState(false);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false); // ensures that cropper is only initialized after the image has been fully loaded

    return (
        <>
        </>
    );
}
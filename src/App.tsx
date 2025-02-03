import { useState } from 'react'
import { Button } from "@/components/ui/button";
import './App.css';
import { InputFile } from './UploadArea';
import { Crop, Wand2, ImageOff } from "lucide-react"

function App() {

  return (
    <>
        <div className='flex items-center justify-items-center h-screen flex-col'>
            <h1 className='font-bold'>OOpSies ID Photo Processor</h1>
            <p className='text-gray-700 py-4 pb-8'>Upload your image and choose an option to get started</p>
            <InputFile />


            {/* button option */}
            <div className='flex pt-8 space-x-4'>
                <Button ><Crop />Crop & Resize</Button>
                <Button><Wand2 />Enhance</Button>
                <Button><ImageOff />Remove Background</Button>
            </div>

            

        </div>
        


    </>
  )
}

export default App

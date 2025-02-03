"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scissors, Globe, Upload } from "lucide-react"

const countries = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
//   { value: "au", "Australia" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  // Add more countries as needed
]

export default function CropPopUp() {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleManualCrop = () => {
    console.log("Manual crop selected")
    // Implement manual crop logic here
  }

  const handleAutoCrop = () => {
    console.log(`Auto crop selected for country: ${selectedCountry}`)
    // Implement auto crop logic here
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">ID Photo Processor</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Your ID Photo</CardTitle>
          <CardDescription>Choose an image file to upload for processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            {uploadedImage ? (
              <div className="relative w-64 h-64">
                
              </div>
            ) : (
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                </div>
                <input id="photo-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Process Your ID Photo</CardTitle>
            <CardDescription>Choose how you want to crop and resize your ID photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleManualCrop} className="w-full">
              <Scissors className="mr-2 h-4 w-4" />
              Manually Crop and Resize
            </Button>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="country-select">Or select a country for auto-crop:</label>
              <Select onValueChange={setSelectedCountry}>
                <SelectTrigger id="country-select">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAutoCrop} disabled={!selectedCountry} className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              Auto Crop for Selected Country
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}


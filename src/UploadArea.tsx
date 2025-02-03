import React from "react";
import logo from "./icons/upload.png";

export function InputFile() {
  return (
    <div className="w-full max-w-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 rounded-lg text-center">
      
      <label
        htmlFor="file-upload"
        className="cursor-pointer text-gray-500 hover:text-gray-700 flex flex-col items-center"
      >
        <img src={logo} alt="Upload Logo" className="w-16 h-16 mb-4" />
        <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-400">PNG or JPG</p>
      </label>

      <input
        id="file-upload"
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        aria-label="File Upload"
      />
    </div>
  );
}
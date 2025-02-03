import UploadLogo from "../icons/upload.png";

export function UploadArea({ uploadedImage, onImageUpload }: { uploadedImage: string | null, onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="w-full max-w-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 rounded-lg text-center">
      {uploadedImage ? (
        <div className="relative flex flex-col items-center justify-center">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="items-center rounded-lg shadow-md max-w-full max-h-[300px]"
          />
          <button
            onClick={() => onImageUpload({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>)}
            className="items-center bg-red-500 text-white px-2 py-1 rounded mt-4"
          >
            Change Image
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="cursor-pointer text-gray-500 hover:text-gray-700 flex flex-col items-center"
        >
          <img src={UploadLogo} alt="Upload Logo" className="w-16 h-16 mb-4" />
          <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">PNG or JPG</p>

          <input
            id="file-upload"
            type="file"
            accept="image/png, image/jpeg"
            className="hidden"
            onChange={onImageUpload}
          />
        </label>
      )}
    </div>
  );
}
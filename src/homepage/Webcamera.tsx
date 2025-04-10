import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const Webcamera = ({ onCapture }: { onCapture: (image: string) => void }) => {
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isFaceCentered, setIsFaceCentered] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<string>("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  const checkFace = useCallback(async () => {
    if (!modelsLoaded || !webcamRef.current || !webcamRef.current.video) return;
    const video = webcamRef.current.video;

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });

    const detection = await faceapi.detectSingleFace(video, options);

    if (detection && detection.box) {
      setIsFaceDetected(true);

      const { x, width } = detection.box;
      const faceCenterX = x + width / 2;
      const videoWidth = video.videoWidth;
      const videoCenterX = videoWidth / 2;
      const thresholdX = videoWidth * 0.15;

      if (Math.abs(faceCenterX - videoCenterX) > thresholdX) {
        setOverlayMessage(faceCenterX < videoCenterX ? "Move Right" : "Move Left");
        setIsFaceCentered(false);
      } else {
        setOverlayMessage("");
        setIsFaceCentered(true);
      }
    } else {
      setIsFaceDetected(false);
      setIsFaceCentered(false);
      setOverlayMessage("No face detected");
    }
  }, [modelsLoaded]);

  useEffect(() => {
    detectionIntervalRef.current = setInterval(checkFace, 500);
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [checkFace]);

  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const base64Image = webcamRef.current.getScreenshot();
      if (base64Image && modelsLoaded && isFaceDetected && isFaceCentered) {
        const blob = base64ToBlob(base64Image);
        const blobUrl = URL.createObjectURL(blob);
        setCapturedImage(blobUrl);
      } else {
        alert("Please ensure your face is detected and centered before taking a photo.");
      }
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-3 text-xs"> Take photo </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture Your Photo</DialogTitle>
            <DialogDescription>
              Ensure your face is clearly visible, centered, and follows these guidelines:
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 space-y-2 text-sm text-muted-foreground">
            <ul className="list-disc list-inside">
              <li>Position your face in the center of the frame.</li>
              <li>Keep a neutral expression, with eyes open and mouth closed.</li>
              <li>Ensure even lighting with no harsh shadows.</li>
              <li>Avoid wearing hats, glasses, or accessories.</li>
            </ul>
            <div className="text-sm">
              {modelsLoaded
                ? isFaceDetected
                  ? isFaceCentered
                    ? "Face detected and centered."
                    : overlayMessage
                  : overlayMessage
                : "Loading face detection..."}
            </div>
          </div>

          <div className="relative">
            {webcamEnabled === false ? (
              <div className="text-destructive font-semibold">
                Camera access is blocked. Please enable it in your browser settings and refresh the page.
              </div>
            ) : capturedImage !== null ? (
              <div>
                <p className="font-semibold">Captured Image:</p>
                <img src={capturedImage} alt="Captured" className="mt-2 rounded-md border" />
              </div>
            ) : (
              <>
                <Webcam
                  ref={webcamRef}
                  mirrored={true}
                  onUserMediaError={() => setWebcamEnabled(false)}
                  screenshotFormat="image/png"
                  className={`w-full rounded-md
                    ${modelsLoaded
                      ? isFaceDetected
                        ? isFaceCentered
                          ? "border-4 border-green-500"
                          : "border-4 border-orange-500"
                        : "border-4 border-red-500"
                      : "border border-gray-300"
                    }`}
                />

                {/* Overlay Message */}
                {modelsLoaded && (!isFaceDetected || !isFaceCentered) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-xl font-bold">
                    {overlayMessage}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            {capturedImage === null ? (
              <Button disabled={!webcamEnabled} onClick={capturePhoto}>
                Capture Photo
              </Button>
            ) : (
              <div className="space-x-2">
                <Button disabled={!webcamEnabled} onClick={() => setCapturedImage(null)}>
                  Retake photo
                </Button>
                <Button disabled={!webcamEnabled} onClick={confirmImage}>
                  Done
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Webcamera;

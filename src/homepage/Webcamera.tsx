import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRef, useState } from "react"
import Webcam from "react-webcam"

const Webcamera = ({ onCapture }: { onCapture: (image: string) => void }) => {

    const [webcamEnabled, setWebcamEnabled] = useState(true);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);

    const capturePhoto = () => {
        if (webcamRef.current) {
            const base64Image = webcamRef.current.getScreenshot();
            if (base64Image) {
                // Convert Base64 to Blob URL
                const blob = base64ToBlob(base64Image);
                const blobUrl = URL.createObjectURL(blob);

                setCapturedImage(blobUrl); // Store the blob URL
            }
        }
    };

    const base64ToBlob = (base64: string) => {
        const byteString = atob(base64.split(",")[1]); // Remove the "data:image/png;base64," part
        const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: mimeString });
    };

    function confirmImage() {
        if (capturedImage) {
            onCapture(capturedImage)
        }
    }

    return (
        <div className="">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-3"> Take photo </Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Capture Your Photo
                        </DialogTitle>

                        <DialogDescription>
                            Ensure your face is clearly visible and follows these guidelines:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                        <ul className="list-disc list-inside">
                            <li>Position your face in the center of the frame.</li>
                            <li>Keep a neutral expression, with eyes open and mouth closed.</li>
                            <li>Ensure even lighting with no harsh shadows.</li>
                            <li>Avoid wearing hats, glasses, or accessories.</li>
                        </ul>
                    </div>

                    <div>
                        {webcamEnabled === false
                            ? (
                                <div className="text-destructive font-semibold">
                                    Camera access is blocked. Please enable it in your browser settings and refresh the page.
                                </div>
                            ) : (
                                capturedImage !== null
                                    ? (
                                        <div>
                                            <p className="font-semibold">Captured Image:</p>
                                            <img src={capturedImage} alt="Captured" className="mt-2 rounded-md border" />
                                        </div>
                                    ) : (
                                        <Webcam ref={webcamRef} mirrored={true} onUserMediaError={() => setWebcamEnabled(false)} className="" />
                                    )
                            )
                        }
                    </div>

                    <DialogFooter>
                        {capturedImage === null
                            ? (
                                <Button disabled={webcamEnabled === false} onClick={capturePhoto}> Capture Photo </Button>
                            ) : (
                                <div className="space-x-2">
                                    <Button disabled={webcamEnabled === false} onClick={() => setCapturedImage(null)}> Retake photo </Button>
                                    <Button disabled={webcamEnabled === false} onClick={confirmImage}> Done </Button>
                                </div>
                            )
                        }
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Webcamera

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import Webcam from "react-webcam"

const Webcamera = () => {

    const [webcamEnabled, setWebcamEnabled] = useState(true)

    return (
        <div className="">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-3 text-xs"> Take photo </Button>
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

                        {/* <Webcam mirrored={true} onUserMediaError={() => setWebcamEnabled(false)} className="" /> */}
                        {webcamEnabled === false
                            ?(
                                <div className="text-destructive font-semibold">
                                    Camera access is blocked. Please enable it in your browser settings and refresh the page.
                                </div>
                            ): (
                                <Webcam mirrored={true} onUserMediaError={() => setWebcamEnabled(false)} className="" />
                            )
                        }
                    </div>

                    <DialogFooter>
                        <Button disabled={webcamEnabled === false}> Capture Photo </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Webcamera

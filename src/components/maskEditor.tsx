import * as React from "react";
import { useState, useRef, useEffect } from "react";
import "./maskEditor.less";
import { hexToRgb, toMask } from "./utils";

export interface MaskEditorProps {
  src: string;
  maskSrc: string; // testing mask
  canvasRef?: React.MutableRefObject<HTMLCanvasElement>;
  strokeCanvasRef?: React.MutableRefObject<HTMLCanvasElement>;
  cursorSize?: number;
  onCursorSizeChange?: (size: number) => void;
  maskOpacity?: number;
  maskColor?: string;
  maskBlendMode?: "normal"|"multiply"|"screen"|"overlay"|"darken"|"lighten"|"color-dodge"|"color-burn"|"hard-light"|"soft-light"|"difference"|"exclusion"|"hue"|"saturation"|"color"|"luminosity"
}

export const MaskEditorDefaults = {
  cursorSize: 10,
  maskOpacity: .75,
  maskColor: "#000000",
  maskBlendMode: "normal",
}

export const MaskEditor: React.FC<MaskEditorProps> = (props: MaskEditorProps) => {
  const src = props.src;
  const maskSrc = props.maskSrc
  const cursorSize = props.cursorSize ?? MaskEditorDefaults.cursorSize;
  const maskColor = props.maskColor ?? MaskEditorDefaults.maskColor;
  const maskBlendMode = props.maskBlendMode ?? MaskEditorDefaults.maskBlendMode;
  const maskOpacity = props.maskOpacity ?? MaskEditorDefaults.maskOpacity;

  // (1)
  const canvas = React.useRef<HTMLCanvasElement|null>(null);
  const [context, setContext] = React.useState<CanvasRenderingContext2D|null>(null);

  // (2)
  const maskCanvas = React.useRef<HTMLCanvasElement|null>(null);
  const [maskContext, setMaskContext] = React.useState<CanvasRenderingContext2D|null>(null);

  // (3)
  const cursorCanvas = React.useRef<HTMLCanvasElement|null>(null);
  const [cursorContext, setCursorContext] = React.useState<CanvasRenderingContext2D|null>(null);

  // (4)
  const strokeMaskCanvas = React.useRef<HTMLCanvasElement | null>(null);
  const [strokeMaskContext, setStrokeMaskContext] = React.useState<CanvasRenderingContext2D | null>(null);

  const [size, setSize] = React.useState<{x: number, y: number}>({x: 256, y: 256})

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // (2b2) load maskContext with mask outline
  React.useLayoutEffect(() => {
    if (maskContext) {
      maskContext.fillStyle = "#000000"; // best non white (#ffffff) for toMask ("#fa7878" traces)
      maskContext.fillRect(0, 0, size.x, size.y);

      const img = new Image;
      img.src = maskSrc;

        img.onload = () => {
          maskContext.drawImage(img, 0, 0, size.x, size.y); // Draw image
    
          const imageData = maskContext.getImageData(0, 0, size.x, size.y);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];      // Red
            const g = data[i + 1];  // Green
            const b = data[i + 2];  // Blue
    
            if (r === 255 && g === 255 && b === 255) {
              // If pixel is white, make it transparent
              data[i + 3] = 0; // Set alpha to 0 (fully transparent)
            }
            // currently only creating black and transparent mask
            // if (r === 0 && g === 0 && b === 0) {
            //   // If pixel is black, turn it red
            //   data[i] = 255;     // Red
            //   data[i + 1] = 56;  // Green
            //   data[i + 2] = 56;  // Blue
            //   data[i + 3] = 255; // Keep full opacity
            // } else if (r === 255 && g === 255 && b === 255) {
            //   // If pixel is white, make it transparent
            //   data[i + 3] = 0; // Set alpha to 0 (fully transparent)
            // }
          }
    
          // Put modified image data back to canvas
          maskContext.putImageData(imageData, 0, 0);
      }
  }
}, [maskContext, strokeMaskContext, maskCanvas, size]); 

  // (1b) creates/stores context
  React.useLayoutEffect(() => {
    if (canvas.current && !context) {
      const ctx = (canvas.current as HTMLCanvasElement).getContext("2d");
      setContext(ctx);
    }
  }, [canvas]);

  // (1b2) set image on context as bg
  React.useEffect(() => {
    if (src && context) {
      const img = new Image;
      img.src = src;

      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      const adjustedHeight = 500;
      const adjustedWidth = Math.round(naturalWidth / (naturalHeight/adjustedHeight));

      img.height = adjustedHeight; 
      img.width = adjustedWidth; 

      setSize({x: adjustedWidth, y: adjustedHeight});

      img.onload = () => {
        context?.drawImage(img, 0, 0, adjustedWidth, adjustedHeight);
      }
      setIsLoaded(true);
    }
  }, [src, context]);

  // (2b) creates/stores maskContext
  React.useLayoutEffect(() => {
    if (maskCanvas.current && !context) {
      const ctx = (maskCanvas.current as HTMLCanvasElement).getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, size.x, size.y);
      }
      setMaskContext(ctx);
    }
  }, [maskCanvas]);

  // (4b) creates/stores strokeMaskContext
  React.useLayoutEffect(() => {
    if (strokeMaskCanvas.current && !context) {
      const ctx = strokeMaskCanvas.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "red"; // Full red background
        ctx.fillRect(0, 0, size.x, size.y);
      }
      setStrokeMaskContext(ctx);
    }
  }, [strokeMaskCanvas]);

  // (3) creates/sets cursorContext
  React.useLayoutEffect(() => {
    if (cursorCanvas.current && !context) {
      const ctx = (cursorCanvas.current as HTMLCanvasElement).getContext("2d");
      setCursorContext(ctx);
    }
  }, [cursorCanvas]);

  // >>> Loads mask canvas for export/use by parent
  React.useLayoutEffect(() => {
    if (props.canvasRef && maskCanvas.current) {
      props.canvasRef.current = maskCanvas.current;
    }
    if (props.strokeCanvasRef && strokeMaskCanvas.current) {
      props.strokeCanvasRef.current = strokeMaskCanvas.current
    } else {
      console.log("is there strokeMaskCanvas >>>", strokeMaskCanvas.current)
    }
  }, [maskCanvas, strokeMaskCanvas]);

  // Paints the maskContext which affects maskCanvas for returning, as well as strokeMaskCanvas and context
  React.useEffect(() => {
    const listener = (evt: MouseEvent) => {
      // for viewing the brush
      if (cursorContext) {
        cursorContext.clearRect(0, 0, size.x, size.y);

        cursorContext.beginPath();
        cursorContext.fillStyle = `${maskColor}88`;
        cursorContext.strokeStyle = maskColor;
        cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        cursorContext.fill();
        cursorContext.stroke();
      }

      let strokeColor = evt.shiftKey ? "#FFFF00" : "#800080"; // Yellow or Purple

      // for actually brushing (on the canvas)
      if (maskContext && strokeMaskContext && evt.buttons > 0) {
        //for immediate rendering
        maskContext.globalCompositeOperation = (evt.buttons > 1 || evt.shiftKey) 
        ? "source-over"  // Paint with color (mask)
        : "destination-out"; // Erase (make transparent)
        maskContext.beginPath();
        maskContext.fillStyle = (evt.buttons > 1 || evt.shiftKey) ? "#000000" : maskColor; // black colour or maskcolour
        maskContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        maskContext.fill();
        // Reset composite operation to normal after drawing
        maskContext.globalCompositeOperation = "source-over";

        // Draw stroke but don't render it (only store data)
        strokeMaskContext.beginPath();
        strokeMaskContext.fillStyle = strokeColor;
        strokeMaskContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        strokeMaskContext.fill();
      }
    };

    const scrollListener = (evt: WheelEvent) => {
      if (cursorContext) {
        props.onCursorSizeChange(Math.max(0, cursorSize + (evt.deltaY > 0 ? 1 : -1)));

        cursorContext.clearRect(0, 0, size.x, size.y);

        cursorContext.beginPath();
        cursorContext.fillStyle = `${maskColor}88`;
        cursorContext.strokeStyle = maskColor;
        cursorContext.arc(evt.offsetX, evt.offsetY, cursorSize, 0, 360);
        cursorContext.fill();
        cursorContext.stroke();

        evt.stopPropagation();
        evt.preventDefault();
      }
    }
    
    cursorCanvas.current?.addEventListener("mousemove", listener);
    if (props.onCursorSizeChange) {
      cursorCanvas.current?.addEventListener("wheel", scrollListener);
    }
    return () => {
      cursorCanvas.current?.removeEventListener("mousemove", listener);
      if (props.onCursorSizeChange) {
        cursorCanvas.current?.removeEventListener("wheel", scrollListener);
      }
    }
  }, [cursorContext, maskContext, strokeMaskContext, cursorCanvas, cursorSize, maskColor, size]);

  const replaceMaskColor = React.useCallback((hexColor: string, invert: boolean) => {
    const imageData = maskContext?.getImageData(0, 0, size.x, size.y);
    const color = hexToRgb(hexColor);

    if (imageData) {
      for (var i = 0; i < imageData?.data.length; i += 4) {
        const pixelColor = ((imageData.data[i] === 255) != invert) ? color : [255, 0, 0] ;
        imageData.data[i] = pixelColor[0];
        imageData.data[i + 1] = pixelColor[1];
        imageData.data[i + 2] = pixelColor[2];
        imageData.data[i + 3] = imageData.data[i + 3];
      }
      maskContext?.putImageData(imageData, 0, 0);
    }
  }, [maskContext]);

  React.useEffect(() => replaceMaskColor(maskColor, false), [maskColor]);

  return (
    <> 
    {isLoaded && 
    <div className="react-mask-editor-outer h-full mx-auto mb-2">
      <div
        className="react-mask-editor-inner mx-auto"
        style={{
          width: size.x,
          height: size.y,
        }}
      >

        {/* image */}
        <canvas
          ref={canvas}
          width={size.x}
          height={size.y}
          className="react-mask-editor-base-canvas"
        />

        {/* overlay mask - above image */}
        <canvas
          ref={maskCanvas}
          width={size.x}
          height={size.y}
          style={{
            width: size.x,
            height: size.y,
            opacity: maskOpacity,
            mixBlendMode: maskBlendMode as any,
          }}
          className="react-mask-editor-mask-canvas"
        />

        <canvas ref={strokeMaskCanvas} 
        width={size.x}
        height={size.y}
        style={{ visibility: "hidden" }} 
        />

        {/* brush mask - above white mask */}
        <canvas
          ref={cursorCanvas}
          width={size.x}
          height={size.y}
          style={{
            width: size.x,
            height: size.y,
          }}
          className="react-mask-editor-cursor-canvas"
        />

      </div>
  </div>}
  </>
  )
}
export const toMask = (canvas: any) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const size = {
    x: canvas.width,
    y: canvas.height,
  }
  console.log(size)
  const imageData = ctx?.getImageData(0, 0, size.x, size.y);
  const origData = Uint8ClampedArray.from(imageData.data);

  if (imageData) {
    for (var i = 0; i < imageData?.data.length; i += 4) {
      const pixelColor = (imageData.data[i] === 255) ? [0, 0, 0] : [255, 255, 255];
      imageData.data[i] = pixelColor[0];
      imageData.data[i + 1] = pixelColor[1];
      imageData.data[i + 2] = pixelColor[2];
      imageData.data[i + 3] = 255;
    }
    ctx?.putImageData(imageData, 0, 0);
  }

  const dataUrl = canvas.toDataURL();
  for (var i = 0; i < imageData?.data.length; i++) {
    imageData.data[i] = origData[i];
  }
  ctx.putImageData(imageData, 0, 0);

  return dataUrl;
}

// Should only be called once as it mutably changes mask itself
export const toStrokeMask = (canvas: any) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  console.log(canvas.toDataURL())

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];      // Red channel
    const g = data[i + 1];  // Green channel
    const b = data[i + 2];  // Blue channel

    // Convert Yellow (255, 255, 0) strokes to Black (0,0,0)
    if (r === 255 && g === 255 && b === 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
    // Convert Purple (128, 0, 128) strokes to White (255,255,255)
    else if (r === 128 && g === 0 && b === 128) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    } else {
      data[i] = 255;  // Red
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
};

export const hexToRgb = (color: string) => {
  var parts = color.replace("#", "").match(/.{1,2}/g);
  return parts.map(part => parseInt(part, 16));
}
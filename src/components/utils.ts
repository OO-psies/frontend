export const toMask = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  const size = {
    x: canvas.width,
    y: canvas.height,
  }
  console.log(size)
  const imageData = ctx?.getImageData(0, 0, size.x, size.y);
  const origData = Uint8ClampedArray.from(imageData.data);

  // the commented out chunk here only works when the maskcontext was set to ffffff
  // if (imageData) {
  //   for (var i = 0; i < imageData.data.length; i += 4) {
  //     const isBlack =
  //       imageData.data[i] === 0 &&
  //       imageData.data[i + 1] === 0 &&
  //       imageData.data[i + 2] === 0;

  //     const pixelColor = isBlack ? [0, 0, 0] : [255, 255, 255];

  //     imageData.data[i] = pixelColor[0];     // Red
  //     imageData.data[i + 1] = pixelColor[1]; // Green
  //     imageData.data[i + 2] = pixelColor[2]; // Blue
  //     imageData.data[i + 3] = 255;           // Alpha (fully opaque)
  //   }
  //   ctx?.putImageData(imageData, 0, 0);
  // }

   // this chunk also only works when the maskcontext was set to ffffff, but the bw image output is inversed
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

export const hexToRgb = (color: string) => {
  var parts = color.replace("#", "").match(/.{1,2}/g);
  return parts.map(part => parseInt(part, 16));
}
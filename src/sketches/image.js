import React from 'react'

const Sketch = typeof window !== `undefined` ? require("react-p5") : null

const ImageSketch = () => {
  let masks = {
    identity: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    edge: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
    sharp: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    gaussianblur5x5: [
      [1 / 256, 4 / 256, 6 / 256, 4 / 256, 1 / 256],
      [4 / 256, 16 / 256, 24 / 256, 16 / 256, 4 / 256],
      [6 / 256, 24 / 256, 36 / 256, 24 / 256, 6 / 256],
      [4 / 256, 16 / 256, 24 / 256, 16 / 256, 4 / 256],
      [1 / 256, 4 / 256, 6 / 256, 4 / 256, 1 / 256],
    ],
  }

  let kernel = masks.edge
  let img,dest

  const preload = p => {
    img = p.loadImage(
      "https://4.bp.blogspot.com/-mLOwpEsNL4Y/UCu0wcVsPBI/AAAAAAAAA6s/7ECKTpxXr3o/s1600/lena.bmp"
    )
  }

  const setup = (p, canvasParentRef) => {
    p.createCanvas(img.width * 2, img.height, p.WEBGL).parent(canvasParentRef)
    console.log(p.drawingContext)
    p.pixelDensity(1)
    dest = p.createImage(img.width, img.height)
    apply(p)
  }

  const apply = p => {
    dest.loadPixels()
    img.loadPixels()
    for (let x = 0; x < dest.width; x++) {
      for (let y = 0; y < dest.height; y++) {
        let result = convolution(p, img, x, y, kernel, kernel.length)
        let index = (x + y * dest.width) * 4
        dest.pixels[index + 0] = result[0]
        dest.pixels[index + 1] = result[1]
        dest.pixels[index + 2] = result[2]
        dest.pixels[index + 3] = 255
      }
    }
    dest.updatePixels()
  }

  const convolution = (p, img, x, y, kernel, ksize) => {
    let accumulator = [0.0, 0.0, 0.0]
    let offset = p.floor(ksize / 2)
    for (let i = 0; i < ksize; i++) {
      for (let j = 0; j < ksize; j++) {
        let xpos = x + i - offset
        let ypos = y + j - offset
        let index = (xpos + img.width * ypos) * 4
        index = p.constrain(index, 0, img.pixels.length - 1)

        accumulator[0] += img.pixels[index + 0] * kernel[i][j]
        accumulator[1] += img.pixels[index + 1] * kernel[i][j]
        accumulator[2] += img.pixels[index + 2] * kernel[i][j]
      }
    }
    return accumulator
  }

  const grayScale = p => {
    dest.loadPixels()
    img.loadPixels()
    for (var y = 0; y < dest.height; y++) {
      for (var x = 0; x < dest.width; x++) {
        var index = (x + y * dest.width) * 4
        var r = img.pixels[index + 0]
        var g = img.pixels[index + 1]
        var b = img.pixels[index + 2]
        // var a = img.pixels[index + 3]

        var bw = (r + g + b) / 3

        dest.pixels[index + 0] = bw
        dest.pixels[index + 1] = bw
        dest.pixels[index + 2] = bw
      }
    }

    dest.updatePixels()
  }

  const grayScaleLuma601 = p => {
    dest.loadPixels()
    img.loadPixels()
    for (var y = 0; y < dest.height; y++) {
      for (var x = 0; x < dest.width; x++) {
        var index = (x + y * dest.width) * 4
        var r = img.pixels[index + 0]
        var g = img.pixels[index + 1]
        var b = img.pixels[index + 2]
        // var a = img.pixels[index + 3]

        var bw = r * 0.299 + g * 0.587 + b * 0.0114

        dest.pixels[index + 0] = bw
        dest.pixels[index + 1] = bw
        dest.pixels[index + 2] = bw
      }
    }

    dest.updatePixels()
  }

  const grayScaleLuma709 = p => {
    dest.loadPixels()
    img.loadPixels()
    for (var y = 0; y < dest.height; y++) {
      for (var x = 0; x < dest.width; x++) {
        var index = (x + y * dest.width) * 4
        var r = img.pixels[index + 0]
        var g = img.pixels[index + 1]
        var b = img.pixels[index + 2]
        // var a = img.pixels[index + 3]

        var bw = r * 0.2126 + g * 0.7152 + b * 0.0722

        dest.pixels[index + 0] = bw
        dest.pixels[index + 1] = bw
        dest.pixels[index + 2] = bw
      }
    }

    dest.updatePixels()
  }

  const draw = p => {
    p.image(img, 0, 0)
    p.image(dest, img.width + 1, 0)
  }

  const keyTyped = p => {
    let key = p.key

    // identity
    if (key === "i") {
      kernel = masks.identity
      apply(p)
    }

    // blur
    if (key === "b") {
      kernel = masks.gaussianblur5x5
      apply(p)
    }

    // edge
    if (key === "e") {
      kernel = masks.edge
      apply(p)
    }

    //sharp
    if (key === "s") {
      kernel = masks.sharp
      apply(p)
    }

    if (key === "g") {
      grayScale(p)
    }
    if (key === "h") {
      grayScaleLuma601(p)
    }
    if (key === "j") {
      grayScaleLuma709(p)
    }
  }

  return <Sketch preload={preload} setup={setup} draw={draw} keyTyped={keyTyped} />
}

export default ImageSketch
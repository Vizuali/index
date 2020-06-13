const React = require("react")
const { Component } = React
const Sketch = typeof window !== `undefined` ? require("react-p5") : null

class ImageSketch extends Component {
  cnv = null
  options =
    " .`-_':,;^=+/\"|)\\<>)iv%xclrs{*}I?!][1taeo7zjLunT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@KHDBWNMR0Q"
  gui = null
  btn = null
  livebtn = null
  live = true
  capture = null
  pg = null
  img = null


  masks = {
    identity: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    edge: [
      [-1, 0, 1],
      [0, 0, 0],
      [1, 0, -1],
    ],
    edge1: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ],
    edge2: [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0],
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

  kernel = this.masks.edge
  dest = null

  preload = p5 => {
    this.img = p5.loadImage(
      "https://4.bp.blogspot.com/-mLOwpEsNL4Y/UCu0wcVsPBI/AAAAAAAAA6s/7ECKTpxXr3o/s1600/lena.bmp"
    )
  }

  setup = (p5, canvasParentRef) => {
    this.cvn = p5
      .createCanvas(this.img.width * 2, this.img.height)
      .parent(canvasParentRef)
    p5.pixelDensity(1)
    this.dest = p5.createImage(this.img.width, this.img.height)
    this.apply(p5)

  }

  apply = p => {
    this.dest.loadPixels()
    this.img.loadPixels()
    // console.log(this.kernel.length)
    for (let x = 0; x < this.dest.width; x++) {
      for (let y = 0; y < this.dest.height; y++) {
        let result = this.convolution(
          p,
          this.img,
          x,
          y,
          this.kernel,
          this.kernel.length
        )
        let index = (x + y * this.dest.width) * 4
        // console.log(result)
        this.dest.pixels[index + 0] = result[0]
        this.dest.pixels[index + 1] = result[1]
        this.dest.pixels[index + 2] = result[2]
        this.dest.pixels[index + 3] = 255
      }
    }
    this.dest.updatePixels()
  }

  convolution = (p, img, x, y, kernel, ksize) => {
    let accumulator = [0.0, 0.0, 0.0]
    let offset = p.floor(ksize / 2)
    // console.log(offset)

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

  grayScale = (p) => {
    this.dest.loadPixels()
    this.img.loadPixels()
    var maxRange = 256
    var histogram = new Array(maxRange);
    /*for (var i = 0; i <= maxRange; i++) {
      histogram[i] = 0
    }*/
    for (var y = 0; y < this.dest.height; y++) {
      for (var x = 0; x < this.dest.width; x++) {
        var index = (x + y * this.dest.width) * 4;
        var r = this.img.pixels[index + 0];
        var g = this.img.pixels[index + 1];
        var b = this.img.pixels[index + 2];
        var a = this.img.pixels[index + 3];
        /*var bright = p.brightness(p.get(y,x))
        
        histogram[bright]++;*/
        var bw = (r + g + b) / 3;

        this.dest.pixels[index + 0] = bw;
        this.dest.pixels[index + 1] = bw;
        this.dest.pixels[index + 2] = bw;
      }
    }
    /*var histMax = p.max(histogram);
    p.stroke(255);

    for (var i = 0; i < this.img.width; i += 2) {
      // Map i (from 0..img.width) to a location in the histogram (0..255)
      var which = p.map(i, 0, this.img.width, 0, 255);
      // Convert the histogram value to a location between 
      // the bottom and the top of the picture
      var y = p.map(histogram[which], 0, histMax, this.img.height, 0);
      p.line(i, this.img.height, i, y);
    }*/


    this.dest.updatePixels()
  }
  grayScaleLuma601 = (p) => {
    this.dest.loadPixels()
    this.img.loadPixels()
    for (var y = 0; y < this.dest.height; y++) {
      for (var x = 0; x < this.dest.width; x++) {
        var index = (x + y * this.dest.width) * 4;
        var r = this.img.pixels[index + 0];
        var g = this.img.pixels[index + 1];
        var b = this.img.pixels[index + 2];
        var a = this.img.pixels[index + 3];

        var bw = r *.299 + g *.587 + b *.0114;

        this.dest.pixels[index + 0] = bw;
        this.dest.pixels[index + 1] = bw;
        this.dest.pixels[index + 2] = bw;
      }
    }

    this.dest.updatePixels()
  }

  grayScaleLuma709 = (p) => {
    this.dest.loadPixels()
    this.img.loadPixels()
    for (var y = 0; y < this.dest.height; y++) {
      for (var x = 0; x < this.dest.width; x++) {
        var index = (x + y * this.dest.width) * 4;
        var r = this.img.pixels[index + 0];
        var g = this.img.pixels[index + 1];
        var b = this.img.pixels[index + 2];
        var a = this.img.pixels[index + 3];

        var bw = r *.2126 + g *.7152 + b *.0722;

        this.dest.pixels[index + 0] = bw;
        this.dest.pixels[index + 1] = bw;
        this.dest.pixels[index + 2] = bw;
      }
    }

    this.dest.updatePixels()
  }
  histogram
  draw = p5 => {
    p5.image(this.img, 0, 0)
    p5.image(this.dest, this.img.width + 1, 0)
  }

  keyTyped = p5 => {
    let key = p5.key

    // identity
    if (key === 'i') {
      this.kernel = this.masks.identity
      this.apply(p5)
    }

    // blur
    if (key === 'b') {
      this.kernel = this.masks.gaussianblur5x5
      this.apply(p5)
    }

    // edge
    if (key === 'e') {
      this.kernel = this.masks.edge
      this.apply(p5)
    }
    if (key === 'r') {
      this.kernel = this.masks.edge1
      this.apply(p5)
    }
    if (key === 't') {
      this.kernel = this.masks.edge2
      this.apply(p5)
    }

    //sharp
    if (key === 's') {
      this.kernel = this.masks.sharp
      this.apply(p5)
    }

    if (key === 'g') {
      this.grayScale(p5)
    }
    if (key === 'h') {
      this.grayScaleLuma601(p5)
    }
    if (key === 'j') {
      this.grayScaleLuma709(p5)
    }



  }

  render() {
    return <Sketch preload={this.preload} setup={this.setup} draw={this.draw} keyTyped={this.keyTyped} />
  }
}

export default ImageSketch;
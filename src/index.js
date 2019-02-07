/**
 * Turns a canvas element into an interactive draggable 3d image viewer
 * @param {Array<String>} imageSources array of image urls to load 
 * @param {HTMLCanvasElement} canvas canvas element to control
 * @param {Boolean} demo whether to do a spin demo when the images load
 */
function CanvasSpinner(imageSources, canvas, demo = false) {
  this.imgSrcs = imageSources
  this.canvas = canvas
  this.imgs = []
  this.loaded = false
  this.currentFrame = 0
  this.clicked = false
  this.doDemo = demo
  Object.defineProperties(this, {
    'currentImg': {
      get: function () {
        return this.imgs[this.currentFrame]
      }
    },
    'totalFrames': {
      get: function () {
        return this.imgs.length
      }
    },
    'canvasContext': {
      get: function () {
        return this.canvas.getContext('2d')
      }
    }
  })
  // catches mouse events and calls necessary functions
  this.canvas.addEventListener("mousedown", e => { this.clicked = true }, false)
  this.canvas.addEventListener("mousemove", e => { this.handleMouseMove(e) }, false)
  this.canvas.addEventListener("mouseup", e => { this.clicked = false })
  this.loadImages()
}
/**
 * Handle promises to load the images
 */
CanvasSpinner.prototype.loadImages = function () {
  Promise.all(this.imgSrcs.map(getImg))
    .then(imgs => this.setImgsAfterLoad(imgs))
}
/**
 * @param {Array<ImageBitmap>} imgs array of processed image bitmaps
 */
CanvasSpinner.prototype.setImgsAfterLoad = function (imgs) {
  this.imgs = imgs
  this.loaded = true
  // fit the canvas
  this.canvas.height = imgs[0].height
  this.canvas.width = imgs[0].width
  if (this.doDemo) {
    this.demo()
  } else {
    this.update(0)
  }
}
/**
 * increments or decrements the drawn image and updates it on the canvas
 * @param {Number} direction direction to update image, -1 if left, 1 if right, 0 just updates the current image
 */
CanvasSpinner.prototype.update = function (direction) {
  if (this.loaded) {
    this.currentFrame += direction
    if (this.currentFrame < 0) {
      this.currentFrame = this.totalFrames - 1
    } else if (this.currentFrame > this.totalFrames - 1) {
      this.currentFrame = 0
    }

    this.canvasContext.drawImage(this.currentImg, 0, 0)
  }
}
/**
 * event handler for mousemove, gets X direction of movement then calls update with direction
 * @param {Event} event event from mousemove
 */
CanvasSpinner.prototype.handleMouseMove = function (event) {
  if (this.loaded && this.clicked) {
    let tracker = event.movementX
    if (tracker > 0) {
      this.update(1)
    } else if (tracker < 0) {
      this.update(-1)
    }
  }
}
/**
 * initializes the canvas and iterates through the images
 */
CanvasSpinner.prototype.demo = function () {
  if (this.loaded) {
    this.update(0)
    let rotationInterval = setInterval(() => {
      if (this.currentFrame === this.totalFrames - 1) {
        clearInterval(rotationInterval)
      }
      this.update(1)
    }, 25)
  }
}
/**
 * asynchronously loads an image
 * @param {String} url url of image to load
 * @return {Promise<ImageBitmap>} Promise that resolves to image ready for use
 */
async function getImg(url) {
  let res = await fetch(url)
  let blob = await res.blob()
  return createImageBitmap(blob)
}
export { CanvasSpinner, CanvasSpinner as default }
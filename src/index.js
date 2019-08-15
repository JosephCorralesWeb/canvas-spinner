class CanvasSpinner {
  constructor (frames, el) {
    this.frames = frames
    this.framesCount = this.frames.length
    this.el = el
    this.canvasContext = this.el.getContext('2d')
    this.loaded = false
    this.currentFrame = 0
    this.currentImg = this.frames[this.currentFrame]
    this.clilcked = false
    this.lastTouchX = null
    this.build()
    this.imgBmpPolyfill()
  }

  // User Interactions
  registerEventListeners () {
    this.el.addEventListener("mousedown", e => {
      this.clicked = true
    }, false)
    document.addEventListener("mousemove", e => { this.handleMouseMove(e) }, false)
    document.addEventListener("mouseup", e => {
      if (this.clicked) {
        this.clicked = false
      }
    })
    // touch handling
    this.el.addEventListener("touchstart", e => {
      e.preventDefault()
      this.clicked = true
      this.lastTouchX = e.changedTouches[0].screenX
    }, false)
    this.el.addEventListener("touchmove", e => {
      e.preventDefault()
      this.handleTouchMove(e)
    }, false)
    this.el.addEventListener("touchend", e => {
      e.preventDefault();
      this.clicked = false
      this.lastTouchX = null
    }, false)
  }

  build () {
    // All user even listeners
    this.registerEventListeners()
    // Render images onto canvas
    this.loadImages()
  }

  /**
   * Fetch images files from urls
   *
   * @returns {Promise<Promise<unknown[]>>}
   */
  async loadImages () {
    return Promise.all(this.frames.map(this.bitmapFromUrl))
      .then(frames => this.setImgsAfterLoad(frames))
  }

  /**
   * asynchronously loads an image
   * @param {String} url url of image to load
   * @return {Promise<ImageBitmap>} Promise that resolves to image ready for use
   */
  async bitmapFromUrl (url) {
    let loadingImg = true
    let bitmap, res, blob
    while (loadingImg) {
      res = await fetch(url)
      blob = await res.blob()
      try {
        bitmap = await createImageBitmap(blob)
        loadingImg = false
      } catch (e) {
        console.error('error generating bitmap', url, ' trying again...')
      }
    }
    return bitmap
  }

  setImgsAfterLoad (frames) {
    this.frames = frames
    this.loaded = true
    // fit the canvas
    this.el.height = frames[0].height
    this.el.width = frames[0].width
    if (this.doDemo) {
      this.demo()
    } else {
      this.update(0)
    }
  }

  update (direction) {
    if (this.loaded) {
      this.currentFrame += direction
      if (this.currentFrame < 0) {
        this.currentFrame = this.framesCount + this.currentFrame
      } else if (this.currentFrame > this.framesCount - 1) {
        this.currentFrame = this.currentFrame - this.framesCount
      }
      this.canvasContext.drawImage(this.frames[this.currentFrame], 0, 0)
    }
  }

  handleTouchMove (e) {
    console.log('here')
    if (this.loaded) {
      this.currentFrame += direction
      if (this.currentFrame < 0) {
        this.currentFrame = this.framesCount + this.currentFrame
      } else if (this.currentFrame > this.framesCount - 1) {
        this.currentFrame = this.currentFrame - this.framesCount
      }
      this.canvasContext.drawImage(this.currentFrame, 0, 0)
    }
  }

  handleMouseMove (e) {
    if (this.loaded && this.clicked) {
      let tracker = event.movementX
      if (tracker > 0) {
        this.update(1)
      } else if (tracker < 0) {
        this.update(-1)
      }
    }
  }

  imgBmpPolyfill () {
    /* Safari and Edge polyfill for createImageBitmap
     * https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap
     */
    if (!('createImageBitmap' in window)) {
      window.createImageBitmap = async function (blob) {
        return new Promise(resolve => {
          let img = document.createElement('img')
          img.addEventListener('load', function () {
            resolve(this)
          })
          img.src = URL.createObjectURL(blob)
        })
      }
    }
  }
}

export { CanvasSpinner as default }

import View from './view'
import STYLES from './constants'
import { isExact, isAuto, isWX } from './utils'
import { getImage } from './weapp-adapter'

export default class $Image extends View {

  init() {
    super.init()
    this._imageInfo = {
      width: 0,
      height: 0,
      contentWidth: 0,
      contentHeight: 0
    }
    this._image = null
    this._loadImage()
  }

  _loadImage() {
    return new Promise((resolve, reject) => {
      loadImage(this.options.attrs.src, this.getLayer().getCanvas())
        .then(({ info, image }) => {
          this._imageInfo = info
          this._image = image
          resolve()

          this._layoutImage()

          // 重新布局绘制
          this.getLayer().reflow()
          this.getLayer().repaint()
        })
    })
  }

  _drawContent() {
    if (!this._image) return
    const { contentWidth, contentHeight } = this.renderStyles
    this.getCtx().drawImage(this._image, this.contentX, this.contentY, contentWidth, contentHeight)
  }

  _layoutImage() {
    const { contentWidth, contentHeight } = this.renderStyles
    let { width, height } = this.styles
    // 根据用户设置判断图片宽高，目前支持widthfix、heightfix、平铺
    if (!isAuto(width) && isAuto(height)) {
      width = contentWidth
      height = getHeightByWidth(width, this._imageInfo.width, this._imageInfo.height)
    } else if (!isAuto(height) && isAuto(width)) {
      height = contentHeight
      width = getWidthByHeight(height, this._imageInfo.width, this._imageInfo.height)
    } else if (isAuto(width) && isAuto(height)) {
      width = this._imageInfo.width
      height = this._imageInfo.height
    } else {
      width = contentWidth
      height = contentHeight
    }
    this.renderStyles.contentWidth = width
    this.renderStyles.contentHeight = height
    this._calcLayoutWithContent()
  }


}

// canvas可能为空，小程序下必传
function loadImage(src, canvas) {

  return new Promise((resolve, reject) => {
    let image = null

    if (isWX()) {
      image = canvas.createImage()
    } else {
      image = new Image()
    }

    image.src = src
    image.onload = function (e) {
      resolve({
        image,
        info: {
          width: e.target.width,
          height: e.target.height
        }
      })
    }

  })
}

function getWidthByHeight(height, originWidth, originHeight) {
  return height / originHeight * originWidth
}

function getHeightByWidth(width, originWidth, originHeight) {
  return width / originWidth * originHeight
}
import type { CloudinaryConfig } from './types'

export class Cloudinary {
  config: CloudinaryConfig

  constructor(config: CloudinaryConfig) {
    if (!config.cloudName) throw new Error('Cloud name is required')
    this.config = { secure: true, ...config }
  }

  getBaseUrl() {
    const protocol = this.config.secure ? 'https' : 'http'
    return `${protocol}://api.cloudinary.com/v1_1/${this.config.cloudName}`
  }
}

import { Cloudinary } from './cloudinary'
import type { UploadOptions, CloudinaryResource } from './types'

export class CloudinaryUploader {
  constructor(private cloudinary: Cloudinary) { }

  async upload(file: File, options: UploadOptions = {}): Promise<CloudinaryResource> {
    const form = new FormData()
    form.append('file', file)
    if (this.cloudinary.config.uploadPreset)
      form.append('upload_preset', this.cloudinary.config.uploadPreset)
    if (options.folder) form.append('folder', options.folder)
    if (options.publicId) form.append('public_id', options.publicId)

    const res = await fetch(`${this.cloudinary.getBaseUrl()}/image/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  }
}

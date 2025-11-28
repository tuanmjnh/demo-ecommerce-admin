import { Cloudinary } from './cloudinary'
import type { CloudinaryResource } from './types'

export class CloudinaryFetcher {
  constructor(private cloudinary: Cloudinary) { }

  async listResources(type: 'image' | 'video' = 'image'): Promise<CloudinaryResource[]> {
    const res = await fetch(
      `${this.cloudinary.getBaseUrl()}/resources/${type}?max_results=50`,
      { headers: { Authorization: `Basic ${btoa(this.cloudinary.config.apiKey + ':' + this.cloudinary.config.apiSecret)}` } }
    )
    if (!res.ok) throw new Error('Fetch failed')
    const data = await res.json()
    return data.resources
  }
}

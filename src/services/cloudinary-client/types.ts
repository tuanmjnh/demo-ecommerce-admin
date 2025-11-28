export interface CloudinaryConfig {
  cloudName: string
  apiKey?: string
  apiSecret?: string
  uploadPreset?: string
  secure?: boolean
}

export interface UploadOptions {
  folder?: string
  tags?: string[]
  publicId?: string
  resourceType?: 'image' | 'video' | 'raw'
  onProgress?: (percent: number) => void
}

export interface CloudinaryResource {
  public_id: string
  format: string
  secure_url: string
  resource_type: string
  bytes: number
  created_at: string
}

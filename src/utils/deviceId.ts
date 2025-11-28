import FingerprintJS from '@fingerprintjs/fingerprintjs'

// async function để tạo deviceId
export async function getDeviceId() {
  const fp = await FingerprintJS.load()
  const result = await fp.get()
  return result.visitorId // đây chính là deviceId duy nhất
}

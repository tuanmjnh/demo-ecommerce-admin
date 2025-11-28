/**
* syncToServer: gửi mảng items lên server.
* Trả về true nếu thành công, false nếu có lỗi (để đẩy lại vào queue)
*
* Lưu ý:
* - Ở ví dụ này ta mô phỏng fetch
* - Ở production, bạn nên gửi batch, xử lý trả về lỗi từng item, retry/backoff,
* conflict resolution, authentication, v.v.
*/

export async function syncToServer(items: any[]): Promise<boolean> {
  try {
    // Demo: giả lập request lên server
    // Thay bằng fetch('https://api.yourserver.com/batch', ...)

    // Nếu muốn thử thất bại, đặt Math.random() < 0.3 để throw
    await fakeNetworkRequest(items)
    return true
  } catch (err) {
    console.error('syncToServer error', err)
    return false
  }
}

function fakeNetworkRequest(items: any[]) {
  return new Promise((resolve, reject) => {
    // giả lập latency
    setTimeout(() => {
      // giả lập success/fail tùy thời điểm
      if (Math.random() < 0.95) {
        resolve(true)
      } else {
        reject(new Error('Simulated network/server failure'))
      }
    }, 500)
  })
}

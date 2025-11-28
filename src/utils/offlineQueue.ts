const KEY = 'offline_pending_queue_v1'

export function savePending(queue: any[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('savePending failed', err)
  }
}


export function loadPending(): any[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('loadPending failed', err)
    return []
  }
}


export function clearPending() {
  try {
    localStorage.removeItem(KEY)
  } catch (err) {
    console.error('clearPending failed', err)
  }
}

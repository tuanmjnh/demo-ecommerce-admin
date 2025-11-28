import { savePending, loadPending, clearPending } from '../utils/offlineQueue'
import { syncToServer } from '../utils/syncService'


export const useDataOfflineSyncStore = defineStore('dataOfflineSyncStore', () => {
  // local in-memory items (represent UI state)
  const items = ref<any[]>([])
  const pendingQueue = ref<any[]>(loadPending() || [])


  // nếu có pending từ trước, ta giữ ở pendingQueue
  // watch mạng thay đổi -> nếu online thì sync
  // watch(() => systemStore.isOnline, async (online) => {
  //   if (online && pendingQueue.value.length > 0) {
  //     try {
  //       const result = await syncToServer(pendingQueue.value)
  //       if (result) {
  //         // giả định server trả về id cho từng item -> ta merge về items
  //         pendingQueue.value.forEach((p: any) => {
  //           items.value.push({ ...p, _id: generateId() })
  //         })
  //         pendingQueue.value = []
  //         clearPending()
  //       }
  //     } catch (err) {
  //       console.error('Auto-sync failed', err)
  //     }
  //   }
  // })


  function addItem(payload: any) {
    // push UI ngay
    items.value.push(payload)


    // if (systemStore.isOnline) {
    //   // gửi thẳng
    //   syncToServer([payload]).then((ok) => {
    //     if (!ok) {
    //       // nếu lỗi, đưa vào pending
    //       pendingQueue.value.push(payload)
    //       savePending(pendingQueue.value)
    //     }
    //   }).catch(() => {
    //     pendingQueue.value.push(payload)
    //     savePending(pendingQueue.value)
    //   })
    // } else {
    //   // offline -> lưu queue
    //   pendingQueue.value.push(payload)
    //   savePending(pendingQueue.value)
    // }
  }


  return { items, addItem, pendingQueue }
})


function generateId() {
  return 'id_' + Math.random().toString(36).slice(2, 9)
}

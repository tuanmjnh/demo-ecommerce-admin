<script setup lang="ts">
interface Task {
  id: string
  name: string
  progress: number
  done: boolean,
  meta?: any
}

const tasks = ref<Task[]>([])
const logs = ref<{ id: number; text: string }[]>([])
let logId = 0

const log = (text: string) => {
  logs.value.unshift({ id: logId++, text })
  if (logs.value.length > 20) logs.value.pop()
}

function initManager() {
  window.electron.modules.taskManager.invoke.initTaskManager({ threads: 1, speed: 200 })
}

function addTasks() {
  const sample = [
    { id: 'a', name: 'Download Video A' },
    { id: 'b', name: 'Download Video B' },
    { id: 'c', name: 'Download Video C' },
    { id: 'd', name: 'Download Video D' },
  ]
  window.electron.modules.taskManager.invoke.addTasks(sample)
  tasks.value = sample.map(t => ({ ...t, progress: 0, done: false, meta: { text: 'abc' } }))
}

function startTasks() {
  window.electron.modules.taskManager.invoke.startTasks()
}

function stopTasks() {
  window.electron.modules.taskManager.invoke.stopTasks()
}

onMounted(() => {
  window.electron.modules.taskManager.on.managerInitialized(res => log(`Manager initialized: ${JSON.stringify(res)}`))
  window.electron.modules.taskManager.on.tasksAdded(res => log(`Tasks added: ${res.total}`))
  window.electron.modules.taskManager.on.progress(res => {
    const task = tasks.value.find(t => t.id === res.id)
    if (task) {
      task.progress = res.progress
      task.done = res.done
    }
  })
  window.electron.modules.taskManager.on.allTasksDone(() => log('✅ All tasks done!'))
  window.electron.modules.taskManager.on.stoppedTasks(() => log('🛑 Tasks stopped.'))
})

onBeforeUnmount(() => {
  window.electron.modules.taskManager.on.removeListenersManagerInitialized()
  window.electron.modules.taskManager.on.removeListenersTasksAdded()
  window.electron.modules.taskManager.on.removeListenersProgress()
  window.electron.modules.taskManager.on.removeListenersAllTasksDone()
  window.electron.modules.taskManager.on.removeListenersStoppedTasks()
})
</script>
<template>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Example Task Manager Demo</h2>

    <div class="flex flex-wrap gap-2">
      <button @click="initManager" class="px-3 py-2 bg-blue-600 text-white rounded-md">Init Manager</button>
      <button @click="addTasks" class="px-3 py-2 bg-green-600 text-white rounded-md">Add Tasks</button>
      <button @click="startTasks" class="px-3 py-2 bg-yellow-600 text-white rounded-md">Start</button>
      <button @click="stopTasks" class="px-3 py-2 bg-red-600 text-white rounded-md">Stop</button>
    </div>

    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-2">Tasks</h3>
      <div v-if="tasks.length === 0" class="text-gray-500 italic">No tasks yet</div>

      <div v-for="task in tasks" :key="task.id" class="p-3 border rounded-lg shadow-sm mb-2">
        <div class="flex justify-between mb-1">
          <span class="font-medium">{{ task.name }}</span>
          <span class="text-sm text-gray-600">{{ task.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 h-2 rounded overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-200" :style="{ width: task.progress + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="mt-6 border-t pt-3 text-sm text-gray-700">
      <p v-for="log in logs" :key="log.id" class="font-mono text-xs">{{ log.text }}</p>
    </div>
  </div>
</template>

<style scoped>
button {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

button:active {
  transform: scale(0.95);
}
</style>

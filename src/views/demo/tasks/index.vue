<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { TaskPool } from 'tm-libs/tasks'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

interface ITick {
  id: any
  threadId: number
  taskId: number
  value: number
  done: boolean
}

const formOption = reactive({
  thread: 2,
  task: 10,
  speed: 100,
  tasks: [] as number[],
})

const isProcess = ref(0)
const isPaused = ref(false)
const ticks = ref<ITick[]>([])
const taskWorking = new TaskPool()

const onTick = (threadId: number, taskId: number, speed = 1000) => {
  return new Promise((resolve) => {
    // 👇 tạo reactive tick để Vue theo dõi thay đổi
    const tick = reactive<ITick>({
      id: null,
      threadId,
      taskId,
      value: 0,
      done: false,
    })
    ticks.value.push(tick)

    tick.id = setInterval(async () => {
      if (!taskWorking.isPausedState()) {
        tick.value += 1
        await nextTick() // 👈 giúp Vue cập nhật giao diện tức thì
      }

      if (!taskWorking.isRunning()) {
        clearInterval(tick.id)
      }

      if (tick.value >= 100) {
        clearInterval(tick.id)
        tick.done = true
        resolve(tick)
      }
    }, speed)
  })
}

const onTaskRun = async () => {
  try {
    isProcess.value = 1
    isPaused.value = false
    ticks.value = []

    formOption.tasks = Array.from({ length: formOption.task }, (_, i) => i)

    const result = await taskWorking.onStart(
      formOption.thread,
      formOption.tasks,
      10,
      async (threadIndex, taskIndex) => {
        await onTick(threadIndex, taskIndex, formOption.speed)
      },
      async () => console.log('Before start...'),
      async (isRunning, processedCount, totalCount) => {
        if (isRunning && processedCount === totalCount) {
          isProcess.value = 2
        }
      }
    )

    isProcess.value = result ? 2 : 0
  } catch (e) {
    console.error(e)
  }
}

const onTaskPause = () => {
  taskWorking.onPause((paused) => {
    isPaused.value = paused
  })
}

const onTaskStop = () => {
  for (const tick of ticks.value) {
    if (tick.id) clearInterval(tick.id)
  }

  taskWorking.onStop((isProcessing, isPause) => {
    isProcess.value = 0
    isPaused.value = isPause
    ticks.value = []
    formOption.tasks = []
  })
}
</script>

<template>
  <n-space vertical>
    <n-card title="Tasks">
      <template #header-extra>
        <n-space>
          <n-button v-if="isProcess == 0" type="primary" @click="onTaskRun">
            Start Task
          </n-button>
          <n-button v-if="isProcess == 1" type="warning" @click="onTaskPause">
            {{ isPaused ? 'Continue Task' : 'Pause Task' }}
          </n-button>
          <n-button v-if="isProcess == 1" type="error" @click="onTaskStop">
            Stop Task
          </n-button>
        </n-space>
      </template>

      <n-form label-placement="left" label-width="auto" :model="formOption">
        <n-grid :span="24" :x-gap="24">
          <n-form-item-gi :span="12" label="Task number" path="task">
            <n-input-number v-model:value="formOption.task" />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="Speed" path="speed">
            <n-input-number v-model:value="formOption.speed" />
          </n-form-item-gi>
        </n-grid>

        <n-form-item label="Thread" path="thread">
          <n-input-group>
            <n-select v-model:value="formOption.thread" placeholder="Thread" :options="appStore.threads" />
          </n-input-group>
        </n-form-item>
      </n-form>
    </n-card>

    <n-list v-if="isProcess > 0" bordered>
      <template #header>List tasks</template>
      <n-scrollbar style="max-height: calc(100vh - 445px)" trigger="none">
        <n-list-item v-for="(e, i) in ticks" :key="i">
          <template #prefix>{{ i + 1 }}</template>
          <template #suffix>
            <n-button :loading="!e.done">
              <template #icon>
                <nova-icon :color="appStore.colors?.primaryColor" icon="icon-park-outline:done-all" />
              </template>
            </n-button>
          </template>
          <n-thing :title="`Thread ${e.threadId + 1} - Task: ${e.taskId + 1}`" :title-extra="`Percent: ${e.value}%`" />
        </n-list-item>
      </n-scrollbar>
    </n-list>
  </n-space>
</template>

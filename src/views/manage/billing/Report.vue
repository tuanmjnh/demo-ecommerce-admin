<script setup lang="ts">
import dayjs from 'dayjs'
import { Line } from 'vue-chartjs'
import { useLoadingStore, useBillingStore } from '@/stores'

const loadingStore = useLoadingStore()
const billingStore = useBillingStore()

// vue-chartjs & chartjs imports
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  TimeScale,
} from 'chart.js'

// register chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, Filler, TimeScale)
// local wrapper component to use in template
// const LineChart = defineComponent({
//   name: 'LineChart',
//   props: {
//     // strongly type chartData so it matches Chart.js' required shape (datasets must exist)
//     chartData: { type: Object as PropType<ChartData<'line', number[], unknown>>, required: true },
//     chartOptions: { type: Object as PropType<Record<string, any>>, required: true }
//   },
//   setup(props) {
//     return () => h(Line, {
//       data: props.chartData as ChartData<'line', number[], unknown>,
//       options: props.chartOptions
//     })
//   }
// })

const filters = ref({
  type: 'day' as Common.ReportType,
  status: 'paid' as Common.BillingStatusType,
  month: dayjs().format('YYYY-MM'),
  year: dayjs().year(),
})

const reportData = ref<Array<any>>([])
const summary = ref({ totalOrders: 0, totalAmount: 0 })

// chart reactive data
const chartData = ref({
  labels: [] as string[],
  datasets: [] as any[],
})

const chartOptions = ref<Record<string, any>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#d1d5db' } },
    tooltip: { enabled: true }
  },
  scales: {
    x: { ticks: { color: '#9ca3af' } },
    y: { ticks: { color: '#9ca3af' } },
    y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#9ca3af' } }
  }
})

// helper format
function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

// fetch and build chart
async function fetchReport() {
  try {
    let dateStart: number
    let dateEnd: number

    if (filters.value.type === 'month') {
      const start = dayjs(filters.value.month).startOf('month')
      const end = dayjs(filters.value.month).endOf('month')
      dateStart = start.valueOf()
      dateEnd = end.valueOf()
    } else if (filters.value.type === 'year') {
      const start = dayjs(`${filters.value.year}-01-01`).startOf('year')
      const end = dayjs(`${filters.value.year}-12-31`).endOf('year')
      dateStart = start.valueOf()
      dateEnd = end.valueOf()
    } else {
      // default: last 30 days for day/week view
      dateStart = dayjs().subtract(30, 'day').startOf('day').valueOf()
      dateEnd = dayjs().endOf('day').valueOf()
    }

    // invoke backend (Electron IPC). Replace with http call if using REST.
    const res = await billingStore.getReport({
      type: filters.value.type,
      dateStart,
      dateEnd,
      status: filters.value.status || null,
    })

    if (res && res.status) {
      reportData.value = res.data.items || []
      summary.value = res.data.summary || { totalOrders: 0, totalAmount: 0 }
      buildChart()
    } else {
      reportData.value = []
      summary.value = { totalOrders: 0, totalAmount: 0 }
      buildChart()
    }
  } catch (err) {
    console.error(err)
    reportData.value = []
    summary.value = { totalOrders: 0, totalAmount: 0 }
    buildChart()
  }
}

function buildChart() {
  const labels = reportData.value.map((i: any) => i._id.period)
  const revenue = reportData.value.map((i: any) => i.totalAmount || 0)
  const orders = reportData.value.map((i: any) => i.totalOrders || 0)

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Tổng doanh thu (VND)',
        data: revenue,
        borderColor: '#34d399', // green-400
        backgroundColor: 'rgba(52,211,153,0.15)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Số đơn',
        data: orders,
        borderColor: '#60a5fa', // blue-400
        backgroundColor: 'rgba(96,165,250,0.12)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  }

  // options: keep colors for dark mode
  chartOptions.value = {
    ...chartOptions.value,
    plugins: {
      legend: { labels: { color: '#d1d5db' } },
      tooltip: { enabled: true }
    },
    scales: {
      x: { ticks: { color: '#9ca3af' } },
      y: { beginAtZero: true, ticks: { color: '#9ca3af' } },
      y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#9ca3af' } }
    }
  }
}

onMounted(() => {
  // initial load
  fetchReport()
})
</script>

<template>
  <n-card title="Báo cáo doanh thu">
    <template #header-extra>
      <n-space>
        <n-select v-model:value="filters.type" :options="[
          { label: 'Theo ngày', value: 'day' },
          { label: 'Theo tuần', value: 'week' },
          { label: 'Theo tháng', value: 'month' },
          { label: 'Theo năm', value: 'year' }
        ]" :placeholder="$t('common.select')" class="w-120px" />
        <n-select v-model:value="filters.status" :options="[
          { label: 'Tất cả trạng thái', value: '' },
          { label: 'Đang phục vụ', value: 'serving' },
          { label: 'Đã thanh toán', value: 'paid' },
          { label: 'Đã hủy', value: 'cancelled' }
        ]" :placeholder="$t('common.select')" class="w-150px" />

        <input v-if="filters.type === 'month'" type="month" v-model="filters.month"
          class="bg-gray-800 border border-gray-700 rounded px-2 py-1" />
        <input v-if="filters.type === 'year'" type="number" v-model="filters.year" placeholder="Năm"
          class="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-28" />
        <n-button type="primary" text-color="#fff" @click="fetchReport">
          Xem báo cáo
        </n-button>
      </n-space>
    </template>

    <div v-if="loadingStore.isLoading" class="text-center py-10 text-gray-400">
      Đang tải dữ liệu...
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 class="text-lg font-semibold mb-3">Tổng quan</h2>
          <p>Tổng số đơn: <span class="font-bold text-blue-400">{{ summary.totalOrders }}</span></p>
          <p>Tổng doanh thu: <span class="font-bold text-green-400">{{ formatCurrency(summary.totalAmount) }}</span></p>
        </div>

        <div class="bg-gray-800 rounded-2xl p-6 shadow-lg">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-gray-800 rounded-2xl p-6 shadow-lg overflow-auto">
        <table class="min-w-full text-left border-collapse">
          <thead class="border-b border-gray-700 text-gray-400">
            <tr>
              <th class="px-3 py-2">Thời gian</th>
              <th class="px-3 py-2">Số đơn</th>
              <th class="px-3 py-2">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in reportData" :key="i" class="border-b border-gray-700 hover:bg-gray-700/30">
              <td class="px-3 py-2">{{ item._id.period }}</td>
              <td class="px-3 py-2">{{ item.totalOrders }}</td>
              <td class="px-3 py-2 text-green-400 font-semibold">
                {{ formatCurrency(item.totalAmount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- </div> -->
  </n-card>
</template>
<style scoped>
/* make chart container have height */
.line-chart-container {
  height: 320px;
}
</style>

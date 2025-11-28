// The suffix of the definition of series type is SeriesOption
import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'
// The suffix of component type definition is ComponentOption
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import { useAppStore } from '@/stores'
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts'

import {
  DatasetComponent, //Dataset component
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent, // Built-in data converter components (filter, sort)
} from 'echarts/components'
import * as echarts from 'echarts/core'

import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { useTemplateRef } from 'vue'

// Use ComposeOption to compose an Option type that only has required components and charts
export type ECOption = echarts.ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | ToolboxComponentOption
  | RadarSeriesOption
>

// Register required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  PieChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  ToolboxComponent,
  RadarChart,
])

/**
* Echarts hooks function
* @description Import chart components on demand, unregistered components need to be imported first
*/
export function useEcharts(ref: string, chartOptions: Ref<ECOption>) {
  const el = useTemplateRef<HTMLLIElement>(ref)

  const appStore = useAppStore()

  let chart: echarts.ECharts | null = null

  const { width, height } = useElementSize(el)

  const isRendered = () => Boolean(el && chart)

  async function render() {
    // Do not render if width or height does not exist
    if (!width || !height)
      return

    const chartTheme = appStore.colorMode ? 'dark' : 'light'
    await nextTick()
    if (el) {
      chart = echarts.init(el.value, chartTheme)
      update(chartOptions.value)
    }
  }

  async function update(updateOptions: ECOption) {
    if (isRendered()) {
      chart!.setOption({ backgroundColor: 'transparent', ...updateOptions })
    }
  }

  function destroy() {
    chart?.dispose()
    chart = null
  }

  watch([width, height], async ([newWidth, newHeight]) => {
    if (isRendered() && newWidth && newHeight)
      chart?.resize()
  })

  watch(chartOptions, (newValue) => {
    update(newValue)
  })

  onMounted(() => {
    render()
  })
  onUnmounted(() => {
    destroy()
  })

  return {
    destroy,
    update,
  }
}

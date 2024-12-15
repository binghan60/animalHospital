<template>
  <div>
    <div ref="chartContainer">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js'

Chart.register(BarController, BarElement, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartDataLabels)

export default {
  name: 'ChartComponent',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
    chartType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      chartInstance: null,
    }
  },
  methods: {
    createChart() {
      this.$refs.chartContainer.innerHTML = ''
      const newCanvas = document.createElement('canvas')
      this.$refs.chartContainer.appendChild(newCanvas)
      this.chartInstance = new Chart(newCanvas, {
        type: this.chartType,
        data: this.chartData,
        plugins: [ChartDataLabels],
        options: this.chartOptions,
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.createChart()
    })
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy()
      this.chartInstance = null
    }
  },
}
</script>
<style scoped>
canvas {
  width: 100%;
}
canvas {
  height: 100%;
}
</style>

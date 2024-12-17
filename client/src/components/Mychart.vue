<template>
  <div>
    <LineChart :data="chartData" :options="chartOptions" />
  </div>
</template>
<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
ChartJS.register(LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, ChartDataLabels)
export default {
  name: 'ChartComponent',
  components: {
    LineChart: Line,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  watch: {
    chartData: 'updateChart',
    chartOptions: 'updateChart',
  },
  methods: {
    updateChart() {
      if (this.$refs.chartRef) {
        this.$refs.chartRef.chart.update()
      }
    },
  },
}
</script>

<style scoped>
canvas {
  width: 100%;
  height: 100%;
}

</style>
